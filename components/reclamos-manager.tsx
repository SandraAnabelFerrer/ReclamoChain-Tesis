"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEthValue } from "@/hooks/use-eth-value";
import { useToast } from "@/hooks/use-toast";
import { formatEth, formatPesos, pesosToEth } from "@/lib/currency";
import type { ReclamoDB } from "@/lib/reclamo";
import {
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    FileCheck,
    FileText,
    Loader2,
    Plus,
    XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface FormularioReclamo {
    descripcion: string;
    montoPesos: string;
    montoEth: string;
    tipoSiniestro: string;
    ubicacion: string;
    numeroPoliza: string;
}

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

export function ReclamosManager() {
    const [reclamos, setReclamos] = useState<ReclamoDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [creandoReclamo, setCreandoReclamo] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [procesando, setProcesando] = useState<number | null>(null);
    const [notasModal, setNotasModal] = useState<{
        siniestroId: number;
        tipo: "aprobar" | "rechazar";
    } | null>(null);
    const [notas, setNotas] = useState("");
    const { toast } = useToast();
    const { ethValue } = useEthValue();

    const [formulario, setFormulario] = useState<FormularioReclamo>({
        descripcion: "",
        montoPesos: "",
        montoEth: "",
        tipoSiniestro: "",
        ubicacion: "",
        numeroPoliza: "",
    });

    // Cargar reclamos al montar el componente
    useEffect(() => {
        cargarReclamos();
    }, []);

    // Función para convertir pesos a ETH automáticamente
    const handlePesosChange = async (pesos: string) => {
        setFormulario({ ...formulario, montoPesos: pesos });

        if (pesos && !isNaN(Number(pesos))) {
            try {
                const ethAmount = await pesosToEth(Number(pesos));
                setFormulario((prev) => ({
                    ...prev,
                    montoPesos: pesos,
                    montoEth: ethAmount.toString(),
                }));
            } catch (error) {
                console.error("Error convirtiendo pesos a ETH:", error);
            }
        } else {
            setFormulario((prev) => ({
                ...prev,
                montoPesos: pesos,
                montoEth: "",
            }));
        }
    };

    const cargarReclamos = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/reclamos");
            const data = (await response.json()) as {
                success: boolean;
                data: ReclamoDB[];
                message?: string;
            };

            if (data.success) {
                setReclamos(data.data);
            } else {
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los reclamos",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error cargando reclamos:", error);
            toast({
                title: "Error",
                description: "Error de conexión al cargar reclamos",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const crearReclamo = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formulario.numeroPoliza ||
            !formulario.descripcion ||
            !formulario.montoPesos
        ) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos requeridos",
                variant: "destructive",
            });
            return;
        }

        try {
            setCreandoReclamo(true);

            const response = await fetch("/api/reclamos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    numeroPoliza: formulario.numeroPoliza,
                    descripcion: formulario.descripcion,
                    monto: Number.parseFloat(formulario.montoEth),
                    tipoSiniestro: formulario.tipoSiniestro,
                    ubicacion: formulario.ubicacion,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Reclamo creado",
                    description: `Reclamo para póliza ${formulario.numeroPoliza} creado exitosamente`,
                });

                // Limpiar formulario
                setFormulario({
                    descripcion: "",
                    montoPesos: "",
                    montoEth: "",
                    tipoSiniestro: "",
                    ubicacion: "",
                    numeroPoliza: "",
                });

                setMostrarFormulario(false);
                cargarReclamos(); // Recargar lista
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Error creando el reclamo",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error creando reclamo:", error);
            toast({
                title: "Error",
                description: "Error de conexión al crear el reclamo",
                variant: "destructive",
            });
        } finally {
            setCreandoReclamo(false);
        }
    };

    // Funciones para acciones administrativas
    const validarReclamo = async (siniestroId: number) => {
        try {
            setProcesando(siniestroId);

            const response = await fetch(
                `/api/reclamos/${siniestroId}/validar`,
                {
                    method: "POST",
                }
            );

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Reclamo validado",
                    description: `Reclamo ${siniestroId} validado exitosamente`,
                });
                cargarReclamos();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Error validando el reclamo",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error validando reclamo:", error);
            toast({
                title: "Error",
                description: "Error de conexión",
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

            const endpoint = accion === "aprobar" ? "aprobar" : "rechazar";
            const body = accion === "aprobar" ? { notas } : { razon: notas };

            const response = await fetch(
                `/api/reclamos/${siniestroId}/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                }
            );

            const data = await response.json();

            if (data.success) {
                toast({
                    title: `Reclamo ${
                        accion === "aprobar" ? "aprobado" : "rechazado"
                    }`,
                    description: `Reclamo ${siniestroId} ${
                        accion === "aprobar" ? "aprobado" : "rechazado"
                    } exitosamente`,
                });
                setNotasModal(null);
                setNotas("");
                cargarReclamos();
            } else {
                toast({
                    title: "Error",
                    description:
                        data.message ||
                        `Error ${
                            accion === "aprobar" ? "aprobando" : "rechazando"
                        } el reclamo`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error(`Error ${accion} reclamo:`, error);
            toast({
                title: "Error",
                description: "Error de conexión",
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
                <span className="ml-2">Cargando reclamos...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con botón para crear reclamo */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-600">
                        Gestiona tus reclamaciones de siniestros
                    </p>
                </div>
                <Button
                    onClick={() => setMostrarFormulario(!mostrarFormulario)}
                    className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Reclamo
                </Button>
            </div>

            {/* Formulario para crear reclamo */}
            {mostrarFormulario && (
                <Card>
                    <CardHeader>
                        <CardTitle>Crear Nueva Reclamación</CardTitle>
                        <CardDescription>
                            Completa la información del siniestro para crear una
                            nueva reclamación
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={crearReclamo} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="numeroPoliza">
                                        Número de Póliza *
                                    </Label>
                                    <Input
                                        id="numeroPoliza"
                                        value={formulario.numeroPoliza}
                                        onChange={(e) =>
                                            setFormulario({
                                                ...formulario,
                                                numeroPoliza: e.target.value,
                                            })
                                        }
                                        placeholder="POL-2024-001"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        El ID del siniestro se generará
                                        automáticamente
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="montoPesos">
                                        Monto en Pesos Argentinos *
                                    </Label>
                                    <Input
                                        id="montoPesos"
                                        type="number"
                                        step="1000"
                                        value={formulario.montoPesos}
                                        onChange={(e) =>
                                            handlePesosChange(e.target.value)
                                        }
                                        placeholder="1000000"
                                        required
                                    />
                                    {formulario.montoPesos && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Equivale a:{" "}
                                            {formatEth(
                                                Number(formulario.montoEth)
                                            )}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="tipoSiniestro">
                                        Tipo de Siniestro
                                    </Label>
                                    <Select
                                        value={formulario.tipoSiniestro}
                                        onValueChange={(value) =>
                                            setFormulario({
                                                ...formulario,
                                                tipoSiniestro: value,
                                            })
                                        }>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">
                                                Automóvil
                                            </SelectItem>
                                            <SelectItem value="hogar">
                                                Hogar
                                            </SelectItem>
                                            <SelectItem value="vida">
                                                Vida
                                            </SelectItem>
                                            <SelectItem value="salud">
                                                Salud
                                            </SelectItem>
                                            <SelectItem value="otro">
                                                Otro
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="ubicacion">Ubicación</Label>
                                    <Input
                                        id="ubicacion"
                                        value={formulario.ubicacion}
                                        onChange={(e) =>
                                            setFormulario({
                                                ...formulario,
                                                ubicacion: e.target.value,
                                            })
                                        }
                                        placeholder="Ciudad de México"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="descripcion">
                                    Descripción del Siniestro *
                                </Label>
                                <Textarea
                                    id="descripcion"
                                    value={formulario.descripcion}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            descripcion: e.target.value,
                                        })
                                    }
                                    placeholder="Describe detalladamente lo ocurrido..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={creandoReclamo}>
                                    {creandoReclamo && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Crear Reclamo
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setMostrarFormulario(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Tabla de reclamos estilo CRUD */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Reclamaciones</CardTitle>
                    <CardDescription>
                        Gestiona tus reclamaciones de siniestros
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {reclamos.length === 0 ? (
                        <div className="py-12 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay reclamaciones
                            </h3>
                            <p className="text-gray-600">
                                Crea tu primera reclamación para comenzar
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium">
                                            ID
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Descripción
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Monto
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Tipo
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Estado
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Fecha
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reclamos.map((reclamo) => {
                                        const EstadoIcon =
                                            estadoIcons[
                                                reclamo.estado as keyof typeof estadoIcons
                                            ];
                                        return (
                                            <tr
                                                key={reclamo.siniestroId}
                                                className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <span className="font-medium">
                                                        #{reclamo.siniestroId}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="max-w-xs">
                                                        <p className="text-sm text-gray-900 truncate">
                                                            {
                                                                reclamo.descripcion
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatearDireccion(
                                                                reclamo.solicitante
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium">
                                                            {reclamo.monto} ETH
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            ~
                                                            {formatPesos(
                                                                Number(
                                                                    reclamo.monto
                                                                ) * ethValue
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-sm">
                                                        {reclamo.tipoSiniestro ||
                                                            "No especificado"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        className={
                                                            estadoColors[
                                                                reclamo.estado as keyof typeof estadoColors
                                                            ]
                                                        }>
                                                        <EstadoIcon className="h-3 w-3 mr-1" />
                                                        {reclamo.estado.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="text-sm">
                                                        <p>
                                                            {formatearFecha(
                                                                reclamo.fechaCreacion.toString()
                                                            )}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        {/* Botón Ver - siempre visible */}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            title="Ver detalles">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>

                                                        {/* Acciones administrativas según el estado */}
                                                        {reclamo.estado ===
                                                            "creado" && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                                                onClick={() =>
                                                                    validarReclamo(
                                                                        reclamo.siniestroId
                                                                    )
                                                                }
                                                                disabled={
                                                                    procesando ===
                                                                    reclamo.siniestroId
                                                                }
                                                                title="Validar reclamo">
                                                                {procesando ===
                                                                reclamo.siniestroId ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <FileCheck className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        )}

                                                        {reclamo.estado ===
                                                            "validado" && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                                                    onClick={() =>
                                                                        setNotasModal(
                                                                            {
                                                                                siniestroId:
                                                                                    reclamo.siniestroId,
                                                                                tipo: "aprobar",
                                                                            }
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        procesando ===
                                                                        reclamo.siniestroId
                                                                    }
                                                                    title="Aprobar reclamo">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                                    onClick={() =>
                                                                        setNotasModal(
                                                                            {
                                                                                siniestroId:
                                                                                    reclamo.siniestroId,
                                                                                tipo: "rechazar",
                                                                            }
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        procesando ===
                                                                        reclamo.siniestroId
                                                                    }
                                                                    title="Rechazar reclamo">
                                                                    <XCircle className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}

                                                        {/* Para reclamos ya procesados */}
                                                        {[
                                                            "aprobado",
                                                            "rechazado",
                                                            "pagado",
                                                        ].includes(
                                                            reclamo.estado
                                                        ) && (
                                                            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                                                Procesado
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal para aprobar/rechazar reclamos */}
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
        </div>
    );
}
