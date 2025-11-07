/**
 * Script para agregar un administrador al contrato
 */

const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env.local" });

async function main() {
    console.log("👤 Agregando administrador al contrato...\n");

    const contractAddress =
        process.env.CONTRACT_ADDRESS ||
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("❌ Define CONTRACT_ADDRESS en .env.local");
    }

    // Dirección del nuevo admin (tu wallet de MetaMask)
    const newAdmin = "0x84B402a8AA34fAa78a1EbfdeBCAa803F4f9C6a47";

    console.log("📍 Contrato:", contractAddress);
    console.log("👤 Nuevo Admin:", newAdmin);
    console.log("");

    const [owner] = await ethers.getSigners();
    console.log("🔑 Cuenta propietario:", owner.address);

    // Obtener contrato
    const ReclamacionesSeguros = await ethers.getContractFactory(
        "ReclamacionesSeguros"
    );
    const contrato = ReclamacionesSeguros.attach(contractAddress);

    try {
        // Verificar si ya es admin
        const esAdmin = await contrato.administradores(newAdmin);

        if (esAdmin) {
            console.log("✅ La dirección YA ES administrador");
            return;
        }

        console.log("📤 Enviando transacción para agregar administrador...");
        const tx = await contrato.agregarAdministrador(newAdmin);

        console.log("⏳ Hash:", tx.hash);
        console.log("⏳ Esperando confirmación...\n");

        const receipt = await tx.wait();

        console.log("✅ ¡Administrador agregado exitosamente!");
        console.log("📊 Detalles:");
        console.log("   Block:", receipt.blockNumber);
        console.log("   Gas usado:", receipt.gasUsed.toString());
        console.log("   Hash:", receipt.hash);

        // Verificar
        const esAdminAhora = await contrato.administradores(newAdmin);
        console.log(
            "\n✅ Verificación:",
            esAdminAhora ? "Es administrador ✓" : "NO es administrador ✗"
        );

        console.log("\n📌 SIGUIENTE PASO:");
        console.log("   1. Recarga tu aplicación en el navegador");
        console.log("   2. Intenta procesar el pago del reclamo 2217058678");
        console.log(
            "   3. MetaMask debería aparecer para confirmar la transacción"
        );
    } catch (error) {
        console.error("\n❌ Error:", error.message);

        if (error.message.includes("Ownable: caller is not the owner")) {
            console.log(
                "\n💡 La cuenta que ejecuta el script debe ser el PROPIETARIO del contrato."
            );
            console.log(
                "   Verifica que PRIVATE_KEY en .env.local sea la del propietario."
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
