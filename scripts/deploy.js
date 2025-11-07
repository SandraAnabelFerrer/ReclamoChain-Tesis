const { ethers } = require("hardhat");
const hre = require("hardhat"); // Declared hre variable

/**
 * Script para desplegar el contrato ReclamacionesSeguros
 * Uso: npx hardhat run scripts/deploy.js --network sepolia
 */
async function main() {
    console.log(
        "🚀 Iniciando despliegue del contrato ReclamacionesSeguros...\n"
    );

    // Obtener el deployer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Desplegando con la cuenta:", deployer.address);

    // Verificar balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(
        "💰 Balance de la cuenta:",
        ethers.formatEther(balance),
        "ETH\n"
    );

    // Obtener el contrato factory
    const ReclamacionesSeguros = await ethers.getContractFactory(
        "ReclamacionesSeguros"
    );

    console.log("⏳ Desplegando contrato...");

    // Desplegar el contrato
    const contrato = await ReclamacionesSeguros.deploy();

    // Esperar confirmación (ethers v6)
    await contrato.waitForDeployment();
    const contractAddress = await contrato.getAddress();
    const deployTx = contrato.deploymentTransaction();

    console.log("✅ Contrato desplegado exitosamente!");
    console.log("📍 Dirección del contrato:", contractAddress);
    console.log("🔗 Hash de transacción:", deployTx?.hash || "N/A");

    // Verificar que el contrato se desplegó correctamente
    const propietario = await contrato.propietario();
    console.log("👤 Propietario del contrato:", propietario);

    // Guardar información del despliegue
    const deploymentInfo = {
        contractAddress: contractAddress,
        deployerAddress: deployer.address,
        transactionHash: deployTx?.hash || "N/A",
        network: hre.network.name,
        timestamp: new Date().toISOString(),
    };

    console.log("\n📋 Información del despliegue:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🔧 Para verificar el contrato en Etherscan:");
    console.log(
        `npx hardhat verify --network ${hre.network.name} ${contractAddress}`
    );

    console.log("\n📝 Agrega esta dirección a tu archivo .env.local:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);

    console.log(
        "\n⚠️  IMPORTANTE: Actualiza el CONTRACT_ADDRESS en .env.local con la nueva dirección!"
    );
}

// Ejecutar el script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error durante el despliegue:", error);
        process.exit(1);
    });
