export enum EstadoReclamoDB {
    CREADO = "creado",
    VALIDADO = "validado",
    APROBADO = "aprobado",
    RECHAZADO = "rechazado",
    PAGADO = "pagado",
}

export interface CambioEstado {
    fecha: Date;
    estadoAnterior: EstadoReclamoDB;
    estadoNuevo: EstadoReclamoDB;
    realizadoPor: string;
    hashTransaccion?: string;
    comentarios?: string;
}

export interface ReclamoDB {
    _id?: string;
    siniestroId: number;
    solicitante: string;
    emailUsuario?: string; // Email del usuario asignado (para filtrar sin depender de wallet)
    descripcion: string;
    monto: number;
    estado: EstadoReclamoDB;
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tipoSiniestro: string;
    numeroPoliza: string;
    ubicacion?: string;
    documentos: string[];
    hashTransaccionCreacion: string;
    hashTransaccionValidacion?: string;
    hashTransaccionAprobacion?: string;
    hashTransaccionPago?: string;
    comentarios?: string;
    evaluador?: string;
    fechaEvaluacion?: Date;
    historialCambios: CambioEstado[];
}

export interface CrearReclamoDTO {
    siniestroId: number;
    solicitante: string;
    emailUsuario?: string; // Email del usuario asignado
    descripcion: string;
    monto: number;
    tipoSiniestro: string;
    numeroPoliza: string;
    ubicacion?: string;
    documentos: string[];
}

export interface ActualizarReclamoDTO {
    descripcion?: string;
    monto?: number;
    estado?: EstadoReclamoDB;
    tipoSiniestro?: string;
    documentos?: string[];
    comentarios?: string;
    evaluador?: string;
    fechaEvaluacion?: Date;
    hashTransaccionValidacion?: string;
    hashTransaccionAprobacion?: string;
    hashTransaccionPago?: string;
}

export interface FiltrosReclamo {
    estado?: EstadoReclamoDB;
    solicitante?: string;
    emailUsuario?: string; // Filtrar por email del usuario
    numeroPoliza?: string; // Filtrar por número de póliza
    tipoSiniestro?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
}

// Interfaces para compatibilidad con el frontend
export interface Reclamo {
    _id?: string;
    id: string;
    titulo: string;
    descripcion: string;
    monto: number;
    estado: "pendiente" | "aprobado" | "rechazado" | "en_revision";
    fechaCreacion: Date;
    fechaActualizacion: Date;
    tipoReclamo: string;
    documentos: string[];
    direccionWallet: string;
    hashTransaccion?: string;
    comentarios?: string;
    evaluador?: string;
    fechaEvaluacion?: Date;
}

export interface ReclamoCreate {
    titulo: string;
    descripcion: string;
    monto: number;
    tipoReclamo: string;
    documentos: string[];
    direccionWallet: string;
}

export interface ReclamoUpdate {
    titulo?: string;
    descripcion?: string;
    monto?: number;
    estado?: "pendiente" | "aprobado" | "rechazado" | "en_revision";
    tipoReclamo?: string;
    documentos?: string[];
    comentarios?: string;
    evaluador?: string;
    fechaEvaluacion?: Date;
    hashTransaccion?: string;
}
