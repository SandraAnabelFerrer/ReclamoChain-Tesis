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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    aprobarReclamoConMetamask,
    rechazarReclamoConMetamask,
    validarReclamoConMetamask,
} from "@/lib/contractClient";
import type { ReclamoDB } from "@/lib/reclamo";
import {
    BarChart3,
    CheckCircle,
    DollarSign,
    FileCheck,
    Loader2,
    RefreshCw,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminManagement } from "./admin-management";
import { PaymentModal } from "./payment-modal";

const estadoColors = {
    creado: "bg-blue-100 text-blue-800",
    validado: "bg-yellow-100 text-yellow-800",
    aprobado: "bg-green-100 text-green-800",
    rechazado: "bg-red-100 text-red-800",
    pagado: "bg-purple-100 text-purple-800",
};

interface Estadisticas {
    totalReclamos: number;
    reclamosPorEstado: Record<string, number>;
    montoTotalReclamado: number;
    montoTotalAprobado: number;
}

export function AdminPanel() {
    const [reclamos, setReclamos] = useState<ReclamoDB[]>([]);
    const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState<number | null>(null);
    const [notasModal, setNotasModal] = useState<{
        siniestroId: number;
        tipo: "aprobar" | "rechazar";
    } | null>(null);
    const [notas, setNotas] = useState("");
    const [reclamoParaPago, setReclamoParaPago] = useState<ReclamoDB | null>(
        null
    );
    const { toast } = useToast();

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
                console.log("Reclamos obtenidos:", reclamosData.data);
                setReclamos(reclamosData.data as ReclamoDB[]);
            }

            if (estadisticasData.success) {
                setEstadisticas(estadisticasData.data.database);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            toast({
                title: "Error",
                description: "Error cargando datos del panel",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const validarReclamo = async (siniestroId: number) => {
        try {
            setProcesando(siniestroId);

            toast({
                title: "Procesando",
                description: "Confirma la transacción en MetaMask...",
            });

            // Llamar directamente al contrato con MetaMask
            const result = await validarReclamoConMetamask(siniestroId);

            if (result.success) {
                toast({
                    title: "¡Reclamo validado!",
                    description: `Transacción: ${result.txHash?.substring(
                        0,
                        10
                    )}...`,
                });

                // Actualizar MongoDB con verificación de admin
                await fetch(`/api/reclamos/${siniestroId}/validar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        txHash: result.txHash,
                        adminAddress: result.adminAddress,
                    }),
                });

                cargarDatos();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Error validando el reclamo",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error validando reclamo:", error);
            toast({
                title: "Error",
                description: error.message || "Error de conexión",
                variant: "destructive",
            });
        } finally {
            setProcesando(null);
        }
    };

    const procesarReclamo = async (
        siniestroId: number,
        accion: "aprobar" | "rechazar"
    ) => {
        if (!notas.trim()) {
            toast({
                title: "Error",
                description: "Por favor ingresa notas para la decisión",
                variant: "destructive",
            });
            return;
        }

        try {
            setProcesando(siniestroId);

            toast({
                title: "Procesando",
                description: "Confirma la transacción en MetaMask...",
            });

            // Llamar directamente al contrato con MetaMask
            const result =
                accion === "aprobar"
                    ? await aprobarReclamoConMetamask(siniestroId, notas)
                    : await rechazarReclamoConMetamask(siniestroId, notas);

            if (result.success) {
                toast({
                    title: `¡Reclamo ${
                        accion === "aprobar" ? "aprobado" : "rechazado"
                    }!`,
                    description: `Transacción: ${result.txHash?.substring(
                        0,
                        10
                    )}...`,
                });

                // Actualizar MongoDB con verificación de admin
                const endpoint = accion === "aprobar" ? "aprobar" : "rechazar";
                const body =
                    accion === "aprobar" ? { notas } : { razon: notas };

                await fetch(`/api/reclamos/${siniestroId}/${endpoint}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...body,
                        txHash: result.txHash,
                        adminAddress: result.adminAddress,
                    }),
                });

                setNotasModal(null);
                setNotas("");
                cargarDatos();
            } else {
                toast({
                    title: "Error",
                    description:
                        result.error ||
                        `Error ${
                            accion === "aprobar" ? "aprobando" : "rechazando"
                        } el reclamo`,
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error(`Error ${accion} reclamo:`, error);
            toast({
                title: "Error",
                description: error.message || "Error de conexión",
                variant: "destructive",
            });
        } finally {
            setProcesando(null);
        }
    };

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatearDireccion = (direccion: string) => {
        return `${direccion.slice(0, 6)}...${direccion.slice(-4)}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando panel administrativo...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-600">
                        Gestiona y procesa reclamaciones de siniestros
                    </p>
                </div>
                <Button
                    onClick={cargarDatos}
                    variant="outline"
                    className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Actualizar
                </Button>
            </div>

            {/* Gestión de Administradores */}
            <AdminManagement />

            {/* Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Reclamos
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {estadisticas.totalReclamos}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Aprobados
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {estadisticas.reclamosPorEstado
                                            .aprobado || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <FileCheck className="h-5 w-5 text-yellow-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Pendientes
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {(estadisticas.reclamosPorEstado
                                            .creado || 0) +
                                            (estadisticas.reclamosPorEstado
                                                .validado || 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">💰</span>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Monto Aprobado
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {estadisticas.montoTotalAprobado.toFixed(
                                            2
                                        )}{" "}
                                        ETH
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Lista de reclamos para administrar */}
            <div className="grid gap-4">
                {reclamos.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay reclamaciones
                            </h3>
                            <p className="text-gray-600">
                                No hay reclamaciones para procesar
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    reclamos.map((reclamo) => (
                        <Card
                            key={reclamo.siniestroId}
                            className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Siniestro #{reclamo.siniestroId}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Solicitante:{" "}
                                            {formatearDireccion(
                                                reclamo.solicitante
                                            )}
                                        </p>
                                    </div>
                                    <Badge
                                        className={
                                            estadoColors[
                                                reclamo.estado as keyof typeof estadoColors
                                            ]
                                        }>
                                        {reclamo?.estado}
                                    </Badge>
                                </div>

                                <p className="text-gray-700 mb-4">
                                    {reclamo.descripcion}
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                    <div>
                                        <span className="font-medium">
                                            Monto:
                                        </span>
                                        <p>{reclamo.monto} ETH</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            Tipo:
                                        </span>
                                        <p>
                                            {reclamo.tipoSiniestro ||
                                                "No especificado"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            Creado:
                                        </span>
                                        <p>
                                            {formatearFecha(
                                                reclamo.fechaCreacion.toString()
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            Póliza:
                                        </span>
                                        <p>
                                            {reclamo.numeroPoliza ||
                                                "No especificada"}
                                        </p>
                                    </div>
                                </div>

                                {/* Acciones administrativas */}
                                <div className="flex gap-2 pt-4 border-t">
                                    {reclamo.estado === "creado" && (
                                        <Button
                                            onClick={() =>
                                                validarReclamo(
                                                    reclamo.siniestroId
                                                )
                                            }
                                            disabled={
                                                procesando ===
                                                reclamo.siniestroId
                                            }
                                            size="sm"
                                            className="gap-2">
                                            {procesando ===
                                            reclamo.siniestroId ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <FileCheck className="h-4 w-4" />
                                            )}
                                            Validar
                                        </Button>
                                    )}

                                    {reclamo.estado === "validado" && (
                                        <>
                                            <Button
                                                onClick={() =>
                                                    setNotasModal({
                                                        siniestroId:
                                                            reclamo.siniestroId,
                                                        tipo: "aprobar",
                                                    })
                                                }
                                                disabled={
                                                    procesando ===
                                                    reclamo.siniestroId
                                                }
                                                size="sm"
                                                className="gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                Aprobar
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setNotasModal({
                                                        siniestroId:
                                                            reclamo.siniestroId,
                                                        tipo: "rechazar",
                                                    })
                                                }
                                                disabled={
                                                    procesando ===
                                                    reclamo.siniestroId
                                                }
                                                variant="destructive"
                                                size="sm"
                                                className="gap-2">
                                                <XCircle className="h-4 w-4" />
                                                Rechazar
                                            </Button>
                                        </>
                                    )}

                                    {reclamo.estado === "aprobado" && (
                                        <Button
                                            onClick={() =>
                                                setReclamoParaPago(reclamo)
                                            }
                                            size="sm"
                                            className="gap-2 bg-green-600 hover:bg-green-700">
                                            <DollarSign className="h-4 w-4" />
                                            Procesar Pago
                                        </Button>
                                    )}

                                    {["rechazado", "pagado"].includes(
                                        reclamo.estado
                                    ) && (
                                        <Badge
                                            variant="outline"
                                            className="text-xs">
                                            {reclamo.estado === "pagado"
                                                ? "Pagado ✓"
                                                : "Procesado"}
                                        </Badge>
                                    )}
                                </div>

                                {reclamo.notasAdmin && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium text-sm">
                                            Notas administrativas:
                                        </span>
                                        <p className="text-sm text-gray-700 mt-1">
                                            {reclamo.notasAdmin}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal para notas */}
            {notasModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>
                                {notasModal.tipo === "aprobar"
                                    ? "Aprobar Reclamo"
                                    : "Rechazar Reclamo"}
                            </CardTitle>
                            <CardDescription>
                                Siniestro #{notasModal.siniestroId} - Ingresa{" "}
                                {notasModal.tipo === "aprobar"
                                    ? "notas"
                                    : "la razón del rechazo"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="notas">
                                    {notasModal.tipo === "aprobar"
                                        ? "Notas de aprobación"
                                        : "Razón del rechazo"}
                                </Label>
                                <Textarea
                                    id="notas"
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                    placeholder={
                                        notasModal.tipo === "aprobar"
                                            ? "Documentación completa y válida..."
                                            : "Documentación insuficiente..."
                                    }
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() =>
                                        procesarReclamo(
                                            notasModal.siniestroId,
                                            notasModal.tipo
                                        )
                                    }
                                    disabled={
                                        procesando === notasModal.siniestroId ||
                                        !notas.trim()
                                    }
                                    className="flex-1">
                                    {procesando === notasModal.siniestroId && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {notasModal.tipo === "aprobar"
                                        ? "Aprobar"
                                        : "Rechazar"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setNotasModal(null);
                                        setNotas("");
                                    }}
                                    className="flex-1">
                                    Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal de pago */}
            {reclamoParaPago && (
                <PaymentModal
                    reclamo={reclamoParaPago}
                    onClose={() => setReclamoParaPago(null)}
                    onSuccess={() => {
                        setReclamoParaPago(null);
                        cargarDatos();
                    }}
                />
            )}
        </div>
    );
}
