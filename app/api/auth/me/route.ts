import { authService } from "@/lib/authService";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/auth/me - Obtener información del usuario actual
 */
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session");

        if (!sessionCookie) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No hay sesión activa",
                },
                { status: 401 }
            );
        }

        const session = JSON.parse(sessionCookie.value);
        const usuario = await authService.obtenerUsuarioPorId(session.userId);

        if (!usuario || !usuario.activo) {
            // Limpiar cookie inválida
            cookieStore.delete("session");
            return NextResponse.json(
                {
                    success: false,
                    message: "Usuario no encontrado o inactivo",
                },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            usuario: {
                _id: usuario._id?.toString(),
                email: usuario.email,
                nombre: usuario.nombre,
                direccionWallet: usuario.direccionWallet,
                rol: usuario.rol,
            },
        });
    } catch (error) {
        console.error("Error obteniendo usuario:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error interno del servidor",
            },
            { status: 500 }
        );
    }
}

