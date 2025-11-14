"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "¡Bienvenido!",
                    description: `Hola ${data.usuario.nombre}`,
                });

                // Redirigir según el rol
                if (data.usuario.rol === "admin") {
                    router.push("/admin");
                } else {
                    router.push("/mis-reclamos");
                }
            } else {
                toast({
                    title: "Error de autenticación",
                    description: data.message || "Credenciales inválidas",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error en login:", error);
            toast({
                title: "Error",
                description: "Error al iniciar sesión. Intenta de nuevo.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Wallet className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Sistema de Reclamaciones
                    </CardTitle>
                    <CardDescription>
                        Inicia sesión para acceder a tu cuenta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}>
                            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">
                                ¿No tienes cuenta?{" "}
                            </span>
                            <Link
                                href="/register"
                                className="text-blue-600 hover:underline font-medium">
                                Registrarse
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
