"use client";

import { MainLayout } from "@/components/main-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { ReclamoDB } from "@/lib/reclamo";
import {
    ArrowUpRight,
    CheckCircle2,
    Clock,
    DollarSign,
    ExternalLink,
    TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PagoInfo {
    siniestroId: number;
    solicitante: string;
    monto: string | number;
    hashTransaccionPago?: string;
    fechaActualizacion: Date;
    descripcion: string;
    tipoSiniestro: string;
}

export default function PagosPage() {
    const [reclamos, setReclamos] = useState<ReclamoDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [estadisticas, setEstadisticas] = useState<any>(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [reclamosRes, estadisticasRes] = await Promise.all([
                fetch("/api/reclamos"),
                fetch("/api/estadisticas"),
            ]);

            const reclamosData = await reclamosRes.json();
            const estadisticasData = await estadisticasRes.json();

            if (reclamosData.success) {
                setReclamos(reclamosData.data as ReclamoDB[]);
            }

            if (estadisticasData.success) {
                setEstadisticas(estadisticasData.data);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const reclamosPagados = reclamos.filter((r) => r.estado === "pagado");
    const reclamosAprobadosPendientes = reclamos.filter(
        (r) => r.estado === "aprobado"
    );

    const totalPagado = reclamosPagados.reduce((sum, r) => {
        const monto = typeof r.monto === "string" ? parseFloat(r.monto) : r.monto;
        return sum + monto;
    }, 0);

    const totalPendiente = reclamosAprobadosPendientes.reduce((sum, r) => {
        const monto = typeof r.monto === "string" ? parseFloat(r.monto) : r.monto;
        return sum + monto;
    }, 0);

    const formatearDireccion = (direccion: string) => {
        return `${direccion.slice(0, 6)}...${direccion.slice(-4)}`;
    };

    const formatearFecha = (fecha: Date | string) => {
        return new Date(fecha).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const abrirExplorador = (hash: string) => {
        const network = process.env.NEXT_PUBLIC_NETWORK || "sepolia";
        const url = `https://${network}.etherscan.io/tx/${hash}`;
        window.open(url, "_blank");
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center py-12">
                    <Clock className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Cargando información de pagos...</span>
                </div>
            </div>
        );
    }

    return (
        <AuthGuard requiredRole="admin">
            <MainLayout>
                <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Historial de Pagos</h1>
                <p className="text-gray-600">
                    Visualiza todos los pagos procesados y pendientes del
                    sistema
                </p>
            </div>

            {/* Estadísticas de Pagos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Pagos Completados
                                </p>
                                <p className="text-2xl font-bold">
                                    {reclamosPagados.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Pagos Pendientes
                                </p>
                                <p className="text-2xl font-bold">
                                    {reclamosAprobadosPendientes.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Total Pagado
                                </p>
                                <p className="text-2xl font-bold">
                                    {totalPagado.toFixed(4)} ETH
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">
                                    Monto Pendiente
                                </p>
                                <p className="text-2xl font-bold">
                                    {totalPendiente.toFixed(4)} ETH
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Balance del Contrato */}
            {estadisticas?.blockchain && (
                <Card>
                    <CardHeader>
                        <CardTitle>Balance del Contrato Inteligente</CardTitle>
                        <CardDescription>
                            Fondos disponibles en el contrato para pagos
                            automáticos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">
                                    Balance Disponible
                                </p>
                                <p className="text-3xl font-bold text-green-600">
                                    {(
                                        parseFloat(
                                            estadisticas.blockchain
                                                .balanceContrato || "0"
                                        ) / 1e18
                                    ).toFixed(4)}{" "}
                                    ETH
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">
                                    Dirección del Contrato
                                </p>
                                <button
                                    onClick={() =>
                                        abrirExplorador(
                                            estadisticas.blockchain
                                                .direccionContrato
                                        )
                                    }
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-mono text-sm">
                                    {formatearDireccion(
                                        estadisticas.blockchain
                                            .direccionContrato
                                    )}
                                    <ExternalLink className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pagos Recientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Pagos Completados</CardTitle>
                    <CardDescription>
                        Historial de reclamos pagados exitosamente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {reclamosPagados.length === 0 ? (
                        <div className="text-center py-12">
                            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">
                                No hay pagos completados aún
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reclamosPagados.map((reclamo) => (
                                <div
                                    key={reclamo.siniestroId}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold">
                                                Siniestro #{reclamo.siniestroId}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {reclamo.descripcion}
                                            </p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800">
                                            PAGADO
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">
                                                Beneficiario
                                            </p>
                                            <p className="font-mono font-medium">
                                                {formatearDireccion(
                                                    reclamo.solicitante
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Monto</p>
                                            <p className="font-bold text-green-600">
                                                {(typeof reclamo.monto ===
                                                "string"
                                                    ? parseFloat(reclamo.monto)
                                                    : Number(reclamo.monto)
                                                ).toFixed(4)}{" "}
                                                ETH
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                Fecha de Pago
                                            </p>
                                            <p className="font-medium">
                                                {formatearFecha(
                                                    reclamo.fechaActualizacion
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                Tipo
                                            </p>
                                            <p className="font-medium">
                                                {reclamo.tipoSiniestro}
                                            </p>
                                        </div>
                                    </div>

                                    {reclamo.hashTransaccionPago && (
                                        <div className="mt-3 pt-3 border-t">
                                            <button
                                                onClick={() =>
                                                    abrirExplorador(
                                                        reclamo.hashTransaccionPago!
                                                    )
                                                }
                                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                                                <span className="font-mono">
                                                    {formatearDireccion(
                                                        reclamo.hashTransaccionPago
                                                    )}
                                                </span>
                                                <ArrowUpRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagos Pendientes */}
            {reclamosAprobadosPendientes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pagos Pendientes de Procesar</CardTitle>
                        <CardDescription>
                            Reclamos aprobados que esperan pago
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {reclamosAprobadosPendientes.map((reclamo) => (
                                <div
                                    key={reclamo.siniestroId}
                                    className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold">
                                                Siniestro #{reclamo.siniestroId}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {reclamo.descripcion}
                                            </p>
                                        </div>
                                        <Badge className="bg-yellow-100 text-yellow-800">
                                            PENDIENTE
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">
                                                Beneficiario
                                            </p>
                                            <p className="font-mono font-medium">
                                                {formatearDireccion(
                                                    reclamo.solicitante
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                Monto a Pagar
                                            </p>
                                            <p className="font-bold text-yellow-600">
                                                {(typeof reclamo.monto ===
                                                "string"
                                                    ? parseFloat(reclamo.monto)
                                                    : Number(reclamo.monto)
                                                ).toFixed(4)}{" "}
                                                ETH
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                Aprobado el
                                            </p>
                                            <p className="font-medium">
                                                {formatearFecha(
                                                    reclamo.fechaActualizacion
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
                </div>
            </MainLayout>
        </AuthGuard>
    );
}
