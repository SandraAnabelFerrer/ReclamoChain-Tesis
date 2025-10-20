import type { ObjectId } from "mongodb"

/**
 * Estados posibles de una reclamación en la base de datos
 */
export enum EstadoReclamoDB {
  CREADO = "creado",
  VALIDADO = "validado",
  APROBADO = "aprobado",
  RECHAZADO = "rechazado",
  PAGADO = "pagado",
}

/**
 * Interfaz para una reclamación en MongoDB
 * Almacena datos adicionales que complementan el contrato inteligente
 */
export interface ReclamoDB {
  _id?: ObjectId
  siniestroId: number // ID único del siniestro (coincide con blockchain)
  solicitante: string // Dirección Ethereum del solicitante
  descripcion: string // Descripción del siniestro
  monto: string // Monto en ETH (como string para precisión)
  montoWei: string // Monto en wei (como string)
  estado: EstadoReclamoDB // Estado actual de la reclamación
  fechaCreacion: Date // Fecha de creación
  fechaActualizacion: Date // Fecha de última actualización

  // Datos adicionales no almacenados en blockchain
  hashTransaccionCreacion?: string // Hash de la transacción de creación
  hashTransaccionValidacion?: string // Hash de la transacción de validación
  hashTransaccionAprobacion?: string // Hash de la transacción de aprobación/rechazo
  hashTransaccionPago?: string // Hash de la transacción de pago

  // Metadatos administrativos
  validadoPor?: string // Dirección que validó
  procesadoPor?: string // Dirección que procesó (aprobó/rechazó)
  notasAdmin?: string // Notas del administrador
  documentosAdjuntos?: string[] // URLs de documentos adjuntos

  // Información adicional del siniestro
  tipoSiniestro?: string // Tipo de siniestro (auto, hogar, vida, etc.)
  ubicacion?: string // Ubicación del siniestro
  fechaSiniestro?: Date // Fecha cuando ocurrió el siniestro
  numeroPoliza?: string // Número de póliza de seguro

  // Auditoría
  historialCambios?: CambioEstado[] // Historial de cambios de estado
}

/**
 * Interfaz para el historial de cambios de estado
 */
export interface CambioEstado {
  estadoAnterior: EstadoReclamoDB
  estadoNuevo: EstadoReclamoDB
  fecha: Date
  realizadoPor: string // Dirección que realizó el cambio
  hashTransaccion?: string // Hash de la transacción blockchain
  notas?: string // Notas del cambio
}

/**
 * Interfaz para crear una nueva reclamación
 */
export interface CrearReclamoDTO {
  siniestroId: number
  solicitante: string
  descripcion: string
  monto: string
  montoWei: string
  tipoSiniestro?: string
  ubicacion?: string
  fechaSiniestro?: Date
  numeroPoliza?: string
  documentosAdjuntos?: string[]
}

/**
 * Interfaz para actualizar una reclamación
 */
export interface ActualizarReclamoDTO {
  estado?: EstadoReclamoDB
  hashTransaccionValidacion?: string
  hashTransaccionAprobacion?: string
  hashTransaccionPago?: string
  validadoPor?: string
  procesadoPor?: string
  notasAdmin?: string
  documentosAdjuntos?: string[]
}

/**
 * Interfaz para filtros de búsqueda
 */
export interface FiltrosReclamo {
  estado?: EstadoReclamoDB
  solicitante?: string
  tipoSiniestro?: string
  fechaDesde?: Date
  fechaHasta?: Date
  montoMinimo?: number
  montoMaximo?: number
}
