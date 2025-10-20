const { ethers } = require("hardhat");

/**
 * Script para interactuar con el contrato desplegado
 * Uso: npx hardhat run scripts/interact.js --network sepolia
 */
async function main() {
    // Dirección del contrato desplegado (actualizar con la dirección real)
    const CONTRACT_ADDRESS =
        process.env.CONTRACT_ADDRESS || "TU_DIRECCION_DEL_CONTRATO";

    if (CONTRACT_ADDRESS === "TU_DIRECCION_DEL_CONTRATO") {
        console.log(
            "❌ Por favor, actualiza CONTRACT_ADDRESS con la dirección real del contrato"
        );
        return;
    }

    console.log("🔗 Conectando al contrato en:", CONTRACT_ADDRESS);

    // Obtener signers
    const [deployer, usuario1] = await ethers.getSigners();

    // Conectar al contrato
    const ReclamacionesSeguros = await ethers.getContractFactory(
        "ReclamacionesSeguros"
    );
    const contrato = ReclamacionesSeguros.attach(CONTRACT_ADDRESS);

    console.log("👤 Interactuando como:", deployer.address);

    try {
        // 1. Crear un reclamo de prueba
        console.log("\n📝 Creando reclamo de prueba...");
        const siniestroId = 12345;
        const descripcion = "Accidente de tráfico - Daños en vehículo";
        const monto = ethers.parseEther("1.5"); // 1.5 ETH

        const txCrear = await contrato.registrarReclamo(
            siniestroId,
            descripcion,
            monto
        );
        await txCrear.wait();
        console.log("✅ Reclamo creado con ID:", siniestroId);

        // 2. Obtener información del reclamo
        console.log("\n📋 Obteniendo información del reclamo...");
        const reclamo = await contrato.obtenerReclamo(siniestroId);
        console.log("Solicitante:", reclamo.solicitante);
        console.log("Descripción:", reclamo.descripcion);
        console.log("Monto:", ethers.formatEther(reclamo.monto), "ETH");
        console.log("Estado:", reclamo.estado); // 0 = Creado

        // 3. Validar el reclamo
        console.log("\n✅ Validando reclamo...");
        const txValidar = await contrato.validarReclamo(siniestroId);
        await txValidar.wait();
        console.log("✅ Reclamo validado");

        // 4. Aprobar el reclamo
        console.log("\n👍 Aprobando reclamo...");
        const notasAprobacion = "Documentación completa y válida";
        const txAprobar = await contrato.aprobarReclamo(
            siniestroId,
            notasAprobacion
        );
        await txAprobar.wait();
        console.log("✅ Reclamo aprobado");

        // 5. Verificar estado final
        console.log("\n📊 Estado final del reclamo:");
        const reclamoFinal = await contrato.obtenerReclamo(siniestroId);
        console.log("Estado:", reclamoFinal.estado); // 2 = Aprobado
        console.log("Notas admin:", reclamoFinal.notasAdmin);

        // 6. Obtener total de reclamos
        const totalReclamos = await contrato.obtenerTotalReclamos();
        console.log(
            "\n📈 Total de reclamos registrados:",
            totalReclamos.toString()
        );

        console.log("\n🎉 Interacción completada exitosamente!");
    } catch (error) {
        console.error("❌ Error durante la interacción:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
