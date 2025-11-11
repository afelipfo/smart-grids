import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

async function initializeData() {
  console.log("Conectando a la base de datos...");
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  console.log("Inicializando datos del sistema...");
  
  // Importar dinámicamente el módulo
  const { initializeSystemData } = await import("./server/utils/initializeData.ts");
  
  await initializeSystemData();
  
  console.log("✅ Datos inicializados exitosamente");
  await connection.end();
  process.exit(0);
}

initializeData().catch((error) => {
  console.error("Error al inicializar datos:", error);
  process.exit(1);
});
