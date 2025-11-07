/**
 * Script para depositar fondos en el contrato de reclamaciones
 * Útil para financiar pagos automáticos desde el contrato
 */

const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Depositando fondos en el contrato de reclamaciones...\n");

    // Obtener dirección del contrato
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error(
            "❌ Por favor define CONTRACT_ADDRESS en el archivo .env"
        );
    }

    // Obtener la wallet del deployer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Cuenta que deposita:", deployer.address);

    // Obtener balance actual de la wallet
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    console.log(
        "💰 Balance de la wallet:",
        ethers.formatEther(deployerBalance),
        "ETH\n"
    );

    // Definir cantidad a depositar (0.1 ETH por defecto)
    const depositAmount = process.env.DEPOSIT_AMOUNT || "0.1";
    const amountInWei = ethers.parseEther(depositAmount);

    console.log(`📤 Depositando ${depositAmount} ETH al contrato...`);
    console.log(`📍 Dirección del contrato: ${contractAddress}\n`);

    try {
        // Enviar transacción
        const tx = await deployer.sendTransaction({
            to: contractAddress,
            value: amountInWei,
        });

        console.log("⏳ Transacción enviada. Hash:", tx.hash);
        console.log("⏳ Esperando confirmación...\n");

        // Esperar confirmación
        const receipt = await tx.wait();

        console.log("✅ ¡Fondos depositados exitosamente!");
        console.log("📊 Detalles de la transacción:");
        console.log(`   - Block: ${receipt.blockNumber}`);
        console.log(`   - Gas usado: ${receipt.gasUsed.toString()}`);
        console.log(
            `   - Gas precio: ${ethers.formatUnits(
                receipt.gasPrice || 0n,
                "gwei"
            )} gwei\n`
        );

        // Obtener nuevo balance del contrato
        const contractBalance = await ethers.provider.getBalance(
            contractAddress
        );
        console.log(
            "💎 Nuevo balance del contrato:",
            ethers.formatEther(contractBalance),
            "ETH"
        );

        // Mostrar balance actualizado de la wallet
        const newDeployerBalance = await ethers.provider.getBalance(
            deployer.address
        );
        console.log(
            "💰 Nuevo balance de la wallet:",
            ethers.formatEther(newDeployerBalance),
            "ETH\n"
        );

        // Calcular red
        const network = await ethers.provider.getNetwork();
        const networkName =
            network.chainId === 11155111n
                ? "sepolia"
                : network.chainId === 5n
                ? "goerli"
                : "unknown";

        console.log(
            `🔗 Ver en Etherscan: https://${networkName}.etherscan.io/tx/${tx.hash}`
        );
    } catch (error) {
        console.error("❌ Error depositando fondos:", error);
        throw error;
    }
}

// Ejecutar script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
