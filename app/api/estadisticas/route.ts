import { getContractRead, getProvider } from "@/lib/contract";
import { reclamoService } from "@/lib/reclamoService";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/estadisticas - Obtener estadísticas del sistema
 */
export async function GET(request: NextRequest) {
    try {
        // Obtener estadísticas de MongoDB
        const estadisticasDB = await reclamoService.obtenerEstadisticas();
        const estadisticasPorTipo =
            await reclamoService.getEstadisticasPorTipo();

        // Obtener estadísticas del blockchain
        let estadisticasBlockchain = null;
        try {
            const contrato = getContractRead();
            const provider = getProvider();
            const totalReclamosBlockchain =
                await contrato.obtenerTotalReclamos();
            const balance = await provider.getBalance(contrato.target);

            estadisticasBlockchain = {
                totalReclamos: Number(totalReclamosBlockchain),
                balanceContrato: balance.toString(),
                direccionContrato: contrato.target,
            };
        } catch (blockchainError) {
            console.warn(
                "Error obteniendo estadísticas de blockchain:",
                blockchainError
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                database: {
                    ...estadisticasDB,
                    porTipo: estadisticasPorTipo,
                },
                blockchain: estadisticasBlockchain,
            },
        });
    } catch (error) {
        console.error("Error obteniendo estadísticas:", error);
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
