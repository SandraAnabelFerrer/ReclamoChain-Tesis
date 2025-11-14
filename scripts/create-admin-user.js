/**
 * Script para crear un usuario administrador inicial
 * Uso: node scripts/create-admin-user.js
 */

require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI no está definido en .env.local");
    process.exit(1);
}

async function crearAdmin() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log("✅ Conectado a MongoDB");

        const db = client.db();
        const usuariosCollection = db.collection("usuarios");

        // Datos del administrador (cambiar estos valores)
        const email = process.argv[2] || "admin@seguros.com";
        const password = process.argv[3] || "admin123";
        const nombre = process.argv[4] || "Administrador";

        // Verificar si ya existe
        const existe = await usuariosCollection.findOne({ email });
        if (existe) {
            console.log("⚠️  El usuario ya existe:", email);
            process.exit(0);
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario admin
        const resultado = await usuariosCollection.insertOne({
            email,
            password: passwordHash,
            nombre,
            rol: "admin",
            activo: true,
            fechaCreacion: new Date(),
        });

        console.log("✅ Usuario administrador creado:");
        console.log("   Email:", email);
        console.log("   Contraseña:", password);
        console.log("   Nombre:", nombre);
        console.log("   ID:", resultado.insertedId);
        console.log("\n💡 Puedes cambiar la contraseña después del primer login");
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await client.close();
    }
}

crearAdmin();

