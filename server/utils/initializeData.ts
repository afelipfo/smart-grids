/**
 * Script para inicializar la base de datos con datos sintéticos
 */

import {
  createGridNode,
  createEnergyDemand,
  createRenewableGeneration,
  createMeasurement,
  getAllGridNodes,
} from "../db";
import { generateSystemSnapshot } from "./dataGenerator";

export async function initializeSystemData() {
  console.log("Inicializando datos del sistema...");

  try {
    // Verificar si ya hay datos
    const existingNodes = await getAllGridNodes();
    if (existingNodes.length > 0) {
      console.log("Los datos ya están inicializados. Saltando...");
      return;
    }

    // Generar datos sintéticos
    const snapshot = generateSystemSnapshot();

    // Insertar nodos
    console.log("Insertando nodos de red...");
    for (const node of snapshot.nodes) {
      await createGridNode(node);
    }

    // Insertar demanda histórica
    console.log("Insertando datos de demanda histórica...");
    for (const demand of snapshot.demandHistory) {
      await createEnergyDemand(demand);
    }

    // Insertar generación solar
    console.log("Insertando datos de generación solar...");
    for (const gen of snapshot.solarGeneration) {
      await createRenewableGeneration(gen);
    }

    // Insertar generación eólica
    console.log("Insertando datos de generación eólica...");
    for (const gen of snapshot.windGeneration) {
      await createRenewableGeneration(gen);
    }

    // Insertar mediciones
    console.log("Insertando mediciones en tiempo real...");
    for (const measurement of snapshot.measurements) {
      await createMeasurement(measurement);
    }

    console.log("✓ Datos inicializados correctamente");
  } catch (error) {
    console.error("Error al inicializar datos:", error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeSystemData()
    .then(() => {
      console.log("Inicialización completada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}
