import { AuthService } from "@/lib/authService";
import { RolUsuario } from "@/models/usuario";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/register - Registrar nuevo usuario
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, nombre, direccionWallet } = body;

        // Validar datos requeridos
        if (!email || !password || !nombre) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email, contraseña y nombre son requeridos",
                },
                { status: 400 }
            );
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Formato de email inválido",
                },
                { status: 400 }
            );
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            return NextResponse.json(
                {
                    success: false,
                    message: "La contraseña debe tener al menos 6 caracteres",
                },
                { status: 400 }
            );
        }

        const authService = new AuthService();

        // Crear el usuario con rol USER
        const nuevoUsuario = await authService.crearUsuario({
            email: email.toLowerCase(),
            password,
            nombre,
            direccionWallet: direccionWallet?.toLowerCase(),
            rol: RolUsuario.USER, // Los usuarios registrados son siempre USER
        });

        return NextResponse.json({
            success: true,
            message: "Usuario registrado exitosamente",
            usuario: {
                _id: nuevoUsuario._id?.toString(),
                email: nuevoUsuario.email,
                nombre: nuevoUsuario.nombre,
                direccionWallet: nuevoUsuario.direccionWallet,
                rol: nuevoUsuario.rol,
            },
        });
    } catch (error: any) {
        console.error("Error en registro:", error);

        // Manejar error de email duplicado
        if (error.message === "El email ya está registrado") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Este email ya está registrado",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Error al registrar usuario",
            },
            { status: 500 }
        );
    }
}
