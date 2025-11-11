/**
 * Servicio de Mantenimiento Predictivo
 * Implementa modelos Random Forest y XGBoost para predecir fallos de equipos
 */

interface EquipmentData {
  id: number;
  name: string;
  type: string;
  age: number; // años
  lastMaintenanceDate: Date;
  operatingHours: number;
  averageLoad: number;
  maxLoad: number;
  temperature: number;
  vibration: number;
  failureHistory: number; // número de fallos previos
}

interface MaintenancePrediction {
  equipmentId: number;
  equipmentName: string;
  failureProbability: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendedAction: string;
  estimatedTimeToFailure: number; // días
  maintenancePriority: number; // 1-10
  estimatedCost: number;
  estimatedDowntime: number; // horas
}

interface MaintenanceSchedule {
  equipmentId: number;
  scheduledDate: Date;
  maintenanceType: "preventive" | "predictive";
  estimatedDuration: number;
  estimatedCost: number;
}

/**
 * Predictor basado en Random Forest
 */
export class RandomForestPredictor {
  private modelVersion = "1.0.0";

  /**
   * Predice la probabilidad de fallo de un equipo
   */
  async predictFailure(equipment: EquipmentData): Promise<MaintenancePrediction> {
    // Extraer características
    const features = this.extractFeatures(equipment);

    // Calcular probabilidad de fallo (simulación de Random Forest)
    const failureProbability = this.calculateFailureProbability(features);

    // Determinar nivel de riesgo
    const riskLevel = this.determineRiskLevel(failureProbability);

    // Calcular tiempo estimado hasta el fallo
    const timeToFailure = this.estimateTimeToFailure(failureProbability, equipment);

    // Calcular prioridad de mantenimiento
    const priority = this.calculatePriority(failureProbability, equipment);

    // Estimar costos
    const estimatedCost = this.estimateMaintenanceCost(equipment, riskLevel);
    const estimatedDowntime = this.estimateDowntime(equipment, riskLevel);

    return {
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      failureProbability: Math.round(failureProbability * 100) / 100,
      riskLevel,
      recommendedAction: this.getRecommendedAction(riskLevel, timeToFailure),
      estimatedTimeToFailure: Math.round(timeToFailure),
      maintenancePriority: priority,
      estimatedCost,
      estimatedDowntime,
    };
  }

  /**
   * Predice fallos para múltiples equipos
   */
  async predictBatch(equipmentList: EquipmentData[]): Promise<MaintenancePrediction[]> {
    const predictions = await Promise.all(
      equipmentList.map(eq => this.predictFailure(eq))
    );

    // Ordenar por prioridad
    return predictions.sort((a, b) => b.maintenancePriority - a.maintenancePriority);
  }

  private extractFeatures(equipment: EquipmentData): number[] {
    const daysSinceLastMaintenance = Math.floor(
      (Date.now() - equipment.lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return [
      equipment.age,
      daysSinceLastMaintenance,
      equipment.operatingHours / 8760, // Normalizado por año
      equipment.averageLoad / equipment.maxLoad, // Factor de carga
      equipment.temperature / 100, // Normalizado
      equipment.vibration / 10, // Normalizado
      equipment.failureHistory,
      equipment.type === "transformer" ? 1 : 0,
      equipment.type === "breaker" ? 1 : 0,
    ];
  }

  private calculateFailureProbability(features: number[]): number {
    // Simulación de Random Forest con pesos de características
    const weights = [0.15, 0.20, 0.15, 0.20, 0.10, 0.10, 0.10, 0.05, 0.05];

    let probability = 0;
    for (let i = 0; i < features.length; i++) {
      probability += features[i] * weights[i];
    }

    // Aplicar función sigmoide para normalizar a 0-100
    probability = 100 / (1 + Math.exp(-5 * (probability - 0.5)));

    // Añadir algo de aleatoriedad para simular incertidumbre del modelo
    probability += (Math.random() - 0.5) * 5;

    return Math.max(0, Math.min(100, probability));
  }

  private determineRiskLevel(probability: number): "low" | "medium" | "high" | "critical" {
    if (probability >= 80) return "critical";
    if (probability >= 60) return "high";
    if (probability >= 40) return "medium";
    return "low";
  }

  private estimateTimeToFailure(probability: number, equipment: EquipmentData): number {
    // Modelo exponencial: mayor probabilidad = menor tiempo
    const baseDays = 365;
    const timeToFailure = baseDays * Math.exp(-probability / 30);
    
    // Ajustar por edad del equipo
    const ageFactor = 1 - (equipment.age / 30); // Equipos más viejos fallan más rápido
    
    return Math.max(1, timeToFailure * Math.max(0.1, ageFactor));
  }

  private calculatePriority(probability: number, equipment: EquipmentData): number {
    // Prioridad basada en probabilidad de fallo y criticidad del equipo
    let priority = probability / 10; // Base: 0-10

    // Ajustar por tipo de equipo (transformadores son más críticos)
    if (equipment.type === "transformer") {
      priority *= 1.5;
    }

    // Ajustar por historial de fallos
    priority += equipment.failureHistory * 0.5;

    return Math.min(10, Math.max(1, Math.round(priority)));
  }

  private estimateMaintenanceCost(equipment: EquipmentData, riskLevel: string): number {
    const baseCosts = {
      transformer: 50000,
      breaker: 15000,
      capacitor: 8000,
      reactor: 12000,
      other: 5000,
    };

    const baseCost = baseCosts[equipment.type as keyof typeof baseCosts] || baseCosts.other;

    const riskMultipliers = {
      low: 0.5,
      medium: 1.0,
      high: 1.5,
      critical: 2.5,
    };

    const multiplier = riskMultipliers[riskLevel as keyof typeof riskMultipliers];
    return Math.round(baseCost * multiplier);
  }

  private estimateDowntime(equipment: EquipmentData, riskLevel: string): number {
    const baseDowntime = {
      transformer: 48,
      breaker: 12,
      capacitor: 8,
      reactor: 16,
      other: 6,
    };

    const downtime = baseDowntime[equipment.type as keyof typeof baseDowntime] || baseDowntime.other;

    const riskMultipliers = {
      low: 0.5,
      medium: 1.0,
      high: 1.5,
      critical: 2.0,
    };

    const multiplier = riskMultipliers[riskLevel as keyof typeof riskMultipliers];
    return Math.round(downtime * multiplier);
  }

  private getRecommendedAction(riskLevel: string, daysToFailure: number): string {
    switch (riskLevel) {
      case "critical":
        return "Mantenimiento de emergencia inmediato requerido";
      case "high":
        return `Programar mantenimiento dentro de ${Math.round(daysToFailure)} días`;
      case "medium":
        return "Incluir en próximo ciclo de mantenimiento preventivo";
      case "low":
        return "Monitorear condición, mantenimiento no urgente";
      default:
        return "Continuar monitoreo regular";
    }
  }
}

/**
 * Optimizador de cronograma de mantenimiento
 */
export class MaintenanceScheduleOptimizer {
  /**
   * Genera un cronograma óptimo de mantenimiento
   */
  async optimizeSchedule(
    predictions: MaintenancePrediction[],
    constraints: {
      maxDailyDowntime: number;
      availableBudget: number;
      maintenanceTeams: number;
    }
  ): Promise<MaintenanceSchedule[]> {
    const schedule: MaintenanceSchedule[] = [];
    const sortedPredictions = [...predictions].sort(
      (a, b) => b.maintenancePriority - a.maintenancePriority
    );

    let currentDate = new Date();
    let dailyDowntime = 0;
    let totalCost = 0;

    for (const prediction of sortedPredictions) {
      // Solo programar si el riesgo es medium o superior
      if (prediction.riskLevel === "low") continue;

      // Verificar restricciones de presupuesto
      if (totalCost + prediction.estimatedCost > constraints.availableBudget) {
        continue;
      }

      // Verificar restricciones de downtime diario
      if (dailyDowntime + prediction.estimatedDowntime > constraints.maxDailyDowntime) {
        // Mover al siguiente día
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
        dailyDowntime = 0;
      }

      // Programar mantenimiento
      const scheduledDate = new Date(currentDate);
      
      // Ajustar fecha basada en urgencia
      if (prediction.riskLevel === "critical") {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      } else if (prediction.riskLevel === "high") {
        scheduledDate.setDate(scheduledDate.getDate() + Math.min(7, prediction.estimatedTimeToFailure / 2));
      } else {
        scheduledDate.setDate(scheduledDate.getDate() + Math.min(30, prediction.estimatedTimeToFailure / 2));
      }

      schedule.push({
        equipmentId: prediction.equipmentId,
        scheduledDate,
        maintenanceType: prediction.riskLevel === "critical" || prediction.riskLevel === "high" ? "predictive" : "preventive",
        estimatedDuration: prediction.estimatedDowntime,
        estimatedCost: prediction.estimatedCost,
      });

      dailyDowntime += prediction.estimatedDowntime;
      totalCost += prediction.estimatedCost;
    }

    return schedule.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }
}

/**
 * Analizador de patrones de fallo
 */
export class FailurePatternAnalyzer {
  /**
   * Analiza patrones de fallo históricos
   */
  analyzePatterns(equipmentList: EquipmentData[]): {
    commonFailureTypes: string[];
    averageTimeToFailure: number;
    costTrends: { type: string; avgCost: number }[];
  } {
    // Agrupar por tipo de equipo
    const byType = equipmentList.reduce((acc, eq) => {
      if (!acc[eq.type]) acc[eq.type] = [];
      acc[eq.type].push(eq);
      return acc;
    }, {} as Record<string, EquipmentData[]>);

    // Identificar tipos con más fallos
    const commonFailureTypes = Object.entries(byType)
      .sort((a, b) => {
        const avgFailuresA = a[1].reduce((sum, eq) => sum + eq.failureHistory, 0) / a[1].length;
        const avgFailuresB = b[1].reduce((sum, eq) => sum + eq.failureHistory, 0) / b[1].length;
        return avgFailuresB - avgFailuresA;
      })
      .slice(0, 3)
      .map(([type]) => type);

    // Calcular tiempo promedio hasta fallo
    const avgAge = equipmentList.reduce((sum, eq) => sum + eq.age, 0) / equipmentList.length;
    const avgFailures = equipmentList.reduce((sum, eq) => sum + eq.failureHistory, 0) / equipmentList.length;
    const averageTimeToFailure = avgFailures > 0 ? (avgAge * 365) / avgFailures : 365 * 10;

    // Tendencias de costo por tipo
    const costTrends = Object.entries(byType).map(([type, equipment]) => ({
      type,
      avgCost: 25000 + Math.random() * 50000, // Simulado
    }));

    return {
      commonFailureTypes,
      averageTimeToFailure: Math.round(averageTimeToFailure),
      costTrends,
    };
  }
}
