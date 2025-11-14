"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { ReclamoDB } from "@/lib/reclamo";
import { ethers } from "ethers";
import {
    CheckCircle,
    FileText,
    Loader2,
    Plus,
    RefreshCw,
    Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

const estadoColors = {
    creado: "bg-blue-100 text-blue-800",
    validado: "bg-yellow-100 text-yellow-800",
    aprobado: "bg-green-100 text-green-800",
    rechazado: "bg-red-100 text-red-800",
    pagado: "bg-purple-100 text-purple-800",
};

const estadoDescripciones = {
    creado: "Tu reclamo ha sido recibido y está pendiente de validación",
    validado: "Tu reclamo ha sido validado y está siendo revisado",
    aprobado: "¡Tu reclamo ha sido aprobado! El pago se procesará pronto",
    rechazado: "Tu reclamo no pudo ser aprobado",
    pagado: "¡El pago ha sido procesado! Revisa tu wallet",
};

export function MisReclamosPanel() {
    const [reclamos, setReclamos] = useState<ReclamoDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [walletConectada, setWalletConectada] = useState<string>("");
    const { toast } = useToast();

    const conectarWallet = async () => {
        try {
            if (!window.ethereum) {
                toast({
                    title: "MetaMask no detectado",
                    description: "Por favor instala MetaMask para continuar",
                    variant: "destructive",
                });
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setWalletConectada(address);
            toast({
                title: "Wallet conectada",
                description: `Conectado como ${address.substring(
                    0,
                    6
                )}...${address.substring(38)}`,
            });

            // Cargar reclamos después de conectar
            cargarMisReclamos(address);
        } catch (error) {
            console.error("Error conectando wallet:", error);
            toast({
                title: "Error",
                description: "No se pudo conectar la wallet",
                variant: "destructive",
            });
        }
    };

    const cargarMisReclamos = async (address?: string) => {
        try {
            setLoading(true);
            const walletParam = address || walletConectada;

            if (!walletParam) {
                setReclamos([]);
                setLoading(false);
                return;
            }

            const response = await fetch(
                `/api/reclamos?solicitante=${walletParam.toLowerCase()}`
            );

            if (!response.ok) {
                throw new Error("Error al cargar reclamos");
            }

            const data = await response.json();
            setReclamos(data.data || []);
        } catch (error) {
            console.error("Error cargando reclamos:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar tus reclamos",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Intentar conectar automáticamente si MetaMask ya está conectado
        const conectarAutomaticamente = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(
                        window.ethereum
                    );
                    const accounts = await provider.listAccounts();
                    if (accounts.length > 0) {
                        const address = await accounts[0].getAddress();
                        setWalletConectada(address);
                        cargarMisReclamos(address);
                    } else {
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Error en conexión automática:", error);
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        conectarAutomaticamente();
    }, []);

    if (loading && !walletConectada) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!walletConectada) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                        <CardTitle>Conecta tu Wallet</CardTitle>
                        <CardDescription>
                            Para ver tus reclamos y crear nuevos siniestros,
                            conecta tu wallet de MetaMask
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button
                            onClick={conectarWallet}
                            className="gap-2"
                            size="lg">
                            <Wallet className="h-5 w-5" />
                            Conectar MetaMask
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Mis Reclamos</h1>
                    {walletConectada && (
                        <p className="text-gray-600 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            {walletConectada.substring(0, 6)}...
                            {walletConectada.substring(38)}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => cargarMisReclamos()}
                        variant="outline"
                        size="sm"
                        className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Actualizar
                    </Button>
                    <Button
                        onClick={() =>
                            (window.location.href = "/crear-reclamo")
                        }
                        className="gap-2"
                        size="sm">
                        <Plus className="h-4 w-4" />
                        Nuevo Reclamo
                    </Button>
                </div>
            </div>

            {/* Estadísticas del usuario */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold">
                                    {reclamos.length}
                                </p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Aprobados
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {
                                        reclamos.filter(
                                            (r) =>
                                                r.estado === "aprobado" ||
                                                r.estado === "pagado"
                                        ).length
                                    }
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pagados</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {
                                        reclamos.filter(
                                            (r) => r.estado === "pagado"
                                        ).length
                                    }
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Monto Total
                                </p>
                                <p className="text-2xl font-bold">
                                    {reclamos
                                        .reduce((sum: number, r) => {
                                            return sum + Number(r.monto);
                                        }, 0)
                                        .toFixed(4)}{" "}
                                    ETH
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de reclamos */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : reclamos.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No tienes reclamos
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Comienza creando tu primer reclamo de siniestro
                        </p>
                        <Button
                            onClick={() =>
                                (window.location.href = "/crear-reclamo")
                            }>
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Reclamo
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {reclamos.map((reclamo) => (
                        <Card
                            key={reclamo.siniestroId}
                            className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl">
                                            Siniestro #{reclamo.siniestroId}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Póliza: {reclamo.numeroPoliza}
                                        </CardDescription>
                                    </div>
                                    <Badge
                                        className={
                                            estadoColors[reclamo.estado]
                                        }>
                                        {reclamo.estado.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-sm text-gray-600">
                                            Descripción
                                        </Label>
                                        <p className="text-sm mt-1">
                                            {reclamo.descripcion}
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm text-gray-600">
                                                Monto
                                            </Label>
                                            <p className="text-lg font-semibold">
                                                {reclamo.monto} ETH
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-gray-600">
                                                Tipo de Siniestro
                                            </Label>
                                            <p className="text-sm mt-1">
                                                {reclamo.tipoSiniestro}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm text-gray-600">
                                            Fecha de Creación
                                        </Label>
                                        <p className="text-sm mt-1">
                                            {new Date(
                                                reclamo.fechaCreacion
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Descripción del estado */}
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-800">
                                            ℹ️{" "}
                                            {
                                                estadoDescripciones[
                                                    reclamo.estado
                                                ]
                                            }
                                        </p>
                                    </div>

                                    {reclamo.notasAdmin && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <Label className="text-sm font-medium">
                                                Notas de la Aseguradora
                                            </Label>
                                            <p className="text-sm text-gray-700 mt-1">
                                                {reclamo.notasAdmin}
                                            </p>
                                        </div>
                                    )}

                                    {reclamo.hashTransaccionCreacion && (
                                        <div>
                                            <Label className="text-sm text-gray-600 mr-1">
                                                Hash de Transacción:
                                            </Label>
                                            <a
                                                href={`https://sepolia.etherscan.io/tx/${reclamo.hashTransaccionCreacion}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline break-all">
                                                {
                                                    reclamo.hashTransaccionCreacion
                                                }
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
}
