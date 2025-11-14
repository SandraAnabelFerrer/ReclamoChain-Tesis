"use client";

import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { FileText, Plus, Loader2, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { ethers } from "ethers";

interface Reclamo {
    _id: string;
    numeroPoliza: string;
    descripcion: string;
    monto: string;
    estado: string;
    solicitante: string;
    tipoSiniestro: string;
    fechaCreacion: string;
    siniestroId?: number;
    hashTransaccionCreacion?: string;
}

const estadoColors: Record<string, string> = {
    pendiente: "bg-yellow-500",
    validado: "bg-blue-500",
    aprobado: "bg-green-500",
    rechazado: "bg-red-500",
    pagado: "bg-purple-500",
};

const estadoIcons: Record<string, any> = {
    pendiente: Clock,
    validado: AlertCircle,
    aprobado: CheckCircle,
    rechazado: XCircle,
    pagado: CheckCircle,
};

export default function SiniestrosPage() {
    const [reclamos, setReclamos] = useState<Reclamo[]>([]);
    const [loading, setLoading] = useState(true);
    const [creando, setCreando] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [walletConectada, setWalletConectada] = useState<string>("");
    const { toast } = useToast();

    const [formulario, setFormulario] = useState({
        numeroPoliza: "",
        descripcion: "",
        monto: "",
        tipoSiniestro: "auto",
        solicitante: "",
    });

    useEffect(() => {
        cargarReclamos();
        conectarWallet();
    }, []);

    const conectarWallet = async () => {
        try {
            if (typeof window.ethereum !== "undefined") {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                setWalletConectada(accounts[0]);
            }
        } catch (error) {
            console.error("Error conectando wallet:", error);
        }
    };

    const cargarReclamos = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/reclamos");
            const data = await response.json();

            if (data.success) {
                setReclamos(data.data);
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Error cargando reclamos",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error cargando reclamos",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const crearReclamo = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formulario.numeroPoliza || !formulario.descripcion || !formulario.monto || !formulario.solicitante) {
            toast({
                title: "Error",
                description: "Todos los campos son obligatorios",
                variant: "destructive",
            });
            return;
        }

        try {
            setCreando(true);

            const response = await fetch("/api/reclamos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    numeroPoliza: formulario.numeroPoliza,
                    descripcion: formulario.descripcion,
                    monto: formulario.monto,
                    tipoSiniestro: formulario.tipoSiniestro,
                    solicitante: formulario.solicitante,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "¡Éxito!",
                    description: "Reclamo creado correctamente",
                });

                // Reset form
                setFormulario({
                    numeroPoliza: "",
                    descripcion: "",
                    monto: "",
                    tipoSiniestro: "auto",
                    solicitante: "",
                });
                setMostrarFormulario(false);
                cargarReclamos();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Error creando reclamo",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Error al crear el reclamo",
                variant: "destructive",
            });
        } finally {
            setCreando(false);
        }
    };

    const estadisticas = {
        total: reclamos.length,
        pendientes: reclamos.filter((r) => r.estado === "pendiente").length,
        aprobados: reclamos.filter((r) => r.estado === "aprobado").length,
        pagados: reclamos.filter((r) => r.estado === "pagado").length,
        montoTotal: reclamos.reduce((sum: number, r) => sum + Number(r.monto), 0),
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Gestión de Siniestros</h1>
                        <p className="text-gray-600">
                            Crear y gestionar todos los reclamos del sistema
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={cargarReclamos}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Actualizar
                        </Button>
                        <Button
                            onClick={() => setMostrarFormulario(!mostrarFormulario)}
                            className="gap-2"
                            size="sm"
                        >
                            <Plus className="h-4 w-4" />
                            Nuevo Reclamo
                        </Button>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total Reclamos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{estadisticas.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Pendientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {estadisticas.pendientes}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Aprobados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {estadisticas.aprobados}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Pagados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {estadisticas.pagados}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Monto Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {estadisticas.montoTotal.toFixed(4)} ETH
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Formulario de creación */}
                {mostrarFormulario && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Crear Nuevo Reclamo</CardTitle>
                            <CardDescription>
                                Registra un nuevo siniestro en el sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={crearReclamo} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="numeroPoliza">Número de Póliza</Label>
                                        <Input
                                            id="numeroPoliza"
                                            placeholder="Ej: POL-2024-001"
                                            value={formulario.numeroPoliza}
                                            onChange={(e) =>
                                                setFormulario({
                                                    ...formulario,
                                                    numeroPoliza: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="monto">Monto (ETH)</Label>
                                        <Input
                                            id="monto"
                                            type="number"
                                            step="0.000001"
                                            placeholder="Ej: 0.5"
                                            value={formulario.monto}
                                            onChange={(e) =>
                                                setFormulario({
                                                    ...formulario,
                                                    monto: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tipoSiniestro">Tipo de Siniestro</Label>
                                        <Select
                                            value={formulario.tipoSiniestro}
                                            onValueChange={(value) =>
                                                setFormulario({
                                                    ...formulario,
                                                    tipoSiniestro: value,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="auto">Automóvil</SelectItem>
                                                <SelectItem value="hogar">Hogar</SelectItem>
                                                <SelectItem value="vida">Vida</SelectItem>
                                                <SelectItem value="salud">Salud</SelectItem>
                                                <SelectItem value="otro">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="solicitante">Dirección Wallet Solicitante</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="solicitante"
                                                placeholder="0x..."
                                                value={formulario.solicitante}
                                                onChange={(e) =>
                                                    setFormulario({
                                                        ...formulario,
                                                        solicitante: e.target.value,
                                                    })
                                                }
                                            />
                                            {walletConectada && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setFormulario({
                                                            ...formulario,
                                                            solicitante: walletConectada,
                                                        })
                                                    }
                                                >
                                                    Usar mi wallet
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="descripcion">Descripción del Siniestro</Label>
                                    <Textarea
                                        id="descripcion"
                                        placeholder="Describe el siniestro en detalle..."
                                        rows={4}
                                        value={formulario.descripcion}
                                        onChange={(e) =>
                                            setFormulario({
                                                ...formulario,
                                                descripcion: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setMostrarFormulario(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={creando}>
                                        {creando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Crear Reclamo
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Lista de reclamos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Todos los Reclamos
                        </CardTitle>
                        <CardDescription>
                            Listado completo de siniestros registrados en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : reclamos.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No hay reclamos registrados
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reclamos.map((reclamo) => {
                                    const Icon = estadoIcons[reclamo.estado];
                                    return (
                                        <Card key={reclamo._id}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2 flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="font-semibold text-lg">
                                                                Póliza: {reclamo.numeroPoliza}
                                                            </h3>
                                                            <Badge
                                                                className={`${
                                                                    estadoColors[reclamo.estado]
                                                                } text-white`}
                                                            >
                                                                <Icon className="h-3 w-3 mr-1" />
                                                                {reclamo.estado.toUpperCase()}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                {reclamo.tipoSiniestro}
                                                            </Badge>
                                                        </div>

                                                        <p className="text-gray-600">
                                                            {reclamo.descripcion}
                                                        </p>

                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-500">Monto:</span>
                                                                <span className="ml-2 font-semibold">
                                                                    {reclamo.monto} ETH
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Fecha:</span>
                                                                <span className="ml-2">
                                                                    {new Date(
                                                                        reclamo.fechaCreacion
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="text-sm">
                                                            <span className="text-gray-500">Solicitante:</span>
                                                            <span className="ml-2 font-mono text-xs">
                                                                {reclamo.solicitante.substring(0, 10)}...
                                                                {reclamo.solicitante.substring(38)}
                                                            </span>
                                                        </div>

                                                        {reclamo.siniestroId !== undefined && (
                                                            <div className="text-sm">
                                                                <span className="text-gray-500">
                                                                    ID Blockchain:
                                                                </span>
                                                                <span className="ml-2 font-semibold">
                                                                    {reclamo.siniestroId}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {reclamo.hashTransaccionCreacion && (
                                                            <div className="text-sm">
                                                                <a
                                                                    href={`https://sepolia.etherscan.io/tx/${reclamo.hashTransaccionCreacion}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                                >
                                                                    Ver en Etherscan
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
