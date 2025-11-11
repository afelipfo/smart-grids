import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Nodos de la red eléctrica (subestaciones, puntos de conexión)
 */
export const gridNodes = mysqlTable("gridNodes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nodeType: mysqlEnum("nodeType", ["substation", "generator", "load", "junction"]).notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  voltage: int("voltage").notNull(), // Voltaje nominal en kV
  capacity: int("capacity").notNull(), // Capacidad en MW
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GridNode = typeof gridNodes.$inferSelect;
export type InsertGridNode = typeof gridNodes.$inferInsert;

/**
 * Líneas de transmisión entre nodos
 */
export const transmissionLines = mysqlTable("transmissionLines", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  fromNodeId: int("fromNodeId").notNull(),
  toNodeId: int("toNodeId").notNull(),
  capacity: int("capacity").notNull(), // Capacidad en MW
  length: int("length").notNull(), // Longitud en km
  resistance: varchar("resistance", { length: 50 }), // Resistencia en ohms
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TransmissionLine = typeof transmissionLines.$inferSelect;
export type InsertTransmissionLine = typeof transmissionLines.$inferInsert;

/**
 * Equipos de la red (transformadores, interruptores, etc.)
 */
export const equipment = mysqlTable("equipment", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  equipmentType: mysqlEnum("equipmentType", ["transformer", "breaker", "capacitor", "reactor", "other"]).notNull(),
  nodeId: int("nodeId").notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  model: varchar("model", { length: 255 }),
  installationDate: timestamp("installationDate"),
  lastMaintenanceDate: timestamp("lastMaintenanceDate"),
  nextMaintenanceDate: timestamp("nextMaintenanceDate"),
  status: mysqlEnum("status", ["operational", "degraded", "failed", "maintenance"]).default("operational").notNull(),
  healthScore: int("healthScore").default(100), // 0-100
  failureProbability: int("failureProbability").default(0), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;

/**
 * Mediciones en tiempo real de la red
 */
export const measurements = mysqlTable("measurements", {
  id: int("id").autoincrement().primaryKey(),
  nodeId: int("nodeId"),
  lineId: int("lineId"),
  measurementType: mysqlEnum("measurementType", ["voltage", "current", "power", "frequency", "temperature"]).notNull(),
  value: varchar("value", { length: 50 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Measurement = typeof measurements.$inferSelect;
export type InsertMeasurement = typeof measurements.$inferInsert;

/**
 * Demanda energética histórica y actual
 */
export const energyDemand = mysqlTable("energyDemand", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").notNull(),
  totalDemand: int("totalDemand").notNull(), // MW
  residentialDemand: int("residentialDemand"),
  commercialDemand: int("commercialDemand"),
  industrialDemand: int("industrialDemand"),
  temperature: varchar("temperature", { length: 20 }),
  dayOfWeek: int("dayOfWeek"),
  isHoliday: int("isHoliday").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EnergyDemand = typeof energyDemand.$inferSelect;
export type InsertEnergyDemand = typeof energyDemand.$inferInsert;

/**
 * Predicciones de demanda energética
 */
export const demandPredictions = mysqlTable("demandPredictions", {
  id: int("id").autoincrement().primaryKey(),
  predictionTimestamp: timestamp("predictionTimestamp").notNull(),
  predictedDemand: int("predictedDemand").notNull(), // MW
  confidenceLower: int("confidenceLower"), // Límite inferior del intervalo de confianza
  confidenceUpper: int("confidenceUpper"), // Límite superior del intervalo de confianza
  modelName: varchar("modelName", { length: 100 }),
  modelVersion: varchar("modelVersion", { length: 50 }),
  actualDemand: int("actualDemand"), // Se llena después con el valor real
  accuracy: varchar("accuracy", { length: 20 }), // Precisión calculada después
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DemandPrediction = typeof demandPredictions.$inferSelect;
export type InsertDemandPrediction = typeof demandPredictions.$inferInsert;

/**
 * Generación de energía renovable
 */
export const renewableGeneration = mysqlTable("renewableGeneration", {
  id: int("id").autoincrement().primaryKey(),
  nodeId: int("nodeId").notNull(),
  sourceType: mysqlEnum("sourceType", ["solar", "wind", "hydro", "biomass", "geothermal"]).notNull(),
  timestamp: timestamp("timestamp").notNull(),
  generatedPower: int("generatedPower").notNull(), // MW
  capacity: int("capacity").notNull(), // Capacidad instalada en MW
  efficiency: int("efficiency"), // Porcentaje 0-100
  weatherCondition: varchar("weatherCondition", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RenewableGeneration = typeof renewableGeneration.$inferSelect;
export type InsertRenewableGeneration = typeof renewableGeneration.$inferInsert;

/**
 * Predicciones de generación renovable
 */
export const renewablePredictions = mysqlTable("renewablePredictions", {
  id: int("id").autoincrement().primaryKey(),
  nodeId: int("nodeId").notNull(),
  sourceType: mysqlEnum("sourceType", ["solar", "wind", "hydro", "biomass", "geothermal"]).notNull(),
  predictionTimestamp: timestamp("predictionTimestamp").notNull(),
  predictedPower: int("predictedPower").notNull(), // MW
  confidenceLower: int("confidenceLower"),
  confidenceUpper: int("confidenceUpper"),
  weatherForecast: text("weatherForecast"),
  actualPower: int("actualPower"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RenewablePrediction = typeof renewablePredictions.$inferSelect;
export type InsertRenewablePrediction = typeof renewablePredictions.$inferInsert;

/**
 * Optimizaciones de red realizadas
 */
export const networkOptimizations = mysqlTable("networkOptimizations", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  optimizationType: mysqlEnum("optimizationType", ["load_balancing", "loss_minimization", "renewable_integration", "voltage_control"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  inputParameters: text("inputParameters"),
  outputResults: text("outputResults"),
  savingsEstimated: int("savingsEstimated"), // Ahorros estimados en USD
  executionTime: int("executionTime"), // Tiempo de ejecución en segundos
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type NetworkOptimization = typeof networkOptimizations.$inferSelect;
export type InsertNetworkOptimization = typeof networkOptimizations.$inferInsert;

/**
 * Alertas y notificaciones del sistema
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  alertType: mysqlEnum("alertType", ["equipment_failure", "overload", "voltage_violation", "maintenance_due", "prediction_anomaly", "system_warning"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  relatedEntityId: int("relatedEntityId"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active").notNull(),
  acknowledgedBy: int("acknowledgedBy"),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedBy: int("resolvedBy"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Historial de mantenimiento de equipos
 */
export const maintenanceHistory = mysqlTable("maintenanceHistory", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipmentId").notNull(),
  maintenanceType: mysqlEnum("maintenanceType", ["preventive", "corrective", "predictive", "emergency"]).notNull(),
  description: text("description"),
  performedBy: varchar("performedBy", { length: 255 }),
  cost: int("cost"),
  downtime: int("downtime"), // Tiempo de inactividad en horas
  partsReplaced: text("partsReplaced"),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  scheduledDate: timestamp("scheduledDate"),
  completedDate: timestamp("completedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MaintenanceHistory = typeof maintenanceHistory.$inferSelect;
export type InsertMaintenanceHistory = typeof maintenanceHistory.$inferInsert;