import { authService } from "@/lib/authService";
import { requireRole } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";
import type { CrearUsuarioDTO, RolUsuario } from "@/models/usuario";

/**
 * GET /api/usuarios - Obtener lista de usuarios (solo admin)
 */
export async function GET(request: NextRequest) {
    try {
        // Verificar que sea admin
        await requireRole("admin");

        const usuarios = await authService.obtenerTodosLosUsuarios();

        return NextResponse.json({
            success: true,
            data: usuarios,
        });
    } catch (error: any) {
        console.error("Error obteniendo usuarios:", error);
        
        if (error.message === "No autenticado") {
            return NextResponse.json(
                {
                    success: false,
                    message: "No autenticado",
                },
                { status: 401 }
            );
        }
        
        if (error.message === "No autorizado") {
            return NextResponse.json(
                {
                    success: false,
                    message: "No tienes permisos para ver usuarios",
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Error interno del servidor",
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/usuarios - Crear nuevo usuario (solo admin)
 */
export async function POST(request: NextRequest) {
    try {
        // Verificar que sea admin
        await requireRole("admin");

        const body = await request.json();
        const { email, password, nombre, direccionWallet, rol } = body;

        // Validaciones
        if (!email || !password || !nombre || !rol) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email, contraseña, nombre y rol son requeridos",
                },
                { status: 400 }
            );
        }

        if (!["admin", "user"].includes(rol)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Rol inválido. Debe ser 'admin' o 'user'",
                },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "La contraseña debe tener al menos 6 caracteres",
                },
                { status: 400 }
            );
        }

        const nuevoUsuario = await authService.crearUsuario({
            email,
            password,
            nombre,
            direccionWallet: direccionWallet || undefined,
            rol: rol as RolUsuario,
        });

        // No devolver la contraseña
        const { password: _, ...usuarioSinPassword } = nuevoUsuario;

        return NextResponse.json(
            {
                success: true,
                data: usuarioSinPassword,
                message: "Usuario creado exitosamente",
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creando usuario:", error);

        if (error.message === "No autenticado") {
            return NextResponse.json(
                {
                    success: false,
                    message: "No autenticado",
                },
                { status: 401 }
            );
        }

        if (error.message === "No autorizado") {
            return NextResponse.json(
                {
                    success: false,
                    message: "No tienes permisos para crear usuarios",
                },
                { status: 403 }
            );
        }

        if (error.message === "El email ya está registrado") {
            return NextResponse.json(
                {
                    success: false,
                    message: "El email ya está registrado",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Error interno del servidor",
            },
            { status: 500 }
        );
    }
}

