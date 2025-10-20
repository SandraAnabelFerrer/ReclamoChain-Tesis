const { MongoClient } = require("mongodb")
require("dotenv").config({ path: ".env.local" })

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "blockchain-insurance"

async function setupDatabase() {
  console.log("🚀 Configurando base de datos MongoDB...\n")

  let client
  try {
    // Conectar a MongoDB
    client = new MongoClient(uri)
    await client.connect()
    console.log("✅ Conectado a MongoDB")

    const db = client.db(dbName)

    // Crear colección de reclamos si no existe
    const collections = await db.listCollections().toArray()
    const reclamosExists = collections.some((col) => col.name === "reclamos")

    if (!reclamosExists) {
      await db.createCollection("reclamos")
      console.log('✅ Colección "reclamos" creada')
    } else {
      console.log('ℹ️  Colección "reclamos" ya existe')
    }

    const reclamosCollection = db.collection("reclamos")

    // Crear índices
    console.log("📊 Creando índices...")

    await reclamosCollection.createIndex({ siniestroId: 1 }, { unique: true })
    console.log("  ✅ Índice único en siniestroId")

    await reclamosCollection.createIndex({ estado: 1 })
    console.log("  ✅ Índice en estado")

    await reclamosCollection.createIndex({ solicitante: 1 })
    console.log("  ✅ Índice en solicitante")

    await reclamosCollection.createIndex({ fechaCreacion: -1 })
    console.log("  ✅ Índice en fechaCreacion")

    await reclamosCollection.createIndex({ tipoSiniestro: 1 })
    console.log("  ✅ Índice en tipoSiniestro")

    await reclamosCollection.createIndex({
      estado: 1,
      fechaCreacion: -1,
    })
    console.log("  ✅ Índice compuesto estado + fechaCreacion")

    // Insertar datos de prueba si la colección está vacía
    const count = await reclamosCollection.countDocuments()
    if (count === 0) {
      console.log("📝 Insertando datos de prueba...")

      const datosEjemplo = [
        {
          siniestroId: 1001,
          solicitante: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
          descripcion: "Accidente de tráfico en Av. Principal",
          monto: "2.5",
          montoWei: "2500000000000000000",
          estado: "creado",
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          tipoSiniestro: "auto",
          ubicacion: "Ciudad de México",
          numeroPoliza: "POL-2024-001",
          historialCambios: [],
        },
        {
          siniestroId: 1002,
          solicitante: "0x8ba1f109551bD432803012645Hac136c30C6C8b",
          descripcion: "Daños por inundación en vivienda",
          monto: "5.0",
          montoWei: "5000000000000000000",
          estado: "validado",
          fechaCreacion: new Date(Date.now() - 86400000), // Ayer
          fechaActualizacion: new Date(),
          tipoSiniestro: "hogar",
          ubicacion: "Guadalajara",
          numeroPoliza: "POL-2024-002",
          validadoPor: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
          historialCambios: [
            {
              estadoAnterior: "creado",
              estadoNuevo: "validado",
              fecha: new Date(),
              realizadoPor: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C8b",
            },
          ],
        },
      ]

      await reclamosCollection.insertMany(datosEjemplo)
      console.log("  ✅ Datos de prueba insertados")
    } else {
      console.log(`ℹ️  La colección ya contiene ${count} documentos`)
    }

    console.log("\n🎉 Configuración de MongoDB completada exitosamente!")

    // Mostrar información de la base de datos
    console.log("\n📋 Información de la base de datos:")
    console.log(`  Base de datos: ${dbName}`)
    console.log(`  URI: ${uri}`)
    console.log(`  Colecciones: ${collections.length}`)

    const stats = await db.stats()
    console.log(`  Tamaño: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`)
  } catch (error) {
    console.error("❌ Error configurando MongoDB:", error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 Conexión cerrada")
    }
  }
}

// Ejecutar configuración
setupDatabase()
