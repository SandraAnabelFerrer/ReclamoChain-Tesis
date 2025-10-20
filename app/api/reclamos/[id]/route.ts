import {
    getContractRead,
    mapearEstadoContrato,
    weiToEth,
} from "@/lib/contract";
import { reclamoService } from "@/lib/reclamoService";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/reclamos/[id] - Obtener un reclamo específico
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const siniestroId = Number.parseInt(params.id);

        if (isNaN(siniestroId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "ID inválido",
                    message: "El ID del siniestro debe ser un número",
                },
                { status: 400 }
            );
        }

        // Obtener datos de MongoDB
        const reclamoDB = await reclamoService.obtenerReclamoPorId(siniestroId);
        if (!reclamoDB) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Reclamo no encontrado",
                    message: `No se encontró reclamo con ID ${siniestroId}`,
                },
                { status: 404 }
            );
        }

        // Obtener datos del blockchain para verificación
        try {
            const contrato = getContractRead();
            const reclamoBlockchain = await contrato.obtenerReclamo(
                siniestroId
            );

            const datosBlockchain = {
                siniestroId: Number(reclamoBlockchain.siniestroId),
                solicitante: reclamoBlockchain.solicitante,
                descripcion: reclamoBlockchain.descripcion,
                monto: weiToEth(reclamoBlockchain.monto.toString()),
                estado: mapearEstadoContrato(Number(reclamoBlockchain.estado)),
                fechaCreacion: new Date(
                    Number(reclamoBlockchain.fechaCreacion) * 1000
                ),
                fechaActualizacion: new Date(
                    Number(reclamoBlockchain.fechaActualizacion) * 1000
                ),
                validadoPor: reclamoBlockchain.validadoPor,
                procesadoPor: reclamoBlockchain.procesadoPor,
                notasAdmin: reclamoBlockchain.notasAdmin,
            };

            return NextResponse.json({
                success: true,
                data: {
                    database: reclamoDB,
                    blockchain: datosBlockchain,
                },
            });
        } catch (blockchainError) {
            // Si hay error con blockchain, devolver solo datos de DB
            console.warn(
                "Error obteniendo datos de blockchain:",
                blockchainError
            );
            return NextResponse.json({
                success: true,
                data: {
                    database: reclamoDB,
                    blockchain: null,
                    warning: "No se pudieron obtener datos del blockchain",
                },
            });
        }
    } catch (error) {
        console.error("Error obteniendo reclamo:", error);
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
