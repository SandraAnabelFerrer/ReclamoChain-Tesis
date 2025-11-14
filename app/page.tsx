"use client";

import { AdminPanel } from "@/components/admin-panel";
import { MainLayout } from "@/components/main-layout";
import { MisReclamosPanel } from "@/components/mis-reclamos-panel";
import { UserLayout } from "@/components/user-layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
    const [usuario, setUsuario] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUsuario(data.usuario);
                } else {
                    router.push("/login");
                }
            })
            .catch(() => {
                router.push("/login");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!usuario) {
        return null;
    }

    // Mostrar panel según el rol
    if (usuario.rol === "admin") {
        return (
            <MainLayout>
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold md:text-2xl">
                        Panel Administrativo
                    </h1>
                </div>
                <div className="flex-1">
                    <AdminPanel />
                </div>
            </MainLayout>
        );
    }

    // Usuario normal ve su panel de reclamos
    return (
        <UserLayout>
            <MisReclamosPanel />
        </UserLayout>
    );
}
