/**
 * Script para verificar si un reclamo existe en el blockchain
 */

const { ethers } = require("hardhat");

async function main() {
    // Pedir el ID al usuario
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const siniestroId = await new Promise((resolve) => {
        readline.question("Ingresa el ID del siniestro: ", (answer) => {
            readline.close();
            resolve(answer);
        });
    });

    if (!siniestroId) {
        console.log("❌ Por favor proporciona el ID del siniestro");
        process.exit(1);
    }

    console.log(`🔍 Verificando reclamo ${siniestroId} en blockchain...\n`);

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("❌ Define CONTRACT_ADDRESS en .env");
    }

    console.log("📍 Dirección del contrato:", contractAddress);

    // Obtener contrato
    const ReclamacionesSeguros = await ethers.getContractFactory(
        "ReclamacionesSeguros"
    );
    const contrato = ReclamacionesSeguros.attach(contractAddress);

    try {
        // Intentar leer el reclamo
        const reclamo = await contrato.reclamos(siniestroId);

        console.log("\n📊 Información del reclamo:\n");
        console.log("  Siniestro ID:", reclamo.siniestroId.toString());
        console.log("  Solicitante:", reclamo.solicitante);
        console.log("  Descripción:", reclamo.descripcion);
        console.log("  Monto:", ethers.formatEther(reclamo.monto), "ETH");
        console.log(
            "  Estado:",
            ["Creado", "Validado", "Aprobado", "Rechazado", "Pagado"][
                reclamo.estado
            ]
        );
        console.log(
            "  Fecha creación:",
            new Date(Number(reclamo.fechaCreacion) * 1000).toLocaleString()
        );
        console.log("  Validado por:", reclamo.validadoPor);
        console.log("  Procesado por:", reclamo.procesadoPor);
        console.log("  Notas admin:", reclamo.notasAdmin || "(ninguna)");

        // Verificar si existe
        if (reclamo.siniestroId.toString() === "0") {
            console.log("\n❌ EL RECLAMO NO EXISTE EN BLOCKCHAIN");
            console.log("\n💡 Soluciones:");
            console.log(
                "   1. Verifica que el reclamo se haya creado correctamente"
            );
            console.log(
                "   2. Crea el reclamo en blockchain usando el script de creación"
            );
            console.log("   3. Revisa los logs de transacciones en MongoDB");
        } else {
            console.log("\n✅ El reclamo existe en blockchain");

            // Mostrar siguiente paso según estado
            const estado = Number(reclamo.estado);
            if (estado === 0) {
                console.log("\n📌 Siguiente paso: VALIDAR el reclamo");
            } else if (estado === 1) {
                console.log(
                    "\n📌 Siguiente paso: APROBAR o RECHAZAR el reclamo"
                );
            } else if (estado === 2) {
                console.log("\n📌 Siguiente paso: PROCESAR PAGO");
            } else if (estado === 3) {
                console.log("\n⛔ El reclamo fue RECHAZADO");
            } else if (estado === 4) {
                console.log("\n✅ El reclamo ya fue PAGADO");
            }
        }

        // Obtener total de reclamos
        const total = await contrato.obtenerTotalReclamos();
        console.log("\n📈 Total de reclamos en blockchain:", total.toString());
    } catch (error) {
        console.error("\n❌ Error consultando el reclamo:", error.message);
        console.log(
            "\n💡 Esto probablemente significa que el reclamo NO EXISTE en blockchain"
        );
        console.log("   Verifica que el ID sea correcto:", siniestroId);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
