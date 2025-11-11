/**
 * Generador de datos sintéticos para el sistema de gestión de redes eléctricas
 * Genera datos realistas para pruebas y demostración
 */

import {
  InsertGridNode,
  InsertTransmissionLine,
  InsertEquipment,
  InsertMeasurement,
  InsertEnergyDemand,
  InsertRenewableGeneration,
} from "../../drizzle/schema";

/**
 * Genera nodos de red sintéticos
 */
export function generateGridNodes(): InsertGridNode[] {
  const nodes: InsertGridNode[] = [
    {
      name: "Subestación Central",
      nodeType: "substation",
      latitude: "40.7128",
      longitude: "-74.0060",
      voltage: 345,
      capacity: 2000,
      status: "active",
    },
    {
      name: "Subestación Norte",
      nodeType: "substation",
      latitude: "40.7580",
      longitude: "-73.9855",
      voltage: 230,
      capacity: 1500,
      status: "active",
    },
    {
      name: "Subestación Sur",
      nodeType: "substation",
      latitude: "40.6782",
      longitude: "-73.9442",
      voltage: 230,
      capacity: 1500,
      status: "active",
    },
    {
      name: "Planta Solar Este",
      nodeType: "generator",
      latitude: "40.7489",
      longitude: "-73.9680",
      voltage: 138,
      capacity: 500,
      status: "active",
    },
    {
      name: "Parque Eólico Oeste",
      nodeType: "generator",
      latitude: "40.7061",
      longitude: "-74.0087",
      voltage: 138,
      capacity: 800,
      status: "active",
    },
    {
      name: "Zona Industrial",
      nodeType: "load",
      latitude: "40.7282",
      longitude: "-73.9942",
      voltage: 138,
      capacity: 1200,
      status: "active",
    },
    {
      name: "Zona Residencial A",
      nodeType: "load",
      latitude: "40.7489",
      longitude: "-73.9680",
      voltage: 69,
      capacity: 600,
      status: "active",
    },
    {
      name: "Zona Comercial",
      nodeType: "load",
      latitude: "40.7614",
      longitude: "-73.9776",
      voltage: 69,
      capacity: 800,
      status: "active",
    },
  ];

  return nodes;
}

/**
 * Genera líneas de transmisión entre nodos
 */
export function generateTransmissionLines(): InsertTransmissionLine[] {
  const lines: InsertTransmissionLine[] = [
    {
      name: "Línea Central-Norte",
      fromNodeId: 1,
      toNodeId: 2,
      capacity: 1500,
      length: 15,
      resistance: "0.05",
      status: "active",
    },
    {
      name: "Línea Central-Sur",
      fromNodeId: 1,
      toNodeId: 3,
      capacity: 1500,
      length: 12,
      resistance: "0.04",
      status: "active",
    },
    {
      name: "Línea Solar-Central",
      fromNodeId: 4,
      toNodeId: 1,
      capacity: 500,
      length: 8,
      resistance: "0.03",
      status: "active",
    },
    {
      name: "Línea Eólica-Central",
      fromNodeId: 5,
      toNodeId: 1,
      capacity: 800,
      length: 10,
      resistance: "0.035",
      status: "active",
    },
    {
      name: "Línea Norte-Industrial",
      fromNodeId: 2,
      toNodeId: 6,
      capacity: 1200,
      length: 6,
      resistance: "0.025",
      status: "active",
    },
    {
      name: "Línea Norte-Residencial",
      fromNodeId: 2,
      toNodeId: 7,
      capacity: 600,
      length: 5,
      resistance: "0.02",
      status: "active",
    },
    {
      name: "Línea Sur-Comercial",
      fromNodeId: 3,
      toNodeId: 8,
      capacity: 800,
      length: 7,
      resistance: "0.03",
      status: "active",
    },
  ];

  return lines;
}

/**
 * Genera equipos de red
 */
export function generateEquipment(): InsertEquipment[] {
  const now = new Date();
  const equipment: InsertEquipment[] = [];

  // Transformadores
  for (let i = 1; i <= 8; i++) {
    const installDate = new Date(now);
    installDate.setFullYear(installDate.getFullYear() - Math.floor(Math.random() * 15));
    
    const lastMaintenance = new Date(now);
    lastMaintenance.setMonth(lastMaintenance.getMonth() - Math.floor(Math.random() * 12));

    const nextMaintenance = new Date(lastMaintenance);
    nextMaintenance.setMonth(nextMaintenance.getMonth() + 6);

    equipment.push({
      name: `Transformador T${i}`,
      equipmentType: "transformer",
      nodeId: i,
      manufacturer: ["ABB", "Siemens", "GE"][Math.floor(Math.random() * 3)],
      model: `TR-${1000 + i * 100}`,
      installationDate: installDate,
      lastMaintenanceDate: lastMaintenance,
      nextMaintenanceDate: nextMaintenance,
      status: "operational",
      healthScore: 75 + Math.floor(Math.random() * 25),
      failureProbability: Math.floor(Math.random() * 30),
    });
  }

  // Interruptores
  for (let i = 1; i <= 7; i++) {
    const installDate = new Date(now);
    installDate.setFullYear(installDate.getFullYear() - Math.floor(Math.random() * 10));

    equipment.push({
      name: `Interruptor I${i}`,
      equipmentType: "breaker",
      nodeId: (i % 8) + 1,
      manufacturer: ["Schneider", "ABB", "Eaton"][Math.floor(Math.random() * 3)],
      model: `BR-${500 + i * 50}`,
      installationDate: installDate,
      lastMaintenanceDate: new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      nextMaintenanceDate: new Date(now.getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000),
      status: Math.random() > 0.9 ? "degraded" : "operational",
      healthScore: 70 + Math.floor(Math.random() * 30),
      failureProbability: Math.floor(Math.random() * 40),
    });
  }

  return equipment;
}

/**
 * Genera datos de demanda energética histórica
 */
export function generateEnergyDemandHistory(days: number = 7): InsertEnergyDemand[] {
  const data: InsertEnergyDemand[] = [];
  const now = new Date();

  for (let day = days; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - day);
      timestamp.setHours(hour, 0, 0, 0);

      const dayOfWeek = timestamp.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = Math.random() < 0.02; // 2% de días son festivos

      // Demanda base según hora del día
      let baseDemand = 2000; // MW
      
      // Patrón diario
      if (hour >= 0 && hour < 6) {
        baseDemand *= 0.6; // Madrugada - baja demanda
      } else if (hour >= 6 && hour < 9) {
        baseDemand *= 0.9; // Mañana temprano
      } else if (hour >= 9 && hour < 17) {
        baseDemand *= 1.2; // Horas pico laborales
      } else if (hour >= 17 && hour < 22) {
        baseDemand *= 1.3; // Pico vespertino
      } else {
        baseDemand *= 0.8; // Noche
      }

      // Ajuste por fin de semana
      if (isWeekend || isHoliday) {
        baseDemand *= 0.75;
      }

      // Variación aleatoria
      baseDemand *= (0.95 + Math.random() * 0.1);

      const totalDemand = Math.round(baseDemand);
      const residentialDemand = Math.round(totalDemand * (0.35 + Math.random() * 0.1));
      const commercialDemand = Math.round(totalDemand * (0.30 + Math.random() * 0.1));
      const industrialDemand = totalDemand - residentialDemand - commercialDemand;

      // Temperatura simulada
      const tempBase = 20;
      const tempVariation = 10 * Math.sin(((hour - 6) / 24) * 2 * Math.PI);
      const temperature = (tempBase + tempVariation + (Math.random() - 0.5) * 3).toFixed(1);

      data.push({
        timestamp,
        totalDemand,
        residentialDemand,
        commercialDemand,
        industrialDemand,
        temperature,
        dayOfWeek,
        isHoliday: isHoliday ? 1 : 0,
      });
    }
  }

  return data;
}

/**
 * Genera datos de generación renovable
 */
export function generateRenewableGeneration(nodeId: number, sourceType: "solar" | "wind", hours: number = 24): InsertRenewableGeneration[] {
  const data: InsertRenewableGeneration[] = [];
  const now = new Date();

  const capacity = sourceType === "solar" ? 500 : 800;

  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now);
    timestamp.setHours(timestamp.getHours() - (hours - i), 0, 0, 0);

    let generatedPower = 0;
    const hour = timestamp.getHours();

    if (sourceType === "solar") {
      // Generación solar solo durante el día
      if (hour >= 6 && hour <= 18) {
        const solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
        const cloudFactor = 0.7 + Math.random() * 0.3; // Variabilidad por nubes
        generatedPower = capacity * solarFactor * cloudFactor;
      }
    } else {
      // Generación eólica más variable
      const windFactor = 0.3 + Math.random() * 0.6;
      generatedPower = capacity * windFactor;
    }

    const efficiency = 85 + Math.floor(Math.random() * 10);

    data.push({
      nodeId,
      sourceType,
      timestamp,
      generatedPower: Math.round(generatedPower),
      capacity,
      efficiency,
      weatherCondition: sourceType === "solar" 
        ? (generatedPower > capacity * 0.7 ? "Despejado" : "Parcialmente nublado")
        : `Viento ${(5 + Math.random() * 10).toFixed(1)} m/s`,
    });
  }

  return data;
}

/**
 * Genera mediciones en tiempo real
 */
export function generateRealtimeMeasurements(nodeIds: number[], lineIds: number[]): InsertMeasurement[] {
  const measurements: InsertMeasurement[] = [];
  const now = new Date();

  // Mediciones de nodos
  for (const nodeId of nodeIds) {
    // Voltaje
    measurements.push({
      nodeId,
      lineId: null,
      measurementType: "voltage",
      value: (220 + (Math.random() - 0.5) * 20).toFixed(2),
      unit: "kV",
      timestamp: now,
    });

    // Potencia
    measurements.push({
      nodeId,
      lineId: null,
      measurementType: "power",
      value: (500 + Math.random() * 1000).toFixed(2),
      unit: "MW",
      timestamp: now,
    });

    // Frecuencia
    measurements.push({
      nodeId,
      lineId: null,
      measurementType: "frequency",
      value: (60 + (Math.random() - 0.5) * 0.2).toFixed(3),
      unit: "Hz",
      timestamp: now,
    });
  }

  // Mediciones de líneas
  for (const lineId of lineIds) {
    // Corriente
    measurements.push({
      nodeId: null,
      lineId,
      measurementType: "current",
      value: (200 + Math.random() * 800).toFixed(2),
      unit: "A",
      timestamp: now,
    });

    // Temperatura
    measurements.push({
      nodeId: null,
      lineId,
      measurementType: "temperature",
      value: (40 + Math.random() * 30).toFixed(1),
      unit: "°C",
      timestamp: now,
    });
  }

  return measurements;
}

/**
 * Genera un snapshot completo del sistema
 */
export function generateSystemSnapshot() {
  return {
    nodes: generateGridNodes(),
    lines: generateTransmissionLines(),
    equipment: generateEquipment(),
    demandHistory: generateEnergyDemandHistory(7),
    solarGeneration: generateRenewableGeneration(4, "solar", 168),
    windGeneration: generateRenewableGeneration(5, "wind", 168),
    measurements: generateRealtimeMeasurements([1, 2, 3, 4, 5, 6, 7, 8], [1, 2, 3, 4, 5, 6, 7]),
  };
}
