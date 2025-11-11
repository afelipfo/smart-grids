/**
 * Servicio de integración con API XM (Operador del Mercado Energético Colombiano)
 * Documentación: https://github.com/EquipoAnaliticaXM/API_XM
 */

interface XMApiResponse {
  success: boolean;
  data: any[];
  error?: string;
}

interface DemandData {
  timestamp: Date;
  value: number;
  unit: string;
}

interface GenerationData {
  timestamp: Date;
  source: string;
  value: number;
  unit: string;
}

interface PriceData {
  timestamp: Date;
  price: number;
  currency: string;
}

/**
 * Cliente para la API de XM
 * Nota: La API real requiere autenticación y tiene límites de tasa
 * Esta implementación incluye simulación para desarrollo
 */
class XMApiClient {
  private baseUrl = "https://servapibi.xm.com.co/trpr/api";
  private useSimulation = true; // Cambiar a false cuando se tenga acceso real

  /**
   * Obtener demanda del Sistema Interconectado Nacional (SIN)
   * Endpoint: /DemandaSIN
   */
  async getDemandaSIN(startDate: string, endDate: string): Promise<DemandData[]> {
    if (this.useSimulation) {
      return this.simulateDemandData(startDate, endDate);
    }

    try {
      const url = `${this.baseUrl}/DemandaSIN`;
      const params = new URLSearchParams({
        StartDate: startDate,
        EndDate: endDate,
      });

      const response = await fetch(`${url}?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`XM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseDemandData(data);
    } catch (error) {
      console.error("Error fetching demand data from XM API:", error);
      // Fallback a simulación en caso de error
      return this.simulateDemandData(startDate, endDate);
    }
  }

  /**
   * Obtener generación real por tipo de recurso
   * Endpoint: /GeneracionReal
   */
  async getGeneracionReal(startDate: string, endDate: string): Promise<GenerationData[]> {
    if (this.useSimulation) {
      return this.simulateGenerationData(startDate, endDate);
    }

    try {
      const url = `${this.baseUrl}/GeneracionReal`;
      const params = new URLSearchParams({
        StartDate: startDate,
        EndDate: endDate,
      });

      const response = await fetch(`${url}?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`XM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseGenerationData(data);
    } catch (error) {
      console.error("Error fetching generation data from XM API:", error);
      return this.simulateGenerationData(startDate, endDate);
    }
  }

  /**
   * Obtener precio de bolsa nacional
   * Endpoint: /PrecioBolsaNacional
   */
  async getPrecioBolsa(startDate: string, endDate: string): Promise<PriceData[]> {
    if (this.useSimulation) {
      return this.simulatePriceData(startDate, endDate);
    }

    try {
      const url = `${this.baseUrl}/PrecioBolsaNacional`;
      const params = new URLSearchParams({
        StartDate: startDate,
        EndDate: endDate,
      });

      const response = await fetch(`${url}?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`XM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parsePriceData(data);
    } catch (error) {
      console.error("Error fetching price data from XM API:", error);
      return this.simulatePriceData(startDate, endDate);
    }
  }

  /**
   * Obtener emisiones de CO2
   * Endpoint: /EmisionesCO2
   */
  async getEmisionesCO2(startDate: string, endDate: string): Promise<any[]> {
    if (this.useSimulation) {
      return this.simulateEmissionsData(startDate, endDate);
    }

    try {
      const url = `${this.baseUrl}/EmisionesCO2`;
      const params = new URLSearchParams({
        StartDate: startDate,
        EndDate: endDate,
      });

      const response = await fetch(`${url}?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`XM API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching emissions data from XM API:", error);
      return this.simulateEmissionsData(startDate, endDate);
    }
  }

  // Métodos de simulación para desarrollo
  private simulateDemandData(startDate: string, endDate: string): DemandData[] {
    const data: DemandData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hoursDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));

    for (let i = 0; i <= Math.min(hoursDiff, 720); i++) {
      const timestamp = new Date(start.getTime() + i * 60 * 60 * 1000);
      const hour = timestamp.getHours();
      
      // Patrón de demanda típico colombiano
      let baseDemand = 8500; // MW
      if (hour >= 6 && hour < 10) baseDemand += 1500; // Pico mañana
      if (hour >= 18 && hour < 22) baseDemand += 2000; // Pico noche
      if (hour >= 0 && hour < 6) baseDemand -= 2000; // Valle madrugada
      
      const variation = Math.sin(i / 24 * Math.PI) * 500;
      const noise = (Math.random() - 0.5) * 300;

      data.push({
        timestamp,
        value: baseDemand + variation + noise,
        unit: "MW",
      });
    }

    return data;
  }

  private simulateGenerationData(startDate: string, endDate: string): GenerationData[] {
    const data: GenerationData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hoursDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));

    const sources = [
      { name: "Hidráulica", base: 5500, variation: 800 },
      { name: "Térmica", base: 2000, variation: 500 },
      { name: "Solar", base: 400, variation: 300 },
      { name: "Eólica", base: 300, variation: 150 },
      { name: "Biomasa", base: 100, variation: 30 },
    ];

    for (let i = 0; i <= Math.min(hoursDiff, 720); i++) {
      const timestamp = new Date(start.getTime() + i * 60 * 60 * 1000);
      const hour = timestamp.getHours();

      sources.forEach((source) => {
        let value = source.base;

        // Solar solo durante el día
        if (source.name === "Solar") {
          if (hour >= 6 && hour <= 18) {
            const solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
            value = source.base * solarFactor;
          } else {
            value = 0;
          }
        }

        // Eólica con variación
        if (source.name === "Eólica") {
          value += Math.sin(i / 6 * Math.PI) * source.variation;
        }

        const noise = (Math.random() - 0.5) * source.variation * 0.2;

        data.push({
          timestamp,
          source: source.name,
          value: Math.max(0, value + noise),
          unit: "MW",
        });
      });
    }

    return data;
  }

  private simulatePriceData(startDate: string, endDate: string): PriceData[] {
    const data: PriceData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hoursDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));

    for (let i = 0; i <= Math.min(hoursDiff, 720); i++) {
      const timestamp = new Date(start.getTime() + i * 60 * 60 * 1000);
      const hour = timestamp.getHours();

      // Precio base en COP/kWh
      let basePrice = 180;
      if (hour >= 18 && hour < 22) basePrice += 50; // Pico noche
      if (hour >= 0 && hour < 6) basePrice -= 30; // Valle madrugada

      const variation = Math.sin(i / 24 * Math.PI) * 20;
      const noise = (Math.random() - 0.5) * 15;

      data.push({
        timestamp,
        price: basePrice + variation + noise,
        currency: "COP",
      });
    }

    return data;
  }

  private simulateEmissionsData(startDate: string, endDate: string): any[] {
    const data: any[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
      const timestamp = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);

      // Emisiones diarias en toneladas
      const baseCO2 = 15000;
      const variation = Math.sin(i / 7 * Math.PI) * 2000;
      const noise = (Math.random() - 0.5) * 1000;

      data.push({
        timestamp,
        co2: baseCO2 + variation + noise,
        ch4: (baseCO2 + variation + noise) * 0.001,
        n2o: (baseCO2 + variation + noise) * 0.0005,
        co2eq: (baseCO2 + variation + noise) * 1.02,
        unit: "toneladas",
      });
    }

    return data;
  }

  // Métodos de parseo para datos reales
  private parseDemandData(rawData: any): DemandData[] {
    // Implementar parseo según estructura real de la API
    return rawData.map((item: any) => ({
      timestamp: new Date(item.Fecha),
      value: parseFloat(item.Valor),
      unit: "MW",
    }));
  }

  private parseGenerationData(rawData: any): GenerationData[] {
    // Implementar parseo según estructura real de la API
    return rawData.map((item: any) => ({
      timestamp: new Date(item.Fecha),
      source: item.Recurso || item.TipoRecurso,
      value: parseFloat(item.Valor),
      unit: "MW",
    }));
  }

  private parsePriceData(rawData: any): PriceData[] {
    // Implementar parseo según estructura real de la API
    return rawData.map((item: any) => ({
      timestamp: new Date(item.Fecha),
      price: parseFloat(item.Precio),
      currency: "COP",
    }));
  }
}

// Exportar instancia única
export const xmApiClient = new XMApiClient();

// Funciones helper para uso en routers
export async function fetchColombianDemand(days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  return await xmApiClient.getDemandaSIN(startStr, endStr);
}

export async function fetchColombianGeneration(days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  return await xmApiClient.getGeneracionReal(startStr, endStr);
}

export async function fetchColombianPrices(days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  return await xmApiClient.getPrecioBolsa(startStr, endStr);
}

export async function fetchColombianEmissions(days: number = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  return await xmApiClient.getEmisionesCO2(startStr, endStr);
}
