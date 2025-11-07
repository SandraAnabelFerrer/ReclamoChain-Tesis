/**
 * Script para crear un reclamo de prueba directamente en blockchain
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Creando reclamo de prueba...\n");

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("❌ Define CONTRACT_ADDRESS en .env");
    }

    const [signer] = await ethers.getSigners();
    console.log("👛 Cuenta:", signer.address);

    // Obtener contrato
    const ReclamacionesSeguros = await ethers.getContractFactory(
        "ReclamacionesSeguros"
    );
    const contrato = ReclamacionesSeguros.attach(contractAddress);

    // Generar ID único
    const timestamp = Date.now();
    const siniestroId = parseInt(
        `${timestamp.toString().slice(-8)}${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`
    );

    const descripcion = "Reclamo de prueba - Daños en vehículo";
    const montoEth = "0.001"; // 0.001 ETH
    const montoWei = ethers.parseEther(montoEth);

    console.log("📝 Datos del reclamo:");
    console.log("   ID:", siniestroId);
    console.log("   Descripción:", descripcion);
    console.log("   Monto:", montoEth, "ETH\n");

    try {
        // Crear reclamo en blockchain
        console.log("📤 Enviando transacción...");
        const tx = await contrato.registrarReclamo(
            siniestroId,
            descripcion,
            montoWei
        );

        console.log("⏳ Hash:", tx.hash);
        console.log("⏳ Esperando confirmación...\n");

        const receipt = await tx.wait();

        console.log("✅ ¡Reclamo creado exitosamente!");
        console.log("📊 Detalles:");
        console.log("   Block:", receipt.blockNumber);
        console.log("   Gas usado:", receipt.gasUsed.toString());
        console.log("   Hash:", receipt.hash);

        // Verificar que se creó
        const reclamo = await contrato.reclamos(siniestroId);
        console.log("\n✅ Verificación:");
        console.log("   Siniestro ID:", reclamo.siniestroId.toString());
        console.log("   Solicitante:", reclamo.solicitante);
        console.log("   Monto:", ethers.formatEther(reclamo.monto), "ETH");
        console.log(
            "   Estado:",
            ["Creado", "Validado", "Aprobado", "Rechazado", "Pagado"][
                reclamo.estado
            ]
        );

        console.log("\n📌 SIGUIENTE PASO:");
        console.log(`   Usa este ID en tu aplicación: ${siniestroId}`);
        console.log("   1. Valida el reclamo desde /admin");
        console.log("   2. Aprueba el reclamo");
        console.log("   3. Procesa el pago con MetaMask");

        // Obtener red
        const network = await ethers.provider.getNetwork();
        const networkName =
            network.chainId === 11155111n ? "sepolia" : "goerli";
        console.log(
            `\n🔗 Ver en Etherscan: https://${networkName}.etherscan.io/tx/${receipt.hash}`
        );
    } catch (error) {
        console.error("\n❌ Error:", error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
