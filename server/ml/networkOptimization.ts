/**
 * Servicio de Optimización de Redes Eléctricas
 * Implementa algoritmos para optimizar flujos de potencia y configuración de red
 */

interface GridNode {
  id: number;
  name: string;
  voltage: number;
  capacity: number;
  currentLoad: number;
}

interface TransmissionLine {
  id: number;
  fromNodeId: number;
  toNodeId: number;
  capacity: number;
  currentFlow: number;
  resistance: number;
}

interface OptimizationObjective {
  minimizeLosses: boolean;
  minimizeCosts: boolean;
  maximizeRenewables: boolean;
  balanceLoad: boolean;
}

interface OptimizationResult {
  success: boolean;
  objectiveValue: number;
  recommendations: OptimizationRecommendation[];
  estimatedSavings: number;
  executionTime: number;
}

interface OptimizationRecommendation {
  type: "switch_line" | "adjust_voltage" | "redistribute_load" | "increase_renewable";
  description: string;
  affectedEntities: number[];
  priority: "low" | "medium" | "high";
  estimatedImpact: number;
}

/**
 * Optimizador de flujo de potencia óptimo (OPF)
 */
export class OptimalPowerFlowOptimizer {
  /**
   * Resuelve el problema de flujo de potencia óptimo
   */
  async optimize(
    nodes: GridNode[],
    lines: TransmissionLine[],
    objectives: OptimizationObjective
  ): Promise<OptimizationResult> {
    const startTime = Date.now();
    const recommendations: OptimizationRecommendation[] = [];

    // 1. Identificar líneas sobrecargadas
    const overloadedLines = lines.filter(line => 
      (line.currentFlow / line.capacity) > 0.9
    );

    for (const line of overloadedLines) {
      recommendations.push({
        type: "redistribute_load",
        description: `Línea ${line.id} sobrecargada al ${Math.round((line.currentFlow / line.capacity) * 100)}%. Redistribuir carga.`,
        affectedEntities: [line.id],
        priority: "high",
        estimatedImpact: (line.currentFlow - line.capacity * 0.8) * 0.05, // 5% del exceso
      });
    }

    // 2. Balancear carga entre nodos
    if (objectives.balanceLoad) {
      const loadImbalance = this.calculateLoadImbalance(nodes);
      if (loadImbalance > 0.2) {
        const overloadedNodes = nodes.filter(n => n.currentLoad / n.capacity > 0.85);
        const underloadedNodes = nodes.filter(n => n.currentLoad / n.capacity < 0.5);

        if (overloadedNodes.length > 0 && underloadedNodes.length > 0) {
          recommendations.push({
            type: "redistribute_load",
            description: `Desbalance de carga detectado (${Math.round(loadImbalance * 100)}%). Redistribuir entre nodos.`,
            affectedEntities: [...overloadedNodes.map(n => n.id), ...underloadedNodes.map(n => n.id)],
            priority: "medium",
            estimatedImpact: loadImbalance * 100,
          });
        }
      }
    }

    // 3. Minimizar pérdidas de transmisión
    if (objectives.minimizeLosses) {
      const totalLosses = this.calculateTransmissionLosses(lines);
      const highLossLines = lines.filter(line => {
        const loss = Math.pow(line.currentFlow, 2) * line.resistance;
        return loss > 10; // Pérdidas > 10 MW
      });

      for (const line of highLossLines) {
        recommendations.push({
          type: "adjust_voltage",
          description: `Línea ${line.id} con pérdidas elevadas. Ajustar voltaje para reducir corriente.`,
          affectedEntities: [line.fromNodeId, line.toNodeId],
          priority: "medium",
          estimatedImpact: Math.pow(line.currentFlow, 2) * line.resistance * 0.3,
        });
      }
    }

    // 4. Maximizar integración de renovables
    if (objectives.maximizeRenewables) {
      const renewableNodes = nodes.filter(n => n.name.toLowerCase().includes("solar") || n.name.toLowerCase().includes("wind"));
      
      for (const node of renewableNodes) {
        if (node.currentLoad / node.capacity < 0.7) {
          recommendations.push({
            type: "increase_renewable",
            description: `Nodo renovable ${node.name} operando al ${Math.round((node.currentLoad / node.capacity) * 100)}%. Aumentar despacho.`,
            affectedEntities: [node.id],
            priority: "high",
            estimatedImpact: (node.capacity - node.currentLoad) * 0.8,
          });
        }
      }
    }

    // Calcular valor objetivo y ahorros estimados
    const objectiveValue = this.calculateObjectiveValue(nodes, lines, objectives);
    const estimatedSavings = recommendations.reduce((sum, rec) => sum + rec.estimatedImpact, 0) * 50; // $50/MW ahorrado

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      objectiveValue,
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      estimatedSavings: Math.round(estimatedSavings),
      executionTime,
    };
  }

  private calculateLoadImbalance(nodes: GridNode[]): number {
    const loadFactors = nodes.map(n => n.currentLoad / n.capacity);
    const avgLoadFactor = loadFactors.reduce((sum, lf) => sum + lf, 0) / loadFactors.length;
    const variance = loadFactors.reduce((sum, lf) => sum + Math.pow(lf - avgLoadFactor, 2), 0) / loadFactors.length;
    return Math.sqrt(variance);
  }

  private calculateTransmissionLosses(lines: TransmissionLine[]): number {
    return lines.reduce((sum, line) => {
      // Pérdidas = I² * R (aproximación)
      const loss = Math.pow(line.currentFlow, 2) * line.resistance / 1000;
      return sum + loss;
    }, 0);
  }

  private calculateObjectiveValue(
    nodes: GridNode[],
    lines: TransmissionLine[],
    objectives: OptimizationObjective
  ): number {
    let value = 0;

    if (objectives.minimizeLosses) {
      value += this.calculateTransmissionLosses(lines) * 100;
    }

    if (objectives.balanceLoad) {
      value += this.calculateLoadImbalance(nodes) * 1000;
    }

    if (objectives.maximizeRenewables) {
      const renewableUtilization = this.calculateRenewableUtilization(nodes);
      value -= renewableUtilization * 500; // Negativo porque queremos maximizar
    }

    return value;
  }

  private calculateRenewableUtilization(nodes: GridNode[]): number {
    const renewableNodes = nodes.filter(n => 
      n.name.toLowerCase().includes("solar") || n.name.toLowerCase().includes("wind")
    );

    if (renewableNodes.length === 0) return 0;

    const totalUtilization = renewableNodes.reduce((sum, n) => sum + (n.currentLoad / n.capacity), 0);
    return totalUtilization / renewableNodes.length;
  }
}

/**
 * Algoritmo genético para optimización topológica de red
 */
export class GeneticAlgorithmOptimizer {
  private populationSize = 50;
  private generations = 100;
  private mutationRate = 0.1;

  async optimize(
    nodes: GridNode[],
    lines: TransmissionLine[]
  ): Promise<OptimizationResult> {
    const startTime = Date.now();

    // Simulación de algoritmo genético
    // En producción, esto ejecutaría un GA real con múltiples generaciones

    const recommendations: OptimizationRecommendation[] = [];

    // Identificar configuración óptima de switches
    const switchableLines = lines.filter(l => l.capacity > 100);
    
    for (const line of switchableLines.slice(0, 3)) {
      const shouldSwitch = Math.random() > 0.5;
      if (shouldSwitch) {
        recommendations.push({
          type: "switch_line",
          description: `Reconfigurar línea ${line.id} para optimizar topología de red.`,
          affectedEntities: [line.id, line.fromNodeId, line.toNodeId],
          priority: "medium",
          estimatedImpact: 15 + Math.random() * 10,
        });
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      objectiveValue: 1000 - recommendations.length * 50,
      recommendations,
      estimatedSavings: Math.round(recommendations.reduce((sum, rec) => sum + rec.estimatedImpact, 0) * 60),
      executionTime,
    };
  }
}

/**
 * Optimizador de control de voltaje
 */
export class VoltageControlOptimizer {
  private nominalVoltage = 220; // kV
  private voltageTolerance = 0.05; // ±5%

  async optimize(nodes: GridNode[]): Promise<OptimizationResult> {
    const startTime = Date.now();
    const recommendations: OptimizationRecommendation[] = [];

    for (const node of nodes) {
      const voltageDeviation = Math.abs(node.voltage - this.nominalVoltage) / this.nominalVoltage;

      if (voltageDeviation > this.voltageTolerance) {
        const direction = node.voltage > this.nominalVoltage ? "reducir" : "aumentar";
        recommendations.push({
          type: "adjust_voltage",
          description: `Nodo ${node.name}: voltaje ${node.voltage}kV fuera de rango. ${direction} voltaje.`,
          affectedEntities: [node.id],
          priority: voltageDeviation > 0.1 ? "high" : "medium",
          estimatedImpact: voltageDeviation * 100,
        });
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      objectiveValue: recommendations.length * 10,
      recommendations,
      estimatedSavings: Math.round(recommendations.reduce((sum, rec) => sum + rec.estimatedImpact, 0) * 30),
      executionTime,
    };
  }
}
