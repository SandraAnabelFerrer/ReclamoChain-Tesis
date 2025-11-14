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
        const emailUsuario = searchParams.get("emailUsuario");
        const numeroPoliza = searchParams.get("numeroPoliza");
        const tipoSiniestro = searchParams.get("tipoSiniestro");
        const pagina = Number.parseInt(searchParams.get("pagina") || "1");
        const limite = Number.parseInt(searchParams.get("limite") || "50");

        const filtros: any = {};
        if (estado) filtros.estado = estado;
        if (solicitante) {
            // Normalizar dirección a minúsculas para búsqueda
            filtros.solicitante = solicitante.toLowerCase();
            console.log(
                "🔍 Buscando reclamos para solicitante:",
                filtros.solicitante
            );
        }
        if (emailUsuario) {
            filtros.emailUsuario = emailUsuario.toLowerCase();
            console.log(
                "🔍 Buscando reclamos para email:",
                filtros.emailUsuario
            );
        }
        if (numeroPoliza) {
            filtros.numeroPoliza = numeroPoliza;
            console.log(
                "🔍 Buscando reclamos para póliza:",
                filtros.numeroPoliza
            );
        }
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
        const {
            numeroPoliza,
            descripcion,
            monto,
            tipoSiniestro,
            ubicacion,
            solicitante,
            emailUsuario,
        } = body;

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

        // Validar formato de solicitante si se proporciona
        if (solicitante) {
            // Validar que sea una dirección Ethereum válida
            if (!/^0x[a-fA-F0-9]{40}$/.test(solicitante)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Dirección inválida",
                        message: "La dirección del solicitante no es válida",
                    },
                    { status: 400 }
                );
            }
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
        let contrato;
        try {
            contrato = getContractWrite();
        } catch (contractError: any) {
            console.error("Error obteniendo contrato:", contractError);
            return NextResponse.json(
                {
                    success: false,
                    error: "Error de configuración",
                    message:
                        contractError.message ||
                        "No se pudo obtener el contrato. Verifica las variables de entorno.",
                },
                { status: 500 }
            );
        }

        let transaccion;
        try {
            transaccion = await contrato.registrarReclamo(
                siniestroId,
                descripcion,
                montoWei
            );
        } catch (txError: any) {
            console.error("Error enviando transacción:", txError);
            return NextResponse.json(
                {
                    success: false,
                    error: "Error en la transacción",
                    message:
                        txError.message ||
                        "No se pudo enviar la transacción a la blockchain",
                    details:
                        process.env.NODE_ENV === "development"
                            ? {
                                  code: txError?.code,
                                  reason: txError?.reason,
                              }
                            : undefined,
                },
                { status: 500 }
            );
        }

        // Esperar confirmación de la transacción
        console.log("Esperando confirmación de la transacción", transaccion);
        const recibo = await transaccion.wait();
        console.log("Confirmación de la transacción", recibo.hash);

        // Obtener la dirección del solicitante
        // Si se proporciona en el body (admin creando para otro usuario), usarla
        // Si no, usar la dirección que firmó la transacción
        // Normalizar a minúsculas para evitar problemas de coincidencia
        const direccionSolicitante = (solicitante || recibo.from).toLowerCase();
        console.log(
            "📍 Dirección del solicitante guardada:",
            direccionSolicitante
        );

        // Guardar en MongoDB
        const nuevoReclamo = await reclamoService.crearReclamo(
            {
                siniestroId,
                solicitante: direccionSolicitante,
                emailUsuario: emailUsuario?.toLowerCase(), // Guardar email del usuario si se proporciona
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
    } catch (error: any) {
        console.error("Error creando reclamo:", error);
        console.error("Error stack:", error?.stack);
        console.error("Error details:", {
            message: error?.message,
            code: error?.code,
            reason: error?.reason,
            data: error?.data,
        });

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

        // Manejar errores de ethers
        if (error?.code === "ACTION_REJECTED") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Transacción rechazada",
                    message: "La transacción fue rechazada por el usuario",
                },
                { status: 400 }
            );
        }

        // Manejar errores de red/blockchain
        if (error?.code === "NETWORK_ERROR" || error?.code === "TIMEOUT") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Error de conexión",
                    message:
                        "No se pudo conectar con la blockchain. Verifica tu conexión.",
                },
                { status: 503 }
            );
        }

        // Error genérico
        const errorMessage =
            error instanceof Error
                ? error.message
                : typeof error === "string"
                ? error
                : "Error desconocido al crear el reclamo";

        return NextResponse.json(
            {
                success: false,
                error: "Error interno del servidor",
                message: errorMessage,
                details:
                    process.env.NODE_ENV === "development"
                        ? {
                              stack: error?.stack,
                              code: error?.code,
                              reason: error?.reason,
                          }
                        : undefined,
            },
            { status: 500 }
        );
    }
}
