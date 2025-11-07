import { getContractWrite, getProvider } from "@/lib/contract";
import { reclamoService } from "@/lib/reclamoService";
import { EstadoReclamoDB } from "@/models/reclamo";
import { ethers } from "ethers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reclamos/[id]/pagar - Procesar pago de un reclamo aprobado
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const siniestroId = Number(params.id);
        const body = await request.json();
        const { metodoPago, hashTransaccion, pagadoPor } = body;

        if (!siniestroId || isNaN(siniestroId)) {
            return NextResponse.json(
                { success: false, message: "ID de siniestro inválido" },
                { status: 400 }
            );
        }

        // Obtener reclamo de MongoDB
        const reclamo = await reclamoService.obtenerReclamoPorId(siniestroId);

        if (!reclamo) {
            return NextResponse.json(
                { success: false, message: "Reclamo no encontrado" },
                { status: 404 }
            );
        }

        // Verificar que el reclamo esté aprobado
        if (reclamo.estado !== EstadoReclamoDB.APROBADO) {
            return NextResponse.json(
                {
                    success: false,
                    message: `El reclamo debe estar aprobado para ser pagado. Estado actual: ${reclamo.estado}`,
                },
                { status: 400 }
            );
        }

        let txHash = hashTransaccion;

        // Si el pago es desde el contrato (backend), procesar la transacción
        if (metodoPago === "contrato") {
            try {
                const contrato = getContractWrite();
                const provider = getProvider();

                // Verificar balance del contrato
                const balance = await provider.getBalance(contrato.target);
                const montoWei = ethers.parseEther(reclamo.monto.toString());

                if (balance < montoWei) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: `Balance insuficiente en el contrato. Balance: ${ethers.formatEther(
                                balance
                            )} ETH, Requerido: ${reclamo.monto} ETH`,
                        },
                        { status: 400 }
                    );
                }

                console.log(
                    `Procesando pago de ${reclamo.monto} ETH para reclamo ${siniestroId}...`
                );

                // Ejecutar transacción en blockchain
                const tx = await contrato.procesarPago(siniestroId, {
                    value: montoWei,
                    gasLimit: 300000,
                });

                console.log("Transacción enviada:", tx.hash);

                // Esperar confirmación
                const receipt = await tx.wait();
                txHash = receipt.hash;

                console.log("Pago confirmado en blockchain:", txHash);
            } catch (blockchainError: any) {
                console.error(
                    "Error en transacción blockchain:",
                    blockchainError
                );
                return NextResponse.json(
                    {
                        success: false,
                        message: `Error en blockchain: ${blockchainError.message}`,
                        error: blockchainError,
                    },
                    { status: 500 }
                );
            }
        }

        // Actualizar estado en MongoDB
        const reclamoActualizado = await reclamoService.actualizarEstado(
            siniestroId,
            EstadoReclamoDB.PAGADO,
            pagadoPor || "Sistema",
            txHash,
            `Pago procesado vía ${
                metodoPago === "metamask" ? "MetaMask" : "Contrato"
            }`
        );

        if (!reclamoActualizado) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Error actualizando el estado en la base de datos",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Pago procesado exitosamente",
            data: {
                siniestroId,
                hashTransaccion: txHash,
                metodoPago,
                monto: reclamo.monto,
                beneficiario: reclamo.solicitante,
            },
        });
    } catch (error) {
        console.error("Error procesando pago:", error);
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
