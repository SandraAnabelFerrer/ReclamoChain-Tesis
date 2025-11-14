"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole?: "admin" | "user";
    redirectTo?: string;
}

export function AuthGuard({
    children,
    requiredRole,
    redirectTo = "/login",
}: AuthGuardProps) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        verificarAuth();
    }, []);

    const verificarAuth = async () => {
        try {
            const response = await fetch("/api/auth/me");
            const data = await response.json();

            if (!data.success) {
                router.push(redirectTo);
                return;
            }

            // Si se requiere un rol específico, verificar
            if (requiredRole && data.usuario.rol !== requiredRole) {
                toast({
                    title: "Acceso denegado",
                    description: "No tienes permisos para acceder a esta página",
                    variant: "destructive",
                });
                router.push("/mis-siniestros");
                return;
            }

            setAuthorized(true);
        } catch (error) {
            console.error("Error verificando autenticación:", error);
            router.push(redirectTo);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return null;
    }

    return <>{children}</>;
}

