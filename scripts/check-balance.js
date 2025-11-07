/**
 * Script para verificar el balance del contrato de reclamaciones
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verificando balance del contrato de reclamaciones...\n");

    // Obtener dirección del contrato
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error(
            "❌ Por favor define CONTRACT_ADDRESS en el archivo .env"
        );
    }

    console.log("📍 Dirección del contrato:", contractAddress);

    // Obtener balance
    const balance = await ethers.provider.getBalance(contractAddress);
    const balanceInEth = ethers.formatEther(balance);

    console.log("\n💎 Balance del contrato:", balanceInEth, "ETH");
    console.log("💎 Balance en Wei:", balance.toString(), "wei\n");

    // Obtener ABI del contrato
    const ReclamacionesSeguros = await ethers.getContractFactory(
        "ReclamacionesSeguros"
    );
    const contrato = ReclamacionesSeguros.attach(contractAddress);

    try {
        // Obtener información adicional del contrato
        const totalReclamos = await contrato.obtenerTotalReclamos();
        console.log("📊 Estadísticas del contrato:");
        console.log(`   - Total reclamos: ${totalReclamos.toString()}`);

        // Calcular cuántos pagos se pueden hacer (asumiendo 0.1 ETH por pago)
        const avgPayment = 0.1;
        const pagosPosibles = Math.floor(parseFloat(balanceInEth) / avgPayment);
        console.log(
            `   - Pagos posibles (~${avgPayment} ETH cada uno): ${pagosPosibles}\n`
        );

        // Obtener red
        const network = await ethers.provider.getNetwork();
        const networkName =
            network.chainId === 11155111n
                ? "sepolia"
                : network.chainId === 5n
                ? "goerli"
                : "mainnet";

        console.log(`🌐 Red: ${networkName} (Chain ID: ${network.chainId})`);
        console.log(
            `🔗 Ver en Etherscan: https://${networkName}.etherscan.io/address/${contractAddress}\n`
        );

        // Advertencia si el balance es bajo
        if (parseFloat(balanceInEth) < 0.01) {
            console.log("⚠️  ADVERTENCIA: El balance del contrato es bajo.");
            console.log(
                "    Considera depositar fondos usando: npx hardhat run scripts/deposit-funds.js --network sepolia\n"
            );
        }
    } catch (error) {
        console.error("❌ Error obteniendo información del contrato:", error);
    }
}

// Ejecutar script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
