"use client";

import { MainLayout } from "@/components/main-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Users, Plus, Loader2, Shield, User, Wallet, Mail, Calendar } from "lucide-react";
import type { UsuarioDB, RolUsuario } from "@/models/usuario";

interface UsuarioSinPassword extends Omit<UsuarioDB, "password"> {}

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<UsuarioSinPassword[]>([]);
    const [loading, setLoading] = useState(true);
    const [creando, setCreando] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const { toast } = useToast();

    const [formulario, setFormulario] = useState({
        email: "",
        password: "",
        nombre: "",
        direccionWallet: "",
        rol: "user" as RolUsuario,
    });

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/usuarios");
            const data = await response.json();

            if (data.success) {
                setUsuarios(data.data);
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Error cargando usuarios",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            toast({
                title: "Error",
                description: "Error cargando usuarios",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCrearUsuario = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreando(true);

        try {
            const response = await fetch("/api/usuarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formulario),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "¡Usuario creado!",
                    description: `Usuario ${data.data.nombre} creado exitosamente`,
                });
                setFormulario({
                    email: "",
                    password: "",
                    nombre: "",
                    direccionWallet: "",
                    rol: "user",
                });
                setMostrarFormulario(false);
                cargarUsuarios();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Error creando usuario",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error creando usuario:", error);
            toast({
                title: "Error",
                description: "Error creando usuario",
                variant: "destructive",
            });
        } finally {
            setCreando(false);
        }
    };

    const formatearFecha = (fecha: Date | string | undefined) => {
        if (!fecha) return "N/A";
        const fechaObj = typeof fecha === "string" ? new Date(fecha) : fecha;
        return new Intl.DateTimeFormat("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(fechaObj);
    };

    const formatearDireccion = (direccion: string | undefined) => {
        if (!direccion) return "No asociada";
        return `${direccion.substring(0, 6)}...${direccion.substring(38)}`;
    };

    return (
        <AuthGuard requiredRole="admin">
            <MainLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestión de Usuarios
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Administra los usuarios del sistema
                            </p>
                        </div>
                        <Button
                            onClick={() => setMostrarFormulario(!mostrarFormulario)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {mostrarFormulario ? "Cancelar" : "Nuevo Usuario"}
                        </Button>
                    </div>

                    {/* Formulario de creación */}
                    {mostrarFormulario && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Crear Nuevo Usuario</CardTitle>
                                <CardDescription>
                                    Completa los datos para crear un nuevo usuario
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCrearUsuario} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre">Nombre Completo *</Label>
                                            <Input
                                                id="nombre"
                                                value={formulario.nombre}
                                                onChange={(e) =>
                                                    setFormulario({
                                                        ...formulario,
                                                        nombre: e.target.value,
                                                    })
                                                }
                                                required
                                                placeholder="Juan Pérez"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formulario.email}
                                                onChange={(e) =>
                                                    setFormulario({
                                                        ...formulario,
                                                        email: e.target.value,
                                                    })
                                                }
                                                required
                                                placeholder="usuario@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Contraseña *</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={formulario.password}
                                                onChange={(e) =>
                                                    setFormulario({
                                                        ...formulario,
                                                        password: e.target.value,
                                                    })
                                                }
                                                required
                                                minLength={6}
                                                placeholder="Mínimo 6 caracteres"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="rol">Rol *</Label>
                                            <Select
                                                value={formulario.rol}
                                                onValueChange={(value) =>
                                                    setFormulario({
                                                        ...formulario,
                                                        rol: value as RolUsuario,
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un rol" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">Usuario</SelectItem>
                                                    <SelectItem value="admin">Administrador</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="direccionWallet">
                                                Dirección de Wallet (Opcional)
                                            </Label>
                                            <Input
                                                id="direccionWallet"
                                                value={formulario.direccionWallet}
                                                onChange={(e) =>
                                                    setFormulario({
                                                        ...formulario,
                                                        direccionWallet: e.target.value,
                                                    })
                                                }
                                                placeholder="0x..."
                                            />
                                            <p className="text-xs text-gray-500">
                                                Asocia una dirección Ethereum para que el usuario pueda ver sus siniestros
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setMostrarFormulario(false);
                                                setFormulario({
                                                    email: "",
                                                    password: "",
                                                    nombre: "",
                                                    direccionWallet: "",
                                                    rol: "user",
                                                });
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={creando}>
                                            {creando ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Creando...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Crear Usuario
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lista de usuarios */}
                    {loading ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                                <p className="text-gray-600">Cargando usuarios...</p>
                            </CardContent>
                        </Card>
                    ) : usuarios.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No hay usuarios registrados
                                </h3>
                                <p className="text-gray-600">
                                    Crea el primer usuario para comenzar
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {usuarios.map((usuario) => (
                                <Card key={usuario._id?.toString()} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">
                                                        {usuario.nombre}
                                                    </h3>
                                                    <Badge
                                                        variant={
                                                            usuario.rol === "admin"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                        className={
                                                            usuario.rol === "admin"
                                                                ? "bg-blue-600"
                                                                : ""
                                                        }
                                                    >
                                                        {usuario.rol === "admin" ? (
                                                            <Shield className="h-3 w-3 mr-1" />
                                                        ) : (
                                                            <User className="h-3 w-3 mr-1" />
                                                        )}
                                                        {usuario.rol === "admin"
                                                            ? "Administrador"
                                                            : "Usuario"}
                                                    </Badge>
                                                    {!usuario.activo && (
                                                        <Badge variant="destructive">
                                                            Inactivo
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{usuario.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Wallet className="h-4 w-4" />
                                                        <span className="font-mono">
                                                            {formatearDireccion(usuario.direccionWallet)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            Creado: {formatearFecha(usuario.fechaCreacion)}
                                                        </span>
                                                    </div>
                                                    {usuario.fechaUltimoAcceso && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>
                                                                Último acceso:{" "}
                                                                {formatearFecha(usuario.fechaUltimoAcceso)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </MainLayout>
        </AuthGuard>
    );
}

