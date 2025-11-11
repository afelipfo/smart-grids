import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  gridNodes, InsertGridNode,
  transmissionLines, InsertTransmissionLine,
  equipment, InsertEquipment,
  measurements, InsertMeasurement,
  energyDemand, InsertEnergyDemand,
  demandPredictions, InsertDemandPrediction,
  renewableGeneration, InsertRenewableGeneration,
  renewablePredictions, InsertRenewablePrediction,
  networkOptimizations, InsertNetworkOptimization,
  alerts, InsertAlert,
  maintenanceHistory, InsertMaintenanceHistory
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Funciones para nodos de red
export async function getAllGridNodes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(gridNodes);
}

export async function getGridNodeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(gridNodes).where(eq(gridNodes.id, id)).limit(1);
  return result[0];
}

export async function createGridNode(node: InsertGridNode) {
  const db = await getDb();
  if (!db) return;
  await db.insert(gridNodes).values(node);
}

// Funciones para líneas de transmisión
export async function getAllTransmissionLines() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(transmissionLines);
}

// Funciones para equipos
export async function getAllEquipment() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(equipment);
}

export async function getEquipmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(equipment).where(eq(equipment.id, id)).limit(1);
  return result[0];
}

export async function updateEquipmentHealth(id: number, healthScore: number, failureProbability: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(equipment).set({ healthScore, failureProbability }).where(eq(equipment.id, id));
}

// Funciones para mediciones
export async function createMeasurement(measurement: InsertMeasurement) {
  const db = await getDb();
  if (!db) return;
  await db.insert(measurements).values(measurement);
}

export async function getRecentMeasurements(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(measurements).orderBy(measurements.timestamp).limit(limit);
}

// Funciones para demanda energética
export async function createEnergyDemand(demand: InsertEnergyDemand) {
  const db = await getDb();
  if (!db) return;
  await db.insert(energyDemand).values(demand);
}

export async function getEnergyDemandHistory(hours: number = 168) {
  const db = await getDb();
  if (!db) return [];
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hours);
  return await db.select().from(energyDemand)
    .where(sql`${energyDemand.timestamp} >= ${cutoffDate}`)
    .orderBy(energyDemand.timestamp);
}

// Funciones para predicciones de demanda
export async function createDemandPrediction(prediction: InsertDemandPrediction) {
  const db = await getDb();
  if (!db) return;
  await db.insert(demandPredictions).values(prediction);
}

export async function getDemandPredictions(hours: number = 24) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return await db.select().from(demandPredictions)
    .where(sql`${demandPredictions.predictionTimestamp} >= ${now}`)
    .orderBy(demandPredictions.predictionTimestamp)
    .limit(hours);
}

// Funciones para generación renovable
export async function createRenewableGeneration(generation: InsertRenewableGeneration) {
  const db = await getDb();
  if (!db) return;
  await db.insert(renewableGeneration).values(generation);
}

export async function getRenewableGenerationHistory(nodeId: number, hours: number = 24) {
  const db = await getDb();
  if (!db) return [];
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hours);
  return await db.select().from(renewableGeneration)
    .where(sql`${renewableGeneration.nodeId} = ${nodeId} AND ${renewableGeneration.timestamp} >= ${cutoffDate}`)
    .orderBy(renewableGeneration.timestamp);
}

// Funciones para alertas
export async function createAlert(alert: InsertAlert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(alerts).values(alert);
}

export async function getActiveAlerts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(alerts)
    .where(eq(alerts.status, "active"))
    .orderBy(alerts.createdAt);
}

export async function acknowledgeAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(alerts).set({
    status: "acknowledged",
    acknowledgedBy: userId,
    acknowledgedAt: new Date(),
  }).where(eq(alerts.id, id));
}

// Funciones para optimizaciones de red
export async function createNetworkOptimization(optimization: InsertNetworkOptimization) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(networkOptimizations).values(optimization);
  return result;
}

export async function getNetworkOptimizations(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(networkOptimizations)
    .orderBy(networkOptimizations.createdAt)
    .limit(limit);
}

// Funciones para historial de mantenimiento
export async function createMaintenanceRecord(record: InsertMaintenanceHistory) {
  const db = await getDb();
  if (!db) return;
  await db.insert(maintenanceHistory).values(record);
}

export async function getEquipmentMaintenanceHistory(equipmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(maintenanceHistory)
    .where(eq(maintenanceHistory.equipmentId, equipmentId))
    .orderBy(maintenanceHistory.createdAt);
}
