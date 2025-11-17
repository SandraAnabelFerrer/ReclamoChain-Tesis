/**
 * Script para depositar fondos en el contrato de reclamaciones
 * Útil para financiar pagos automáticos desde el contrato
 */

const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env.local" });

async function main() {
    console.log("💰 Depositando fondos en el contrato...\n");

    const contractAddress =
        process.env.CONTRACT_ADDRESS ||
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("❌ Define CONTRACT_ADDRESS en .env.local");
    }

    // Monto a depositar (en ETH) - Puedes cambiar este valor
    const montoEth = process.env.DEPOSIT_AMOUNT || "0.001";

    console.log("📍 Contrato:", contractAddress);
    console.log("💵 Monto a depositar:", montoEth, "ETH");
    console.log("");

    const [depositor] = await ethers.getSigners();
    console.log("🔑 Cuenta que deposita:", depositor.address);

    // Consultar balance actual de la cuenta
    const balanceCuenta = await ethers.provider.getBalance(depositor.address);
    console.log(
        "💰 Balance de tu cuenta:",
        ethers.formatEther(balanceCuenta),
        "ETH\n"
    );

    // Verificar que tiene fondos suficientes
    const montoWei = ethers.parseEther(montoEth);
    if (balanceCuenta < montoWei) {
        throw new Error(
            "❌ No tienes suficientes fondos para depositar este monto"
        );
    }

    // Obtener contrato para consultar balance
    const ReclamacionesSeguros = await ethers.getContractFactory(
        "ReclamacionesSeguros"
    );
    const contrato = ReclamacionesSeguros.attach(contractAddress);

    try {
        // Consultar balance actual del contrato
        const balanceAntes = await contrato.obtenerBalance();
        console.log(
            "📊 Balance actual del contrato:",
            ethers.formatEther(balanceAntes),
            "ETH"
        );

        // Depositar fondos
        console.log(`\n📤 Enviando ${montoEth} ETH al contrato...`);
        const tx = await depositor.sendTransaction({
            to: contractAddress,
            value: montoWei,
        });

        console.log("⏳ Hash:", tx.hash);
        console.log("⏳ Esperando confirmación...\n");

        const receipt = await tx.wait();

        console.log("✅ ¡Fondos depositados exitosamente!");
        console.log("📊 Detalles de la transacción:");
        console.log("   Block:", receipt.blockNumber);
        console.log("   Gas usado:", receipt.gasUsed.toString());
        console.log("   Hash:", receipt.hash);

        // Consultar nuevo balance del contrato
        const balanceDespues = await contrato.obtenerBalance();
        console.log(
            "\n💰 Nuevo balance del contrato:",
            ethers.formatEther(balanceDespues),
            "ETH"
        );

        console.log("\n📌 RESUMEN:");
        console.log("   Depositado:", ethers.formatEther(montoWei), "ETH");
        console.log(
            "   Balance anterior:",
            ethers.formatEther(balanceAntes),
            "ETH"
        );
        console.log(
            "   Balance actual:",
            ethers.formatEther(balanceDespues),
            "ETH"
        );

        // Verificar en Etherscan
        const network = await ethers.provider.getNetwork();
        const explorerUrl =
            network.chainId === 11155111n
                ? "https://sepolia.etherscan.io"
                : "https://etherscan.io";
        console.log("\n🔍 Ver en explorer:");
        console.log(`   ${explorerUrl}/tx/${receipt.hash}`);
        console.log(`   ${explorerUrl}/address/${contractAddress}`);
    } catch (error) {
        console.error("\n❌ Error:", error.message);

        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 No tienes suficiente ETH en tu cuenta.");
            console.log("   Asegúrate de tener fondos en la red Sepolia.");
            console.log(
                "   Puedes obtener ETH de prueba en: https://sepoliafaucet.com/"
            );
        }

        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
