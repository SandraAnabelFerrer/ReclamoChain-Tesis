"use client";

import { MobileSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
    const [usuario, setUsuario] = useState<any>(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUsuario(data.usuario);
                }
            })
            .catch(() => {});
    }, []);

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

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <MobileSidebar />
            <div className="w-full flex-1">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 md:grow-0">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar reclamaciones..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                {usuario && (
                    <span className="text-sm text-gray-600 hidden md:block">
                        {usuario.nombre}
                    </span>
                )}
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Notificaciones</span>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleLogout}
                    title="Cerrar sesión"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Cerrar sesión</span>
                </Button>
            </div>
        </header>
    );
}
