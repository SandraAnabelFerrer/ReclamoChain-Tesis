/**
 * Script para sincronizar un reclamo desde blockchain a MongoDB
 */

const { ethers } = require("hardhat");

async function main() {
    console.log("🔄 Sincronizando reclamo desde blockchain a MongoDB...\n");

    // Pedir el ID
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const siniestroId = await new Promise((resolve) => {
        readline.question(
            "Ingresa el ID del siniestro en blockchain: ",
            (answer) => {
                readline.close();
                resolve(answer);
            }
        );
    });

    if (!siniestroId) {
        console.log("❌ Debes proporcionar un ID");
        process.exit(1);
    }

    const contractAddress =
        process.env.CONTRACT_ADDRESS ||
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("❌ Define CONTRACT_ADDRESS en .env");
    }

    console.log("📍 Contrato:", contractAddress);
    console.log("🆔 Siniestro ID:", siniestroId, "\n");

    // Obtener contrato
    const ReclamacionesSeguros = await ethers.getContractFactory(
        "ReclamacionesSeguros"
    );
    const contrato = ReclamacionesSeguros.attach(contractAddress);

    try {
        // Leer del blockchain
        const reclamo = await contrato.reclamos(siniestroId);

        if (reclamo.siniestroId.toString() === "0") {
            console.log("❌ El reclamo NO EXISTE en blockchain");
            process.exit(1);
        }

        console.log("✅ Reclamo encontrado en blockchain:");
        console.log("   Solicitante:", reclamo.solicitante);
        console.log("   Descripción:", reclamo.descripcion);
        console.log("   Monto:", ethers.formatEther(reclamo.monto), "ETH");
        console.log(
            "   Estado:",
            ["Creado", "Validado", "Aprobado", "Rechazado", "Pagado"][
                reclamo.estado
            ]
        );

        // Datos para MongoDB
        const reclamoData = {
            siniestroId: Number(siniestroId),
            solicitante: reclamo.solicitante,
            descripcion: reclamo.descripcion,
            monto: parseFloat(ethers.formatEther(reclamo.monto)),
            tipoSiniestro: "Reclamo importado desde blockchain",
            numeroPoliza: "POL-SYNC-" + siniestroId,
            documentos: [],
            ubicacion: "",
        };

        console.log("\n📋 Datos para agregar a MongoDB:");
        console.log(JSON.stringify(reclamoData, null, 2));

        console.log(
            "\n💡 Para agregar a MongoDB, ejecuta este código en tu aplicación:"
        );
        console.log(`
const response = await fetch('/api/reclamos/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(${JSON.stringify(reclamoData)})
});
        `);

        console.log("\n📌 O crea el endpoint /api/reclamos/sync/route.ts con:");
        console.log(`
export async function POST(request: NextRequest) {
    const body = await request.json();
    const reclamo = await reclamoService.crearReclamo(body, "0x0"); // Hash dummy
    return NextResponse.json({ success: true, data: reclamo });
}
        `);
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
