import { ethToWei, getContractWrite } from "@/lib/contract";
import { reclamoService } from "@/lib/reclamoService";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/reclamos - Obtener lista de reclamos
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const estado = searchParams.get("estado");
        const solicitante = searchParams.get("solicitante");
        const tipoSiniestro = searchParams.get("tipoSiniestro");
        const pagina = Number.parseInt(searchParams.get("pagina") || "1");
        const limite = Number.parseInt(searchParams.get("limite") || "50");

        const filtros: any = {};
        if (estado) filtros.estado = estado;
        if (solicitante) filtros.solicitante = solicitante;
        if (tipoSiniestro) filtros.tipoSiniestro = tipoSiniestro;

        const resultado = await reclamoService.obtenerReclamos(
            filtros,
            limite,
            pagina
        );
        console.log("Reclamos obtenidos:", resultado);

        return NextResponse.json({
            success: true,
            data: resultado.reclamos,
        });
    } catch (error) {
        console.error("Error obteniendo reclamos:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Error interno del servidor",
                message:
                    error instanceof Error
                        ? error.message
                        : "Error desconocido",
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/reclamos - Crear nuevo reclamo
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { numeroPoliza, descripcion, monto, tipoSiniestro, ubicacion } =
            body;

        // Validaciones
        if (!numeroPoliza || !descripcion || !monto) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Datos faltantes",
                    message: "numeroPoliza, descripcion y monto son requeridos",
                },
                { status: 400 }
            );
        }

        // Generar ID del siniestro automáticamente
        const timestamp = Date.now();
        let siniestroId = parseInt(
            `${timestamp.toString().slice(-8)}${Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0")}`
        );

        // Verificar que el reclamo no exista ya (por si acaso)
        let reclamoExistente = await reclamoService.obtenerReclamoPorId(
            siniestroId
        );
        while (reclamoExistente) {
            // Si por casualidad existe, generar otro ID
            siniestroId = parseInt(
                `${timestamp.toString().slice(-8)}${Math.floor(
                    Math.random() * 1000
                )
                    .toString()
                    .padStart(3, "0")}`
            );
            reclamoExistente = await reclamoService.obtenerReclamoPorId(
                siniestroId
            );
        }

        // Convertir monto a Wei
        const montoWei = ethToWei(monto.toString());

        // Interactuar con el contrato inteligente
        const contrato = getContractWrite();
        const transaccion = await contrato.registrarReclamo(
            siniestroId,
            descripcion,
            montoWei
        );

        // Esperar confirmación de la transacción
        console.log("Esperando confirmación de la transacción", transaccion);
        const recibo = await transaccion.wait();
        console.log("Confirmación de la transacción", recibo.hash);

        // Obtener la dirección del solicitante desde la transacción
        const solicitante = recibo.from;

        // Guardar en MongoDB
        const nuevoReclamo = await reclamoService.crearReclamo(
            {
                siniestroId,
                solicitante,
                descripcion,
                monto: Number(monto),
                tipoSiniestro: tipoSiniestro || "general",
                documentos: [],
                numeroPoliza: numeroPoliza,
                ubicacion: ubicacion || "",
            },
            recibo.hash
        );

        return NextResponse.json({
            success: true,
            data: nuevoReclamo,
            blockchain: {
                transactionHash: recibo.hash,
                blockNumber: recibo.blockNumber,
                gasUsed: recibo.gasUsed.toString(),
            },
        });
    } catch (error) {
        console.error("Error creando reclamo:", error);

        // Manejar errores específicos del contrato
        if (error instanceof Error && error.message.includes("revert")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Error del contrato inteligente",
                    message: error.message,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Error interno del servidor",
                message:
                    error instanceof Error
                        ? error.message
                        : "Error desconocido",
            },
            { status: 500 }
        );
    }
}
