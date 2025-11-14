"use client";

import { UserLayout } from "@/components/user-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PaymentModal } from "@/components/payment-modal";
import type { ReclamoDB } from "@/models/reclamo";
import { useState, useEffect } from "react";
import {
    FileText,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
} from "lucide-react";

const estadoColors = {
    creado: "bg-blue-100 text-blue-800",
    validado: "bg-yellow-100 text-yellow-800",
    aprobado: "bg-green-100 text-green-800",
    rechazado: "bg-red-100 text-red-800",
    pagado: "bg-purple-100 text-purple-800",
};

const estadoIcons = {
    creado: Clock,
    validado: FileText,
    aprobado: CheckCircle,
    rechazado: XCircle,
    pagado: DollarSign,
};

const estadoLabels = {
    creado: "Creado",
    validado: "Validado",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
    pagado: "Pagado",
};

export default function MisSiniestrosPage() {
    const [reclamos, setReclamos] = useState<ReclamoDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<any>(null);
    const [reclamoParaPago, setReclamoParaPago] = useState<ReclamoDB | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            // Obtener usuario actual
            const userRes = await fetch("/api/auth/me");
            const userData = await userRes.json();

            if (!userData.success) {
                return;
            }

            setUsuario(userData.usuario);

            // Obtener reclamos del usuario
            // Filtrar por email del usuario (más confiable que wallet)
            const emailUsuario = userData.usuario.email;
            
            if (!emailUsuario) {
                toast({
                    title: "Error",
                    description: "No se pudo obtener tu información de usuario",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            console.log("🔍 Buscando siniestros para email:", emailUsuario);

            // Intentar primero por email, luego por número de póliza si hay
            const response = await fetch(
                `/api/reclamos?emailUsuario=${encodeURIComponent(emailUsuario)}`
            );
            const data = await response.json();

            console.log("📋 Reclamos encontrados:", data.data?.length || 0);
            if (data.success) {
                setReclamos(data.data);
                if (data.data.length === 0) {
                    console.warn("⚠️ No se encontraron reclamos para el email:", emailUsuario);
                    console.info("💡 Asegúrate de que el administrador haya asignado el reclamo a tu usuario");
                }
            } else {
                console.error("❌ Error obteniendo reclamos:", data.message);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            toast({
                title: "Error",
                description: "Error cargando tus siniestros",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatearMonto = (monto: string | number) => {
        const montoNum = typeof monto === "string" ? parseFloat(monto) : monto;
        return new Intl.NumberFormat("es-ES", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
        }).format(montoNum);
    };

    const formatearFecha = (fecha: Date | string) => {
        const fechaObj = typeof fecha === "string" ? new Date(fecha) : fecha;
        return new Intl.DateTimeFormat("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(fechaObj);
    };

    const formatearDireccion = (direccion: string) => {
        return `${direccion.substring(0, 6)}...${direccion.substring(38)}`;
    };

    if (loading) {
        return (
            <UserLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando tus siniestros...</p>
                    </div>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Mis Siniestros
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Aquí puedes ver el estado de tus reclamaciones y pagar las aprobadas
                    </p>
                </div>

                {reclamos.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No tienes siniestros registrados
                            </h3>
                            <p className="text-gray-600">
                                Tus reclamaciones aparecerán aquí cuando las crees
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {reclamos.map((reclamo) => {
                            const EstadoIcon =
                                estadoIcons[
                                    reclamo.estado as keyof typeof estadoIcons
                                ];
                            const puedePagar =
                                reclamo.estado === "aprobado" &&
                                reclamo.estado !== "pagado";

                            return (
                                <Card
                                    key={reclamo.siniestroId}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    Siniestro #{reclamo.siniestroId}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {formatearFecha(reclamo.fechaCreacion)}
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                className={estadoColors[
                                                    reclamo.estado as keyof typeof estadoColors
                                                ]}
                                            >
                                                <EstadoIcon className="h-3 w-3 mr-1" />
                                                {
                                                    estadoLabels[
                                                        reclamo.estado as keyof typeof estadoLabels
                                                    ]
                                                }
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Descripción
                                                </p>
                                                <p className="text-gray-900">
                                                    {reclamo.descripcion}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        Monto
                                                    </p>
                                                    <p className="text-lg font-semibold text-blue-600">
                                                        {formatearMonto(reclamo.monto)} ETH
                                                    </p>
                                                </div>
                                                {reclamo.tipoSiniestro && (
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            Tipo
                                                        </p>
                                                        <p className="text-gray-900">
                                                            {reclamo.tipoSiniestro}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {reclamo.notasAdmin && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                    <p className="text-sm font-medium text-yellow-800 mb-1">
                                                        Notas del administrador:
                                                    </p>
                                                    <p className="text-sm text-yellow-700">
                                                        {reclamo.notasAdmin}
                                                    </p>
                                                </div>
                                            )}

                                            {puedePagar && (
                                                <div className="pt-4 border-t">
                                                    <Button
                                                        onClick={() =>
                                                            setReclamoParaPago(reclamo)
                                                        }
                                                        className="w-full"
                                                    >
                                                        <DollarSign className="h-4 w-4 mr-2" />
                                                        Pagar Reclamo
                                                    </Button>
                                                </div>
                                            )}

                                            {reclamo.estado === "pagado" &&
                                                reclamo.hashTransaccionPago && (
                                                    <div className="pt-4 border-t">
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            Transacción:
                                                        </p>
                                                        <a
                                                            href={`https://sepolia.etherscan.io/tx/${reclamo.hashTransaccionPago}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline font-mono"
                                                        >
                                                            {formatearDireccion(
                                                                reclamo.hashTransaccionPago
                                                            )}
                                                        </a>
                                                    </div>
                                                )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

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
        </UserLayout>
    );
}

