"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, LogOut, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserLayoutProps {
    children: React.ReactNode;
}

const navbarItems = [
    {
        name: "Mis Reclamos",
        href: "/",
        icon: FileText,
    },
    {
        name: "Nuevo Reclamo",
        href: "/crear-reclamo",
        icon: Plus,
    },
];

export function UserLayout({ children }: UserLayoutProps) {
    const [usuario, setUsuario] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    useEffect(() => {
        verificarSesion();
    }, []);

    const verificarSesion = async () => {
        try {
            const response = await fetch("/api/auth/me");
            const data = await response.json();

            if (data.success) {
                setUsuario(data.usuario);
            } else {
                router.push("/login");
            }
        } catch (error) {
            console.error("Error verificando sesión:", error);
            router.push("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (response.ok) {
                toast({
                    title: "Sesión cerrada",
                    description: "Has cerrado sesión exitosamente",
                });
                router.push("/login");
            }
        } catch (error) {
            console.error("Error cerrando sesión:", error);
        }
    };

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/mis-reclamos"
                                className="flex items-center gap-2">
                                <Wallet className="h-6 w-6 text-blue-600" />
                                <span className="font-semibold text-lg">
                                    Sistema de Seguros
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {usuario.nombre || usuario.email}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Salir
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {navbarItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium ${
                                    pathname === item.href
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-700 hover:text-blue-600"
                                }`}>
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
