import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout - Cerrar sesión
 */
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("session");

        return NextResponse.json({
            success: true,
            message: "Sesión cerrada exitosamente",
        });
    } catch (error) {
        console.error("Error en logout:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error cerrando sesión",
            },
            { status: 500 }
        );
    }
}

