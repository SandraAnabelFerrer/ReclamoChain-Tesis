import { cookies } from "next/headers";
import { authService } from "./authService";
import type { RolUsuario } from "../models/usuario";

/**
 * Interfaz para la sesión del usuario
 */
export interface Session {
    userId: string;
    email: string;
    nombre: string;
    rol: RolUsuario;
    direccionWallet?: string;
}

/**
 * Obtener la sesión actual del usuario
 */
export async function getSession(): Promise<Session | null> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session");

        if (!sessionCookie) {
            return null;
        }

        const session = JSON.parse(sessionCookie.value) as Session;
        
        // Verificar que el usuario aún existe y está activo
        const usuario = await authService.obtenerUsuarioPorId(session.userId);
        
        if (!usuario || !usuario.activo) {
            return null;
        }

        return session;
    } catch (error) {
        console.error("Error obteniendo sesión:", error);
        return null;
    }
}

/**
 * Verificar si el usuario tiene un rol específico
 */
export async function tieneRol(rol: RolUsuario): Promise<boolean> {
    const session = await getSession();
    return session?.rol === rol;
}

/**
 * Verificar si el usuario es administrador
 */
export async function esAdmin(): Promise<boolean> {
    return await tieneRol("admin" as RolUsuario);
}

/**
 * Requerir autenticación (redirige si no está autenticado)
 */
export async function requireAuth(): Promise<Session> {
    const session = await getSession();
    
    if (!session) {
        throw new Error("No autenticado");
    }
    
    return session;
}

/**
 * Requerir rol específico
 */
export async function requireRole(rol: RolUsuario): Promise<Session> {
    const session = await requireAuth();
    
    if (session.rol !== rol) {
        throw new Error("No autorizado");
    }
    
    return session;
}

