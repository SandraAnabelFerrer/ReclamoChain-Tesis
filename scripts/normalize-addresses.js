/**
 * Script para normalizar direcciones Ethereum a minúsculas en la base de datos
 * Uso: node scripts/normalize-addresses.js
 */

require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI no está definido en .env.local");
    process.exit(1);
}

async function normalizarDirecciones() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log("✅ Conectado a MongoDB");

        const db = client.db();
        const reclamosCollection = db.collection("reclamos");
        const usuariosCollection = db.collection("usuarios");

        // Normalizar direcciones en reclamos
        console.log("\n📋 Normalizando direcciones en reclamos...");
        const reclamos = await reclamosCollection.find({}).toArray();
        let reclamosActualizados = 0;

        for (const reclamo of reclamos) {
            if (reclamo.solicitante && reclamo.solicitante !== reclamo.solicitante.toLowerCase()) {
                await reclamosCollection.updateOne(
                    { _id: reclamo._id },
                    { $set: { solicitante: reclamo.solicitante.toLowerCase() } }
                );
                reclamosActualizados++;
                console.log(`  ✅ Actualizado reclamo ${reclamo.siniestroId}: ${reclamo.solicitante} -> ${reclamo.solicitante.toLowerCase()}`);
            }
        }

        console.log(`✅ ${reclamosActualizados} reclamos actualizados`);

        // Normalizar direcciones en usuarios
        console.log("\n👥 Normalizando direcciones en usuarios...");
        const usuarios = await usuariosCollection.find({}).toArray();
        let usuariosActualizados = 0;

        for (const usuario of usuarios) {
            if (usuario.direccionWallet && usuario.direccionWallet !== usuario.direccionWallet.toLowerCase()) {
                await usuariosCollection.updateOne(
                    { _id: usuario._id },
                    { $set: { direccionWallet: usuario.direccionWallet.toLowerCase() } }
                );
                usuariosActualizados++;
                console.log(`  ✅ Actualizado usuario ${usuario.email}: ${usuario.direccionWallet} -> ${usuario.direccionWallet.toLowerCase()}`);
            }
        }

        console.log(`✅ ${usuariosActualizados} usuarios actualizados`);

        console.log("\n✅ Migración completada exitosamente");
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await client.close();
    }
}

normalizarDirecciones();

