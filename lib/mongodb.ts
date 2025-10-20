import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Por favor define la variable MONGODB_URI en .env.local")
}

if (!process.env.MONGODB_DB) {
  throw new Error("Por favor define la variable MONGODB_DB en .env.local")
}

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

// En desarrollo, usar una variable global para preservar la conexión
// a través de hot reloads en Next.js
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

/**
 * Conectar a MongoDB y retornar la instancia de la base de datos
 * @returns {Promise<Db>} Instancia de la base de datos MongoDB
 */
export async function connectToDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb
  }

  try {
    const client = new MongoClient(uri)
    await client.connect()

    const db = client.db(dbName)

    cachedClient = client
    cachedDb = db

    console.log("✅ Conectado exitosamente a MongoDB")
    return db
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error)
    throw error
  }
}

/**
 * Cerrar la conexión a MongoDB
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    console.log("🔌 Conexión a MongoDB cerrada")
  }
}
