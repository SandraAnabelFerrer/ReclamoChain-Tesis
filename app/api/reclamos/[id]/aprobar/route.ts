import { esAdministrador, getContractRead } from "@/lib/contract";
import { reclamoService } from "@/lib/reclamoService";
import { EstadoReclamoDB } from "@/models/reclamo";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reclamos/[id]/aprobar - Actualizar MongoDB después de aprobar en blockchain
 * La transacción blockchain YA se ejecutó desde el frontend con MetaMask
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const siniestroId = Number.parseInt(params.id);
        const body = await request.json();
        const { notas = "", txHash, adminAddress } = body;

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

        // Verificar que se proporcionó el hash de transacción y dirección del admin
        if (!txHash || !adminAddress) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Datos incompletos",
                    message: "Se requiere txHash y adminAddress",
                },
                { status: 400 }
            );
        }

        // Verificar que la dirección es un administrador del contrato
        const esAdmin = await esAdministrador(adminAddress);
        if (!esAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No autorizado",
                    message:
                        "La dirección proporcionada no es administrador del contrato",
                },
                { status: 403 }
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

        // Verificar el estado en el contrato (fuente de verdad)
        const contrato = getContractRead();
        const reclamoBlockchain = await contrato.obtenerReclamo(siniestroId);
        const estadoBlockchain = Number(reclamoBlockchain.estado);

        // Estado 2 = aprobado
        if (estadoBlockchain !== 2) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Estado inconsistente",
                    message: `El reclamo no está aprobado en blockchain (estado: ${estadoBlockchain})`,
                },
                { status: 400 }
            );
        }

        // Actualizar en MongoDB
        const reclamoActualizado = await reclamoService.actualizarReclamo(
            siniestroId,
            {
                estado: EstadoReclamoDB.APROBADO,
                hashTransaccionAprobacion: txHash,
                comentarios: notas,
                evaluador: adminAddress.toLowerCase(),
            },
            adminAddress
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
