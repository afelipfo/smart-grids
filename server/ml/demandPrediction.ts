/**
 * Servicio de Predicción de Demanda Energética
 * Implementa modelos LSTM y Prophet para predecir demanda futura
 */

interface DemandDataPoint {
  timestamp: Date;
  demand: number;
  temperature?: number;
  dayOfWeek?: number;
  isHoliday?: boolean;
}

interface PredictionResult {
  timestamp: Date;
  predictedDemand: number;
  confidenceLower: number;
  confidenceUpper: number;
  modelName: string;
}

/**
 * Modelo LSTM simplificado para predicción de demanda
 * En producción, esto se conectaría a un servicio Python con TensorFlow
 */
export class LSTMDemandPredictor {
  private modelVersion = "1.0.0";
  private lookbackHours = 168; // Una semana de datos históricos

  /**
   * Predice la demanda futura basándose en datos históricos
   */
  async predict(
    historicalData: DemandDataPoint[],
    hoursAhead: number = 24
  ): Promise<PredictionResult[]> {
    // Simulación de predicción LSTM
    // En producción, esto llamaría a un modelo real entrenado
    const predictions: PredictionResult[] = [];
    const lastDataPoint = historicalData[historicalData.length - 1];
    const baseDemand = lastDataPoint.demand;

    for (let i = 1; i <= hoursAhead; i++) {
      const futureTimestamp = new Date(lastDataPoint.timestamp);
      futureTimestamp.setHours(futureTimestamp.getHours() + i);

      // Simulación de patrón diario y semanal
      const hour = futureTimestamp.getHours();
      const dayOfWeek = futureTimestamp.getDay();

      // Factor de hora del día (pico en horas laborales)
      let hourFactor = 1.0;
      if (hour >= 8 && hour <= 20) {
        hourFactor = 1.2 + Math.sin((hour - 8) / 12 * Math.PI) * 0.3;
      } else {
        hourFactor = 0.7 + Math.random() * 0.2;
      }

      // Factor de día de la semana (menor demanda en fines de semana)
      const dayFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.0;

      // Predicción con variabilidad
      const predicted = baseDemand * hourFactor * dayFactor * (0.95 + Math.random() * 0.1);
      const uncertainty = predicted * 0.1; // 10% de incertidumbre

      predictions.push({
        timestamp: futureTimestamp,
        predictedDemand: Math.round(predicted),
        confidenceLower: Math.round(predicted - uncertainty),
        confidenceUpper: Math.round(predicted + uncertainty),
        modelName: "LSTM-v" + this.modelVersion,
      });
    }

    return predictions;
  }

  /**
   * Calcula características para el modelo
   */
  private extractFeatures(data: DemandDataPoint[]): number[][] {
    return data.map(point => [
      point.demand,
      point.temperature || 20,
      point.dayOfWeek || 0,
      point.isHoliday ? 1 : 0,
      point.timestamp.getHours(),
    ]);
  }
}

/**
 * Modelo Prophet para series temporales
 * Captura tendencias y estacionalidad
 */
export class ProphetDemandPredictor {
  private modelVersion = "1.0.0";

  async predict(
    historicalData: DemandDataPoint[],
    hoursAhead: number = 24
  ): Promise<PredictionResult[]> {
    // Simulación de predicción Prophet
    const predictions: PredictionResult[] = [];
    const lastDataPoint = historicalData[historicalData.length - 1];

    // Calcular tendencia de los últimos datos
    const recentData = historicalData.slice(-168); // Última semana
    const trend = this.calculateTrend(recentData);

    for (let i = 1; i <= hoursAhead; i++) {
      const futureTimestamp = new Date(lastDataPoint.timestamp);
      futureTimestamp.setHours(futureTimestamp.getHours() + i);

      // Componente de tendencia
      const trendComponent = lastDataPoint.demand * (1 + trend * i / 168);

      // Componente estacional (diaria)
      const hour = futureTimestamp.getHours();
      const seasonalDaily = Math.sin((hour / 24) * 2 * Math.PI) * 0.15;

      // Componente estacional (semanal)
      const dayOfWeek = futureTimestamp.getDay();
      const seasonalWeekly = (dayOfWeek === 0 || dayOfWeek === 6) ? -0.15 : 0.05;

      const predicted = trendComponent * (1 + seasonalDaily + seasonalWeekly);
      const uncertainty = predicted * 0.12;

      predictions.push({
        timestamp: futureTimestamp,
        predictedDemand: Math.round(predicted),
        confidenceLower: Math.round(predicted - uncertainty),
        confidenceUpper: Math.round(predicted + uncertainty),
        modelName: "Prophet-v" + this.modelVersion,
      });
    }

    return predictions;
  }

  private calculateTrend(data: DemandDataPoint[]): number {
    if (data.length < 2) return 0;

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const avgFirst = firstHalf.reduce((sum, d) => sum + d.demand, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, d) => sum + d.demand, 0) / secondHalf.length;

    return (avgSecond - avgFirst) / avgFirst;
  }
}

/**
 * Ensemble de modelos que combina LSTM y Prophet
 */
export class EnsembleDemandPredictor {
  private lstmModel = new LSTMDemandPredictor();
  private prophetModel = new ProphetDemandPredictor();

  async predict(
    historicalData: DemandDataPoint[],
    hoursAhead: number = 24
  ): Promise<PredictionResult[]> {
    // Obtener predicciones de ambos modelos
    const lstmPredictions = await this.lstmModel.predict(historicalData, hoursAhead);
    const prophetPredictions = await this.prophetModel.predict(historicalData, hoursAhead);

    // Combinar predicciones con pesos
    const lstmWeight = 0.6;
    const prophetWeight = 0.4;

    const ensemblePredictions: PredictionResult[] = [];

    for (let i = 0; i < hoursAhead; i++) {
      const lstm = lstmPredictions[i];
      const prophet = prophetPredictions[i];

      const predicted = lstm.predictedDemand * lstmWeight + prophet.predictedDemand * prophetWeight;
      const lowerBound = lstm.confidenceLower * lstmWeight + prophet.confidenceLower * prophetWeight;
      const upperBound = lstm.confidenceUpper * lstmWeight + prophet.confidenceUpper * prophetWeight;

      ensemblePredictions.push({
        timestamp: lstm.timestamp,
        predictedDemand: Math.round(predicted),
        confidenceLower: Math.round(lowerBound),
        confidenceUpper: Math.round(upperBound),
        modelName: "Ensemble-LSTM-Prophet",
      });
    }

    return ensemblePredictions;
  }
}

/**
 * Evaluador de precisión de modelos
 */
export class ModelEvaluator {
  /**
   * Calcula el error absoluto medio porcentual (MAPE)
   */
  calculateMAPE(predictions: number[], actuals: number[]): number {
    if (predictions.length !== actuals.length || predictions.length === 0) {
      return 0;
    }

    let sumPercentageError = 0;
    let validCount = 0;

    for (let i = 0; i < predictions.length; i++) {
      if (actuals[i] !== 0) {
        const percentageError = Math.abs((actuals[i] - predictions[i]) / actuals[i]);
        sumPercentageError += percentageError;
        validCount++;
      }
    }

    return validCount > 0 ? (sumPercentageError / validCount) * 100 : 0;
  }

  /**
   * Calcula el error cuadrático medio (RMSE)
   */
  calculateRMSE(predictions: number[], actuals: number[]): number {
    if (predictions.length !== actuals.length || predictions.length === 0) {
      return 0;
    }

    const sumSquaredError = predictions.reduce((sum, pred, i) => {
      const error = actuals[i] - pred;
      return sum + error * error;
    }, 0);

    return Math.sqrt(sumSquaredError / predictions.length);
  }

  /**
   * Calcula el coeficiente de determinación (R²)
   */
  calculateR2(predictions: number[], actuals: number[]): number {
    if (predictions.length !== actuals.length || predictions.length === 0) {
      return 0;
    }

    const meanActual = actuals.reduce((sum, val) => sum + val, 0) / actuals.length;

    const ssTotal = actuals.reduce((sum, val) => {
      const diff = val - meanActual;
      return sum + diff * diff;
    }, 0);

    const ssResidual = predictions.reduce((sum, pred, i) => {
      const diff = actuals[i] - pred;
      return sum + diff * diff;
    }, 0);

    return 1 - (ssResidual / ssTotal);
  }
}
