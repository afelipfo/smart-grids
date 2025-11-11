import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Routers de gestión de red eléctrica
  grid: router({
    // Obtener todos los nodos
    nodes: publicProcedure.query(async () => {
      const { getAllGridNodes } = await import("./db");
      return await getAllGridNodes();
    }),

    // Obtener todas las líneas de transmisión
    lines: publicProcedure.query(async () => {
      const { getAllTransmissionLines } = await import("./db");
      return await getAllTransmissionLines();
    }),

    // Obtener topología completa de la red
    topology: publicProcedure.query(async () => {
      const { getAllGridNodes, getAllTransmissionLines } = await import("./db");
      const nodes = await getAllGridNodes();
      const lines = await getAllTransmissionLines();
      return { nodes, lines };
    }),
  }),

  // Routers de equipos
  equipment: router({
    // Listar todos los equipos
    list: publicProcedure.query(async () => {
      const { getAllEquipment } = await import("./db");
      return await getAllEquipment();
    }),

    // Obtener equipo por ID
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const { getEquipmentById } = await import("./db");
      return await getEquipmentById(input.id);
    }),

    // Obtener historial de mantenimiento
    maintenanceHistory: publicProcedure.input(z.object({ equipmentId: z.number() })).query(async ({ input }) => {
      const { getEquipmentMaintenanceHistory } = await import("./db");
      return await getEquipmentMaintenanceHistory(input.equipmentId);
    }),
  }),

  // Routers de demanda energética
  demand: router({
    // Obtener historial de demanda
    history: publicProcedure.input(z.object({ hours: z.number().optional() })).query(async ({ input }) => {
      const { getEnergyDemandHistory } = await import("./db");
      return await getEnergyDemandHistory(input.hours || 168);
    }),

    // Obtener predicciones de demanda
    predictions: publicProcedure.input(z.object({ hours: z.number().optional() })).query(async ({ input }) => {
      const { getDemandPredictions } = await import("./db");
      return await getDemandPredictions(input.hours || 24);
    }),

    // Generar nuevas predicciones
    generatePredictions: publicProcedure.input(z.object({ hoursAhead: z.number() })).mutation(async ({ input }) => {
      const { getEnergyDemandHistory, createDemandPrediction } = await import("./db");
      const { EnsembleDemandPredictor } = await import("./ml/demandPrediction");

      // Obtener datos históricos
      const history = await getEnergyDemandHistory(168);
      const historicalData = history.map(h => ({
        timestamp: h.timestamp,
        demand: h.totalDemand,
        temperature: h.temperature ? parseFloat(h.temperature) : undefined,
        dayOfWeek: h.dayOfWeek || undefined,
        isHoliday: h.isHoliday === 1,
      }));

      // Generar predicciones
      const predictor = new EnsembleDemandPredictor();
      const predictions = await predictor.predict(historicalData, input.hoursAhead);

      // Guardar predicciones
      for (const pred of predictions) {
        await createDemandPrediction({
          predictionTimestamp: pred.timestamp,
          predictedDemand: pred.predictedDemand,
          confidenceLower: pred.confidenceLower,
          confidenceUpper: pred.confidenceUpper,
          modelName: pred.modelName,
          modelVersion: "1.0.0",
          actualDemand: null,
          accuracy: null,
        });
      }

      return predictions;
    }),
  }),

  // Routers de optimización de red
  optimization: router({
    // Ejecutar optimización de flujo de potencia
    optimizePowerFlow: publicProcedure.input(z.object({
      minimizeLosses: z.boolean(),
      minimizeCosts: z.boolean(),
      maximizeRenewables: z.boolean(),
      balanceLoad: z.boolean(),
    })).mutation(async ({ input }) => {
      const { getAllGridNodes, getAllTransmissionLines, createNetworkOptimization } = await import("./db");
      const { OptimalPowerFlowOptimizer } = await import("./ml/networkOptimization");

      const nodes = await getAllGridNodes();
      const lines = await getAllTransmissionLines();

      // Convertir a formato del optimizador
      const gridNodes = nodes.map(n => ({
        id: n.id,
        name: n.name,
        voltage: n.voltage,
        capacity: n.capacity,
        currentLoad: Math.round(n.capacity * (0.5 + Math.random() * 0.3)),
      }));

      const transmissionLines = lines.map(l => ({
        id: l.id,
        fromNodeId: l.fromNodeId,
        toNodeId: l.toNodeId,
        capacity: l.capacity,
        currentFlow: Math.round(l.capacity * (0.4 + Math.random() * 0.4)),
        resistance: parseFloat(l.resistance || "0.05"),
      }));

      const optimizer = new OptimalPowerFlowOptimizer();
      const result = await optimizer.optimize(gridNodes, transmissionLines, input);

      // Guardar resultado
      await createNetworkOptimization({
        optimizationType: "load_balancing",
        status: "completed",
        inputParameters: JSON.stringify(input),
        outputResults: JSON.stringify(result),
        savingsEstimated: result.estimatedSavings,
        executionTime: result.executionTime,
        createdBy: null,
        completedAt: new Date(),
      });

      return result;
    }),

    // Obtener historial de optimizaciones
    history: publicProcedure.input(z.object({ limit: z.number().optional() })).query(async ({ input }) => {
      const { getNetworkOptimizations } = await import("./db");
      return await getNetworkOptimizations(input.limit || 10);
    }),
  }),

  // Routers de mantenimiento predictivo
  maintenance: router({
    // Predecir fallos de equipos
    predictFailures: publicProcedure.query(async () => {
      const { getAllEquipment, updateEquipmentHealth } = await import("./db");
      const { RandomForestPredictor } = await import("./ml/predictiveMaintenance");

      const equipment = await getAllEquipment();
      const predictor = new RandomForestPredictor();

      const predictions = [];
      for (const eq of equipment) {
        const equipmentData = {
          id: eq.id,
          name: eq.name,
          type: eq.equipmentType,
          age: eq.installationDate ? Math.floor((Date.now() - eq.installationDate.getTime()) / (365 * 24 * 60 * 60 * 1000)) : 5,
          lastMaintenanceDate: eq.lastMaintenanceDate || new Date(),
          operatingHours: 50000 + Math.random() * 30000,
          averageLoad: 500 + Math.random() * 500,
          maxLoad: 1000,
          temperature: 60 + Math.random() * 30,
          vibration: 2 + Math.random() * 5,
          failureHistory: Math.floor(Math.random() * 3),
        };

        const prediction = await predictor.predictFailure(equipmentData);
        predictions.push(prediction);

        // Actualizar salud del equipo en la base de datos
        await updateEquipmentHealth(eq.id, 100 - prediction.failureProbability, prediction.failureProbability);
      }

      return predictions;
    }),

    // Generar cronograma de mantenimiento
    generateSchedule: publicProcedure.input(z.object({
      maxDailyDowntime: z.number(),
      availableBudget: z.number(),
      maintenanceTeams: z.number(),
    })).mutation(async ({ input }) => {
      const { getAllEquipment } = await import("./db");
      const { RandomForestPredictor, MaintenanceScheduleOptimizer } = await import("./ml/predictiveMaintenance");

      const equipment = await getAllEquipment();
      const predictor = new RandomForestPredictor();
      const optimizer = new MaintenanceScheduleOptimizer();

      // Generar predicciones
      const predictions = [];
      for (const eq of equipment) {
        const equipmentData = {
          id: eq.id,
          name: eq.name,
          type: eq.equipmentType,
          age: eq.installationDate ? Math.floor((Date.now() - eq.installationDate.getTime()) / (365 * 24 * 60 * 60 * 1000)) : 5,
          lastMaintenanceDate: eq.lastMaintenanceDate || new Date(),
          operatingHours: 50000 + Math.random() * 30000,
          averageLoad: 500 + Math.random() * 500,
          maxLoad: 1000,
          temperature: 60 + Math.random() * 30,
          vibration: 2 + Math.random() * 5,
          failureHistory: Math.floor(Math.random() * 3),
        };

        const prediction = await predictor.predictFailure(equipmentData);
        predictions.push(prediction);
      }

      // Optimizar cronograma
      const schedule = await optimizer.optimizeSchedule(predictions, input);

      return { predictions, schedule };
    }),
  }),

  // Routers de energía renovable
  renewable: router({
    // Obtener generación actual
    currentGeneration: publicProcedure.query(async () => {
      const { getAllGridNodes } = await import("./db");
      const nodes = await getAllGridNodes();
      
      // Filtrar nodos renovables
      const renewableNodes = nodes.filter(n => 
        n.name.toLowerCase().includes("solar") || 
        n.name.toLowerCase().includes("eólica") || 
        n.name.toLowerCase().includes("wind")
      );

      return renewableNodes.map(n => ({
        id: n.id,
        name: n.name,
        type: n.name.toLowerCase().includes("solar") ? "solar" : "wind",
        capacity: n.capacity,
        currentGeneration: Math.round(n.capacity * (0.3 + Math.random() * 0.5)),
        efficiency: 85 + Math.floor(Math.random() * 10),
      }));
    }),

    // Generar predicciones de generación
    predictGeneration: publicProcedure.input(z.object({
      sourceId: z.number(),
      sourceType: z.enum(["solar", "wind"]),
      hoursAhead: z.number(),
    })).mutation(async ({ input }) => {
      const { SolarGenerationPredictor, WindGenerationPredictor, WeatherForecastGenerator } = await import("./ml/renewableManagement");
      const { getGridNodeById } = await import("./db");

      const node = await getGridNodeById(input.sourceId);
      if (!node) throw new Error("Nodo no encontrado");

      const source = {
        id: node.id,
        nodeId: node.id,
        type: input.sourceType,
        capacity: node.capacity,
        currentGeneration: Math.round(node.capacity * 0.6),
        efficiency: 88,
      };

      // Generar pronóstico meteorológico
      const weatherGen = new WeatherForecastGenerator();
      const forecast = weatherGen.generateForecast(input.hoursAhead);

      // Predecir generación
      let predictions;
      if (input.sourceType === "solar") {
        const predictor = new SolarGenerationPredictor();
        predictions = await predictor.predict(source, forecast, input.hoursAhead);
      } else {
        const predictor = new WindGenerationPredictor();
        predictions = await predictor.predict(source, forecast, input.hoursAhead);
      }

      return predictions;
    }),

    // Optimizar despacho de renovables
    optimizeDispatch: publicProcedure.input(z.object({
      targetDemand: z.number(),
    })).mutation(async ({ input }) => {
      const { RenewableDispatchOptimizer, WeatherForecastGenerator } = await import("./ml/renewableManagement");
      const { getAllGridNodes } = await import("./db");

      const nodes = await getAllGridNodes();
      const renewableNodes = nodes.filter(n => 
        n.name.toLowerCase().includes("solar") || 
        n.name.toLowerCase().includes("eólica") || 
        n.name.toLowerCase().includes("wind")
      );

      const sources = renewableNodes.map(n => ({
        id: n.id,
        nodeId: n.id,
        type: (n.name.toLowerCase().includes("solar") ? "solar" : "wind") as "solar" | "wind" | "hydro",
        capacity: n.capacity,
        currentGeneration: Math.round(n.capacity * (0.3 + Math.random() * 0.5)),
        efficiency: 85 + Math.floor(Math.random() * 10),
      }));

      // Generar predicciones simuladas
      const weatherGen = new WeatherForecastGenerator();
      const forecast = weatherGen.generateForecast(24);
      
      const predictions = sources.flatMap(source => 
        forecast.slice(0, 4).map(weather => ({
          sourceId: source.id,
          timestamp: weather.timestamp,
          predictedPower: Math.round(source.capacity * (0.4 + Math.random() * 0.4)),
          confidenceLower: 0,
          confidenceUpper: 0,
          weatherConditions: "",
        }))
      );

      const optimizer = new RenewableDispatchOptimizer();
      const recommendations = await optimizer.optimize(sources, predictions, input.targetDemand);

      return recommendations;
    }),
  }),

  // Routers de alertas
  alerts: router({
    // Obtener alertas activas
    active: publicProcedure.query(async () => {
      const { getActiveAlerts } = await import("./db");
      return await getActiveAlerts();
    }),

    // Reconocer alerta
    acknowledge: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const { acknowledgeAlert } = await import("./db");
      await acknowledgeAlert(input.id, ctx.user.id);
      return { success: true };
    }),
  }),

  // Routers de mediciones
  measurements: router({
    // Obtener mediciones recientes
    recent: publicProcedure.input(z.object({ limit: z.number().optional() })).query(async ({ input }) => {
      const { getRecentMeasurements } = await import("./db");
      return await getRecentMeasurements(input.limit || 100);
    }),
  }),

  // Router de APIs externas de Colombia
  networkMap: router({
    getSubstations: publicProcedure.query(async () => {
      // Importar datos de subestaciones
      const { colombiaSubstations } = await import('./data/colombiaSubstations.js');
      
      // Simular datos en tiempo real
      return colombiaSubstations.map((sub: any) => ({
        ...sub,
        currentLoad: Math.round(sub.capacity * (0.3 + Math.random() * 0.5)), // 30-80% de capacidad
        status: Math.random() > 0.9 ? 'maintenance' : 'operational' as const,
        temperature: Math.round(25 + Math.random() * 15), // 25-40°C
      }));
    }),
    
    getTransmissionLines: publicProcedure.query(async () => {
      // Importar datos de líneas
      const { transmissionLines } = await import('./data/colombiaSubstations.js');
      
      // Simular datos en tiempo real
      return transmissionLines.map((line: any) => ({
        ...line,
        currentFlow: Math.round(line.capacity * (0.4 + Math.random() * 0.4)), // 40-80% de capacidad
        status: Math.random() > 0.95 ? 'overloaded' : 
                Math.random() > 0.8 ? 'congested' : 'normal' as const,
      }));
    }),
  }),

  colombia: router({
    // Obtener demanda del SIN (Sistema Interconectado Nacional)
    demand: publicProcedure
      .input(z.object({ days: z.number().optional().default(7) }))
      .query(async ({ input }) => {
        const { fetchColombianDemand } = await import("./services/xmApiService");
        return await fetchColombianDemand(input.days);
      }),

    // Obtener generación por tipo de fuente
    generation: publicProcedure
      .input(z.object({ days: z.number().optional().default(7) }))
      .query(async ({ input }) => {
        const { fetchColombianGeneration } = await import("./services/xmApiService");
        return await fetchColombianGeneration(input.days);
      }),

    // Obtener precios de bolsa
    prices: publicProcedure
      .input(z.object({ days: z.number().optional().default(7) }))
      .query(async ({ input }) => {
        const { fetchColombianPrices } = await import("./services/xmApiService");
        return await fetchColombianPrices(input.days);
      }),

    // Obtener emisiones de CO2
    emissions: publicProcedure
      .input(z.object({ days: z.number().optional().default(30) }))
      .query(async ({ input }) => {
        const { fetchColombianEmissions } = await import("./services/xmApiService");
        return await fetchColombianEmissions(input.days);
      }),

    // Obtener perfil energético de Colombia (World Bank)
    energyProfile: publicProcedure.query(async () => {
      const { getColombiaEnergyStats } = await import("./services/worldBankService");
      return await getColombiaEnergyStats();
    }),

    // Comparación regional de renovables
    regionalRenewables: publicProcedure.query(async () => {
      const { compareRegionalRenewables } = await import("./services/worldBankService");
      return await compareRegionalRenewables();
    }),

    // Comparación regional de emisiones
    regionalEmissions: publicProcedure.query(async () => {
      const { compareRegionalEmissions } = await import("./services/worldBankService");
      return await compareRegionalEmissions();
    }),
  }),

  // Router de aplicación
  app: router({
    // Inicializar datos del sistema
    initialize: publicProcedure.mutation(async () => {
      const { initializeSystemData } = await import("./utils/initializeData");
      await initializeSystemData();
      return { success: true };
    }),

    // Estadísticas generales del sistema
    stats: publicProcedure.query(async () => {
      const { getAllGridNodes, getAllEquipment, getActiveAlerts, getEnergyDemandHistory } = await import("./db");
      
      const nodes = await getAllGridNodes();
      const equipment = await getAllEquipment();
      const alerts = await getActiveAlerts();
      const recentDemand = await getEnergyDemandHistory(24);

      const totalCapacity = nodes.reduce((sum, n) => sum + n.capacity, 0);
      const currentDemand = recentDemand.length > 0 ? recentDemand[recentDemand.length - 1].totalDemand : 0;
      const operationalEquipment = equipment.filter(e => e.status === "operational").length;
      const criticalAlerts = alerts.filter(a => a.severity === "critical").length;

      return {
        totalNodes: nodes.length,
        totalCapacity,
        currentDemand,
        loadFactor: totalCapacity > 0 ? Math.round((currentDemand / totalCapacity) * 100) : 0,
        totalEquipment: equipment.length,
        operationalEquipment,
        activeAlerts: alerts.length,
        criticalAlerts,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
