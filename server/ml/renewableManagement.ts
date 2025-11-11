/**
 * Servicio de Gestión de Recursos Renovables
 * Predice generación solar y eólica, optimiza despacho
 */

interface RenewableSource {
  id: number;
  nodeId: number;
  type: "solar" | "wind" | "hydro";
  capacity: number; // MW
  currentGeneration: number;
  efficiency: number;
}

interface WeatherData {
  timestamp: Date;
  temperature: number;
  cloudCover: number; // 0-100%
  windSpeed: number; // m/s
  windDirection: number; // grados
  humidity: number;
  precipitation: number;
}

interface GenerationPrediction {
  sourceId: number;
  timestamp: Date;
  predictedPower: number;
  confidenceLower: number;
  confidenceUpper: number;
  weatherConditions: string;
}

interface DispatchRecommendation {
  sourceId: number;
  recommendedOutput: number;
  priority: number;
  reason: string;
}

/**
 * Predictor de generación solar
 */
export class SolarGenerationPredictor {
  /**
   * Predice generación solar basada en pronóstico meteorológico
   */
  async predict(
    source: RenewableSource,
    weatherForecast: WeatherData[],
    hoursAhead: number = 24
  ): Promise<GenerationPrediction[]> {
    const predictions: GenerationPrediction[] = [];

    for (let i = 0; i < Math.min(hoursAhead, weatherForecast.length); i++) {
      const weather = weatherForecast[i];
      const hour = weather.timestamp.getHours();

      // Factor de hora del día (radiación solar)
      let solarFactor = 0;
      if (hour >= 6 && hour <= 18) {
        // Curva sinusoidal para simular radiación solar
        const hourAngle = ((hour - 6) / 12) * Math.PI;
        solarFactor = Math.sin(hourAngle);
      }

      // Factor de nubosidad (reduce generación)
      const cloudFactor = 1 - (weather.cloudCover / 100) * 0.7;

      // Factor de temperatura (eficiencia disminuye con alta temperatura)
      const tempFactor = 1 - Math.max(0, (weather.temperature - 25) / 100);

      // Generación predicha
      const predicted = source.capacity * solarFactor * cloudFactor * tempFactor * source.efficiency / 100;

      // Intervalo de confianza (mayor incertidumbre con más nubes)
      const uncertainty = predicted * (0.1 + weather.cloudCover / 200);

      predictions.push({
        sourceId: source.id,
        timestamp: weather.timestamp,
        predictedPower: Math.max(0, Math.round(predicted)),
        confidenceLower: Math.max(0, Math.round(predicted - uncertainty)),
        confidenceUpper: Math.round(predicted + uncertainty),
        weatherConditions: this.describeWeather(weather),
      });
    }

    return predictions;
  }

  private describeWeather(weather: WeatherData): string {
    const conditions: string[] = [];

    if (weather.cloudCover < 20) {
      conditions.push("despejado");
    } else if (weather.cloudCover < 50) {
      conditions.push("parcialmente nublado");
    } else {
      conditions.push("nublado");
    }

    if (weather.temperature > 30) {
      conditions.push("caluroso");
    } else if (weather.temperature < 10) {
      conditions.push("frío");
    }

    return conditions.join(", ");
  }
}

/**
 * Predictor de generación eólica
 */
export class WindGenerationPredictor {
  private cutInSpeed = 3; // m/s - velocidad mínima para generar
  private ratedSpeed = 12; // m/s - velocidad nominal
  private cutOutSpeed = 25; // m/s - velocidad máxima (seguridad)

  /**
   * Predice generación eólica basada en pronóstico de viento
   */
  async predict(
    source: RenewableSource,
    weatherForecast: WeatherData[],
    hoursAhead: number = 24
  ): Promise<GenerationPrediction[]> {
    const predictions: GenerationPrediction[] = [];

    for (let i = 0; i < Math.min(hoursAhead, weatherForecast.length); i++) {
      const weather = weatherForecast[i];
      const windSpeed = weather.windSpeed;

      // Calcular potencia basada en curva de potencia de turbina
      let powerFactor = 0;

      if (windSpeed < this.cutInSpeed || windSpeed > this.cutOutSpeed) {
        powerFactor = 0;
      } else if (windSpeed >= this.cutInSpeed && windSpeed < this.ratedSpeed) {
        // Curva cúbica hasta velocidad nominal
        powerFactor = Math.pow((windSpeed - this.cutInSpeed) / (this.ratedSpeed - this.cutInSpeed), 3);
      } else {
        // Potencia nominal entre ratedSpeed y cutOutSpeed
        powerFactor = 1;
      }

      const predicted = source.capacity * powerFactor * source.efficiency / 100;

      // Incertidumbre mayor para vientos variables
      const uncertainty = predicted * (0.15 + Math.abs(windSpeed - this.ratedSpeed) / 50);

      predictions.push({
        sourceId: source.id,
        timestamp: weather.timestamp,
        predictedPower: Math.round(predicted),
        confidenceLower: Math.max(0, Math.round(predicted - uncertainty)),
        confidenceUpper: Math.round(predicted + uncertainty),
        weatherConditions: `Viento ${Math.round(windSpeed)} m/s, ${this.getWindDirection(weather.windDirection)}`,
      });
    }

    return predictions;
  }

  private getWindDirection(degrees: number): string {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }
}

/**
 * Optimizador de despacho de energía renovable
 */
export class RenewableDispatchOptimizer {
  /**
   * Optimiza el despacho de fuentes renovables
   */
  async optimize(
    sources: RenewableSource[],
    predictions: GenerationPrediction[],
    targetDemand: number
  ): Promise<DispatchRecommendation[]> {
    const recommendations: DispatchRecommendation[] = [];

    // Agrupar predicciones por fuente
    const predictionsBySource = predictions.reduce((acc, pred) => {
      if (!acc[pred.sourceId]) acc[pred.sourceId] = [];
      acc[pred.sourceId].push(pred);
      return acc;
    }, {} as Record<number, GenerationPrediction[]>);

    // Calcular prioridad para cada fuente
    for (const source of sources) {
      const sourcePredictions = predictionsBySource[source.id] || [];
      if (sourcePredictions.length === 0) continue;

      // Promedio de generación predicha
      const avgPredicted = sourcePredictions.reduce((sum, p) => sum + p.predictedPower, 0) / sourcePredictions.length;

      // Calcular factor de capacidad
      const capacityFactor = avgPredicted / source.capacity;

      // Calcular variabilidad (menor es mejor)
      const variance = sourcePredictions.reduce((sum, p) => {
        const diff = p.predictedPower - avgPredicted;
        return sum + diff * diff;
      }, 0) / sourcePredictions.length;
      const variability = Math.sqrt(variance) / avgPredicted;

      // Prioridad: mayor capacidad factor y menor variabilidad
      const priority = capacityFactor * (1 - Math.min(0.5, variability)) * 10;

      // Salida recomendada
      let recommendedOutput = avgPredicted;
      let reason = "";

      if (capacityFactor > 0.8) {
        recommendedOutput = source.capacity * 0.9; // Operar cerca de capacidad
        reason = "Alta disponibilidad de recurso, maximizar generación";
      } else if (capacityFactor > 0.5) {
        recommendedOutput = avgPredicted;
        reason = "Condiciones favorables, mantener generación predicha";
      } else if (capacityFactor > 0.2) {
        recommendedOutput = avgPredicted * 0.8;
        reason = "Condiciones variables, operar con margen de seguridad";
      } else {
        recommendedOutput = 0;
        reason = "Condiciones desfavorables, considerar desconexión";
      }

      recommendations.push({
        sourceId: source.id,
        recommendedOutput: Math.round(recommendedOutput),
        priority: Math.round(priority * 10) / 10,
        reason,
      });
    }

    // Ordenar por prioridad
    recommendations.sort((a, b) => b.priority - a.priority);

    // Ajustar para cumplir demanda objetivo
    const totalRecommended = recommendations.reduce((sum, r) => sum + r.recommendedOutput, 0);

    if (totalRecommended > targetDemand * 1.2) {
      // Exceso de generación, reducir fuentes de menor prioridad
      const scaleFactor = (targetDemand * 1.1) / totalRecommended;
      recommendations.forEach(rec => {
        rec.recommendedOutput = Math.round(rec.recommendedOutput * scaleFactor);
        rec.reason += " (ajustado por exceso de generación)";
      });
    } else if (totalRecommended < targetDemand * 0.5) {
      // Generación insuficiente, maximizar todas las fuentes
      recommendations.forEach(rec => {
        const source = sources.find(s => s.id === rec.sourceId);
        if (source) {
          rec.recommendedOutput = Math.round(source.capacity * 0.95);
          rec.reason += " (maximizado por déficit)";
        }
      });
    }

    return recommendations;
  }
}

/**
 * Analizador de integración de renovables
 */
export class RenewableIntegrationAnalyzer {
  /**
   * Analiza el impacto de la integración de renovables en la red
   */
  analyzeIntegration(
    sources: RenewableSource[],
    totalDemand: number
  ): {
    renewablePenetration: number;
    variabilityIndex: number;
    integrationScore: number;
    recommendations: string[];
  } {
    const totalRenewableCapacity = sources.reduce((sum, s) => sum + s.capacity, 0);
    const totalRenewableGeneration = sources.reduce((sum, s) => sum + s.currentGeneration, 0);

    // Penetración de renovables (% de la demanda)
    const renewablePenetration = (totalRenewableGeneration / totalDemand) * 100;

    // Índice de variabilidad (basado en tipos de fuentes)
    const solarCapacity = sources.filter(s => s.type === "solar").reduce((sum, s) => sum + s.capacity, 0);
    const windCapacity = sources.filter(s => s.type === "wind").reduce((sum, s) => sum + s.capacity, 0);
    const hydroCapacity = sources.filter(s => s.type === "hydro").reduce((sum, s) => sum + s.capacity, 0);

    // Hidro es más estable, solar y eólica más variables
    const variabilityIndex = ((solarCapacity + windCapacity) / totalRenewableCapacity) * 100;

    // Puntuación de integración (0-100)
    let integrationScore = 50;
    integrationScore += Math.min(30, renewablePenetration / 2); // Bonus por alta penetración
    integrationScore -= Math.min(20, variabilityIndex / 5); // Penalización por alta variabilidad
    integrationScore += Math.min(20, (hydroCapacity / totalRenewableCapacity) * 100 / 5); // Bonus por hidro

    // Recomendaciones
    const recommendations: string[] = [];

    if (renewablePenetration < 20) {
      recommendations.push("Aumentar capacidad de generación renovable para mejorar sostenibilidad");
    }

    if (variabilityIndex > 70) {
      recommendations.push("Alta variabilidad detectada. Considerar sistemas de almacenamiento de energía");
    }

    if (hydroCapacity / totalRenewableCapacity < 0.2) {
      recommendations.push("Incrementar fuentes renovables despachables (hidro) para mejorar estabilidad");
    }

    if (renewablePenetration > 50 && variabilityIndex > 60) {
      recommendations.push("Implementar sistemas avanzados de predicción y control para gestionar variabilidad");
    }

    return {
      renewablePenetration: Math.round(renewablePenetration * 10) / 10,
      variabilityIndex: Math.round(variabilityIndex * 10) / 10,
      integrationScore: Math.round(integrationScore),
      recommendations,
    };
  }
}

/**
 * Generador de pronóstico meteorológico sintético
 */
export class WeatherForecastGenerator {
  /**
   * Genera pronóstico meteorológico sintético para pruebas
   */
  generateForecast(hoursAhead: number = 24): WeatherData[] {
    const forecast: WeatherData[] = [];
    const now = new Date();

    for (let i = 0; i < hoursAhead; i++) {
      const timestamp = new Date(now);
      timestamp.setHours(timestamp.getHours() + i);

      const hour = timestamp.getHours();

      // Temperatura con patrón diario
      const tempBase = 20;
      const tempVariation = 10 * Math.sin(((hour - 6) / 24) * 2 * Math.PI);
      const temperature = tempBase + tempVariation + (Math.random() - 0.5) * 3;

      // Nubosidad con algo de persistencia
      const cloudCover = Math.max(0, Math.min(100, 50 + (Math.random() - 0.5) * 40));

      // Viento con variabilidad
      const windSpeed = 5 + Math.random() * 10 + Math.sin((hour / 24) * 2 * Math.PI) * 3;
      const windDirection = Math.random() * 360;

      forecast.push({
        timestamp,
        temperature: Math.round(temperature * 10) / 10,
        cloudCover: Math.round(cloudCover),
        windSpeed: Math.round(windSpeed * 10) / 10,
        windDirection: Math.round(windDirection),
        humidity: 50 + Math.random() * 30,
        precipitation: Math.random() > 0.8 ? Math.random() * 5 : 0,
      });
    }

    return forecast;
  }
}
