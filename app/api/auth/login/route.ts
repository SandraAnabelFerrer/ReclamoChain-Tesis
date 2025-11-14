import { authService } from "@/lib/authService";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/login - Autenticar usuario
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email y contraseña son requeridos",
                },
                { status: 400 }
            );
        }

        const usuario = await authService.login({ email, password });

        if (!usuario) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Credenciales inválidas",
                },
                { status: 401 }
            );
        }

        // Crear sesión (usando cookies)
        const cookieStore = await cookies();
        cookieStore.set("session", JSON.stringify({
            userId: usuario._id?.toString(),
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
            direccionWallet: usuario.direccionWallet,
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 días
        });

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
        console.error("Error en login:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error interno del servidor",
            },
            { status: 500 }
        );
    }
}

