import type { ObjectId } from "mongodb";

/**
 * Roles de usuario en el sistema
 */
export enum RolUsuario {
    ADMIN = "admin",
    USER = "user",
}

/**
 * Interfaz para un usuario en MongoDB
 */
export interface UsuarioDB {
    _id?: ObjectId;
    email: string; // Email único del usuario
    password: string; // Hash de la contraseña (bcrypt)
    nombre: string; // Nombre completo
    direccionWallet?: string; // Dirección Ethereum del usuario (opcional)
    rol: RolUsuario; // Rol del usuario (admin o user)
    activo: boolean; // Si el usuario está activo
    fechaCreacion: Date; // Fecha de creación
    fechaUltimoAcceso?: Date; // Fecha del último acceso
}

/**
 * Interfaz para crear un nuevo usuario
 */
export interface CrearUsuarioDTO {
    email: string;
    password: string;
    nombre: string;
    direccionWallet?: string;
    rol: RolUsuario;
}

/**
 * Interfaz para login
 */
export interface LoginDTO {
    email: string;
    password: string;
}

/**
 * Interfaz para respuesta de autenticación
 */
export interface AuthResponse {
    success: boolean;
    usuario?: {
        _id: string;
        email: string;
        nombre: string;
        direccionWallet?: string;
        rol: RolUsuario;
    };
    token?: string;
    message?: string;
}

