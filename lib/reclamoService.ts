import type { Collection, Db } from "mongodb";
import {
    EstadoReclamoDB,
    type ActualizarReclamoDTO,
    type CambioEstado,
    type CrearReclamoDTO,
    type FiltrosReclamo,
    type ReclamoDB,
} from "../models/reclamo";
import { connectToDatabase } from "../mongodb";

/**
 * Servicio para gestionar reclamaciones en MongoDB
 */
export class ReclamoService {
    private db: Db | null = null;
    private collection: Collection<ReclamoDB> | null = null;

    /**
     * Inicializar la conexión a la base de datos
     */
    private async init(): Promise<void> {
        if (!this.db) {
            this.db = await connectToDatabase();
            this.collection = this.db.collection<ReclamoDB>("reclamos");

            // Crear índices para optimizar consultas
            await this.crearIndices();
        }
    }

    /**
     * Crear índices en la colección para optimizar consultas
     */
    private async crearIndices(): Promise<void> {
        if (!this.collection) return;

        try {
            // Índice único en siniestroId
            await this.collection.createIndex(
                { siniestroId: 1 },
                { unique: true }
            );

            // Índices para consultas frecuentes
            await this.collection.createIndex({ estado: 1 });
            await this.collection.createIndex({ solicitante: 1 });
            await this.collection.createIndex({ fechaCreacion: -1 });
            await this.collection.createIndex({ tipoSiniestro: 1 });

            // Índice compuesto para filtros complejos
            await this.collection.createIndex({
                estado: 1,
                fechaCreacion: -1,
            });

            console.log("✅ Índices de MongoDB creados exitosamente");
        } catch (error) {
            console.error("❌ Error creando índices:", error);
        }
    }

    /**
     * Crear una nueva reclamación
     */
    async crearReclamo(
        datos: CrearReclamoDTO,
        hashTransaccion: string
    ): Promise<ReclamoDB> {
        await this.init();

        const ahora = new Date();
        const nuevoReclamo: ReclamoDB = {
            ...datos,
            estado: EstadoReclamoDB.CREADO,
            fechaCreacion: ahora,
            fechaActualizacion: ahora,
            hashTransaccionCreacion: hashTransaccion,
            historialCambios: [],
        };

        const resultado = await this.collection!.insertOne(nuevoReclamo);

        return {
            ...nuevoReclamo,
            _id: resultado.insertedId,
        };
    }

    /**
     * Obtener una reclamación por ID de siniestro
     */
    async obtenerReclamoPorId(siniestroId: number): Promise<ReclamoDB | null> {
        await this.init();
        return await this.collection!.findOne({ siniestroId });
    }

    /**
     * Actualizar una reclamación
     */
    async actualizarReclamo(
        siniestroId: number,
        actualizacion: ActualizarReclamoDTO,
        realizadoPor?: string
    ): Promise<ReclamoDB | null> {
        await this.init();

        const reclamoActual = await this.obtenerReclamoPorId(siniestroId);
        if (!reclamoActual) {
            throw new Error(`Reclamo con ID ${siniestroId} no encontrado`);
        }

        const ahora = new Date();
        const cambiosHistorial: Partial<CambioEstado> = {
            fecha: ahora,
            realizadoPor: realizadoPor || "sistema",
        };

        // Si hay cambio de estado, agregarlo al historial
        if (
            actualizacion.estado &&
            actualizacion.estado !== reclamoActual.estado
        ) {
            cambiosHistorial.estadoAnterior = reclamoActual.estado;
            cambiosHistorial.estadoNuevo = actualizacion.estado;

            // Agregar hash de transacción según el tipo de cambio
            if (actualizacion.hashTransaccionValidacion) {
                cambiosHistorial.hashTransaccion =
                    actualizacion.hashTransaccionValidacion;
            } else if (actualizacion.hashTransaccionAprobacion) {
                cambiosHistorial.hashTransaccion =
                    actualizacion.hashTransaccionAprobacion;
            } else if (actualizacion.hashTransaccionPago) {
                cambiosHistorial.hashTransaccion =
                    actualizacion.hashTransaccionPago;
            }
        }

        const actualizacionCompleta = {
            ...actualizacion,
            fechaActualizacion: ahora,
        };

        const resultado = await this.collection!.findOneAndUpdate(
            { siniestroId },
            {
                $set: actualizacionCompleta,
                ...(cambiosHistorial.estadoAnterior && {
                    $push: {
                        historialCambios: cambiosHistorial as CambioEstado,
                    },
                }),
            },
            { returnDocument: "after" }
        );

        return resultado;
    }

    /**
     * Obtener todas las reclamaciones con filtros opcionales
     */
    async obtenerReclamos(
        filtros: FiltrosReclamo = {},
        limite = 50,
        pagina = 1
    ): Promise<{ reclamos: ReclamoDB[]; total: number }> {
        await this.init();

        // Construir query de filtros
        const query: any = {};

        if (filtros.estado) {
            query.estado = filtros.estado;
        }

        if (filtros.solicitante) {
            query.solicitante = filtros.solicitante;
        }

        if (filtros.tipoSiniestro) {
            query.tipoSiniestro = filtros.tipoSiniestro;
        }

        if (filtros.fechaDesde || filtros.fechaHasta) {
            query.fechaCreacion = {};
            if (filtros.fechaDesde) {
                query.fechaCreacion.$gte = filtros.fechaDesde;
            }
            if (filtros.fechaHasta) {
                query.fechaCreacion.$lte = filtros.fechaHasta;
            }
        }

        // Calcular skip para paginación
        const skip = (pagina - 1) * limite;

        // Ejecutar consultas en paralelo
        const [reclamos, total] = await Promise.all([
            this.collection!.find(query)
                .sort({ fechaCreacion: -1 })
                .skip(skip)
                .limit(limite)
                .toArray(),
            this.collection!.countDocuments(query),
        ]);

        return { reclamos, total };
    }

    /**
     * Obtener estadísticas de reclamaciones
     */
    async obtenerEstadisticas(): Promise<{
        totalReclamos: number;
        reclamosPorEstado: Record<EstadoReclamoDB, number>;
        montoTotalReclamado: number;
        montoTotalAprobado: number;
    }> {
        await this.init();

        const pipeline = [
            {
                $group: {
                    _id: "$estado",
                    count: { $sum: 1 },
                    montoTotal: {
                        $sum: {
                            $toDouble: "$monto",
                        },
                    },
                },
            },
        ];

        const resultados = await this.collection!.aggregate(pipeline).toArray();

        const estadisticas = {
            totalReclamos: 0,
            reclamosPorEstado: {} as Record<EstadoReclamoDB, number>,
            montoTotalReclamado: 0,
            montoTotalAprobado: 0,
        };

        // Inicializar contadores
        Object.values(EstadoReclamoDB).forEach((estado) => {
            estadisticas.reclamosPorEstado[estado] = 0;
        });

        // Procesar resultados
        resultados.forEach((resultado) => {
            const estado = resultado._id as EstadoReclamoDB;
            const count = resultado.count;
            const monto = resultado.montoTotal || 0;

            estadisticas.totalReclamos += count;
            estadisticas.reclamosPorEstado[estado] = count;
            estadisticas.montoTotalReclamado += monto;

            if (
                estado === EstadoReclamoDB.APROBADO ||
                estado === EstadoReclamoDB.PAGADO
            ) {
                estadisticas.montoTotalAprobado += monto;
            }
        });

        return estadisticas;
    }

    /**
     * Eliminar una reclamación (solo para desarrollo/testing)
     */
    async eliminarReclamo(siniestroId: number): Promise<boolean> {
        await this.init();

        const resultado = await this.collection!.deleteOne({ siniestroId });
        return resultado.deletedCount > 0;
    }
}

// Instancia singleton del servicio
export const reclamoService = new ReclamoService();
