import { getContractWrite } from "@/lib/contract";
import { reclamoService } from "@/lib/reclamoService";
import { EstadoReclamoDB } from "@/models/reclamo";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reclamos/[id]/aprobar - Aprobar un reclamo
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const siniestroId = Number.parseInt(params.id);
        const body = await request.json();
        const { notas = "" } = body;

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

        // Verificar que el reclamo existe
        const reclamo = await reclamoService.obtenerReclamoPorId(siniestroId);
        if (!reclamo) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Reclamo no encontrado",
                    message: `No se encontró reclamo con ID ${siniestroId}`,
                },
                { status: 404 }
            );
        }

        // Verificar que el reclamo está validado
        if (reclamo.estado !== EstadoReclamoDB.VALIDADO) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Estado inválido",
                    message: "El reclamo debe estar validado para ser aprobado",
                },
                { status: 400 }
            );
        }

        // Interactuar con el contrato inteligente
        const contrato = getContractWrite();
        const transaccion = await contrato.aprobarReclamo(siniestroId, notas);

        // Esperar confirmación
        const recibo = await transaccion.wait();

        // Actualizar en MongoDB
        const reclamoActualizado = await reclamoService.actualizarReclamo(
            siniestroId,
            {
                estado: EstadoReclamoDB.APROBADO,
                hashTransaccionAprobacion: recibo.hash,
                comentarios: notas,
                evaluador: recibo.from,
            },
            recibo.from
        );

        return NextResponse.json({
            success: true,
            data: reclamoActualizado,
            blockchain: {
                transactionHash: recibo.hash,
                blockNumber: recibo.blockNumber,
                gasUsed: recibo.gasUsed.toString(),
            },
        });
    } catch (error) {
        console.error("Error aprobando reclamo:", error);

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
