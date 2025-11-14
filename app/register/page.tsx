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
import { UserPlus, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        password: "",
        confirmPassword: "",
        direccionWallet: "",
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Las contraseñas no coinciden",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        // Validar longitud de contraseña
        if (formData.password.length < 6) {
            toast({
                title: "Error",
                description: "La contraseña debe tener al menos 6 caracteres",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    nombre: formData.nombre,
                    direccionWallet: formData.direccionWallet || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "¡Registro exitoso!",
                    description:
                        "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
                });

                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                toast({
                    title: "Error en el registro",
                    description: data.message || "No se pudo crear la cuenta",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error en registro:", error);
            toast({
                title: "Error",
                description: "Error al crear la cuenta. Intenta de nuevo.",
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
                            <UserPlus className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Crear Cuenta
                    </CardTitle>
                    <CardDescription>
                        Regístrate para acceder al sistema de reclamaciones
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre Completo</Label>
                            <Input
                                id="nombre"
                                name="nombre"
                                type="text"
                                placeholder="Juan Pérez"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <p className="text-xs text-gray-500">
                                Mínimo 6 caracteres
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirmar Contraseña
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="direccionWallet">
                                Dirección de Wallet (Opcional)
                            </Label>
                            <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-gray-500" />
                                <Input
                                    id="direccionWallet"
                                    name="direccionWallet"
                                    type="text"
                                    placeholder="0x..."
                                    value={formData.direccionWallet}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Puedes agregar tu wallet de Ethereum más tarde
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}>
                            {loading ? "Creando cuenta..." : "Registrarse"}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">
                                ¿Ya tienes cuenta?{" "}
                            </span>
                            <Link
                                href="/login"
                                className="text-blue-600 hover:underline font-medium">
                                Iniciar sesión
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
