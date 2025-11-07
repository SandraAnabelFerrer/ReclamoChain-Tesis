import { reclamoService } from "@/lib/reclamoService";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reclamos/sync - Sincronizar un reclamo desde blockchain a MongoDB
 * Útil cuando un reclamo existe en blockchain pero no en la DB
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            siniestroId,
            solicitante,
            descripcion,
            monto,
            tipoSiniestro,
            numeroPoliza,
            ubicacion,
        } = body;

        // Validaciones
        if (!siniestroId || !solicitante || !descripcion || !monto) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Datos faltantes",
                    message:
                        "siniestroId, solicitante, descripcion y monto son requeridos",
                },
                { status: 400 }
            );
        }

        // Verificar si ya existe
        const existe = await reclamoService.obtenerReclamoPorId(siniestroId);
        if (existe) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Reclamo ya existe en MongoDB",
                    message: `El reclamo ${siniestroId} ya está registrado`,
                },
                { status: 400 }
            );
        }

        // Crear en MongoDB (sin transacción blockchain porque ya existe)
        const nuevoReclamo = await reclamoService.crearReclamo(
            {
                siniestroId,
                solicitante,
                descripcion,
                monto: Number(monto),
                tipoSiniestro: tipoSiniestro || "Sincronizado desde blockchain",
                documentos: [],
                numeroPoliza: numeroPoliza || `POL-SYNC-${siniestroId}`,
                ubicacion: ubicacion || "",
            },
            "0x0000000000000000000000000000000000000000000000000000000000000000" // Hash dummy
        );

        return NextResponse.json({
            success: true,
            data: nuevoReclamo,
            message: "Reclamo sincronizado correctamente desde blockchain",
        });
    } catch (error) {
        console.error("Error sincronizando reclamo:", error);
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
