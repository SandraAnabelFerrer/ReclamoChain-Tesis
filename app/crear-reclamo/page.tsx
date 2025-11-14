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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserLayout } from "@/components/user-layout";
import { useToast } from "@/hooks/use-toast";
import { pesosToEth } from "@/lib/currency";
import { ethers } from "ethers";
import {
    AlertCircle,
    CheckCircle2,
    DollarSign,
    FileText,
    Loader2,
    Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

interface FormularioReclamo {
    numeroPoliza: string;
    descripcion: string;
    montoPesos: string;
    montoEth: string;
    tipoSiniestro: string;
    ubicacion: string;
}

export default function CrearReclamoPage() {
    const [walletConectada, setWalletConectada] = useState<string>("");
    const [creandoReclamo, setCreandoReclamo] = useState(false);
    const [reclamoCreado, setReclamoCreado] = useState(false);
    const { toast } = useToast();

    const [formulario, setFormulario] = useState<FormularioReclamo>({
        numeroPoliza: "",
        descripcion: "",
        montoPesos: "",
        montoEth: "",
        tipoSiniestro: "auto",
        ubicacion: "",
    });

    useEffect(() => {
        conectarWallet();
    }, []);

    const conectarWallet = async () => {
        try {
            if (typeof window.ethereum === "undefined") {
                toast({
                    title: "MetaMask no detectado",
                    description:
                        "Por favor instala MetaMask para crear reclamos",
                    variant: "destructive",
                });
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            setWalletConectada(accounts[0]);

            // Generar número de póliza automático
            const polizaAuto = `POL-${accounts[0]
                .substring(2, 8)
                .toUpperCase()}-${new Date().getFullYear()}`;
            setFormulario((prev) => ({ ...prev, numeroPoliza: polizaAuto }));
        } catch (error) {
            console.error("Error conectando wallet:", error);
            toast({
                title: "Error",
                description: "No se pudo conectar con MetaMask",
                variant: "destructive",
            });
        }
    };

    const handlePesosChange = async (pesos: string) => {
        setFormulario({ ...formulario, montoPesos: pesos });

        if (pesos && !isNaN(Number(pesos)) && Number(pesos) > 0) {
            try {
                const ethAmount = await pesosToEth(Number(pesos));
                setFormulario((prev) => ({
                    ...prev,
                    montoPesos: pesos,
                    montoEth: ethAmount.toString(),
                }));
            } catch (error) {
                console.error("Error convirtiendo pesos a ETH:", error);
                // Si falla la conversión, usar un valor por defecto o manual
                setFormulario((prev) => ({
                    ...prev,
                    montoPesos: pesos,
                    montoEth: "",
                }));
            }
        } else {
            setFormulario((prev) => ({
                ...prev,
                montoPesos: pesos,
                montoEth: "",
            }));
        }
    };

    const handleEthChange = (eth: string) => {
        setFormulario({ ...formulario, montoEth: eth });
    };

    const crearReclamo = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!walletConectada) {
            toast({
                title: "Error",
                description: "Debes conectar tu wallet primero",
                variant: "destructive",
            });
            return;
        }

        if (
            !formulario.descripcion ||
            !formulario.montoEth ||
            !formulario.tipoSiniestro
        ) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos obligatorios",
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
                    monto: parseFloat(formulario.montoEth),
                    tipoSiniestro: formulario.tipoSiniestro,
                    ubicacion: formulario.ubicacion,
                    solicitante: walletConectada,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setReclamoCreado(true);
                toast({
                    title: "¡Reclamo creado!",
                    description: `Tu reclamo #${data.data.siniestroId} ha sido registrado exitosamente`,
                });

                // Resetear formulario
                setTimeout(() => {
                    setFormulario({
                        numeroPoliza: `POL-${walletConectada
                            .substring(2, 8)
                            .toUpperCase()}-${new Date().getFullYear()}`,
                        descripcion: "",
                        montoPesos: "",
                        montoEth: "",
                        tipoSiniestro: "auto",
                        ubicacion: "",
                    });
                    setReclamoCreado(false);
                }, 3000);
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
                description: "Error al crear el reclamo. Verifica tu conexión.",
                variant: "destructive",
            });
        } finally {
            setCreandoReclamo(false);
        }
    };

    return (
        <UserLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Crear Nuevo Reclamo
                    </h1>
                    <p className="text-gray-600">
                        Registra un nuevo siniestro para tu póliza de seguro
                    </p>
                </div>

                {/* Información de Wallet */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">
                                    Wallet Conectada
                                </p>
                                {walletConectada ? (
                                    <p className="text-sm text-blue-700 font-mono">
                                        {walletConectada.substring(0, 10)}...
                                        {walletConectada.substring(38)}
                                    </p>
                                ) : (
                                    <Button
                                        onClick={conectarWallet}
                                        variant="outline"
                                        size="sm"
                                        className="mt-1">
                                        Conectar MetaMask
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formulario de Creación */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Información del Siniestro
                        </CardTitle>
                        <CardDescription>
                            Completa todos los campos para registrar tu reclamo.
                            Los campos marcados con * son obligatorios.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={crearReclamo} className="space-y-6">
                            {/* Número de Póliza */}
                            <div className="space-y-2">
                                <Label htmlFor="numeroPoliza">
                                    Número de Póliza
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    id="numeroPoliza"
                                    placeholder="POL-XXXXXX-2024"
                                    value={formulario.numeroPoliza}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            numeroPoliza: e.target.value,
                                        })
                                    }
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    Número de póliza generado automáticamente
                                    desde tu wallet
                                </p>
                            </div>

                            {/* Tipo de Siniestro */}
                            <div className="space-y-2">
                                <Label htmlFor="tipoSiniestro">
                                    Tipo de Siniestro
                                    <span className="text-red-500 ml-1">*</span>
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
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto">
                                            🚗 Automóvil
                                        </SelectItem>
                                        <SelectItem value="hogar">
                                            🏠 Hogar
                                        </SelectItem>
                                        <SelectItem value="vida">
                                            ❤️ Vida
                                        </SelectItem>
                                        <SelectItem value="salud">
                                            🏥 Salud
                                        </SelectItem>
                                        <SelectItem value="otro">
                                            📋 Otro
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Descripción */}
                            <div className="space-y-2">
                                <Label htmlFor="descripcion">
                                    Descripción del Siniestro
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Textarea
                                    id="descripcion"
                                    placeholder="Describe en detalle qué ocurrió, cuándo, dónde, y cualquier información relevante..."
                                    rows={5}
                                    value={formulario.descripcion}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            descripcion: e.target.value,
                                        })
                                    }
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    Proporciona la mayor cantidad de detalles
                                    posibles para agilizar el proceso
                                </p>
                            </div>

                            {/* Ubicación */}
                            <div className="space-y-2">
                                <Label htmlFor="ubicacion">
                                    Ubicación del Siniestro
                                </Label>
                                <Input
                                    id="ubicacion"
                                    placeholder="Ej: Av. Principal 123, Ciudad"
                                    value={formulario.ubicacion}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            ubicacion: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Monto en Pesos */}
                            <div className="space-y-2">
                                <Label htmlFor="montoPesos">
                                    Monto Estimado (ARS)
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="montoPesos"
                                        type="number"
                                        step="0.01"
                                        placeholder="10000.00"
                                        value={formulario.montoPesos}
                                        onChange={(e) =>
                                            handlePesosChange(e.target.value)
                                        }
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Monto estimado de los daños en pesos
                                    argentinos
                                </p>
                            </div>

                            {/* Monto en ETH */}
                            <div className="space-y-2">
                                <Label htmlFor="montoEth">
                                    Monto en ETH (Calculado Automáticamente)
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="montoEth"
                                        type="number"
                                        step="0.000001"
                                        placeholder="0.0"
                                        value={formulario.montoEth}
                                        onChange={(e) =>
                                            handleEthChange(e.target.value)
                                        }
                                        required
                                        className="flex-1"
                                    />
                                    <div className="px-4 py-2 bg-gray-100 rounded-md flex items-center">
                                        <span className="text-sm font-medium text-gray-700">
                                            ETH
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Se convierte automáticamente desde pesos.
                                    También puedes editarlo manualmente.
                                </p>
                            </div>

                            {/* Información Importante */}
                            <Card className="bg-yellow-50 border-yellow-200">
                                <CardContent className="pt-6">
                                    <div className="flex gap-3">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-yellow-900">
                                                Información Importante
                                            </p>
                                            <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                                                <li>
                                                    Tu reclamo será registrado
                                                    en la blockchain de Ethereum
                                                </li>
                                                <li>
                                                    El proceso de validación
                                                    puede tomar entre 24-48
                                                    horas
                                                </li>
                                                <li>
                                                    Recibirás notificaciones
                                                    sobre el estado de tu
                                                    reclamo
                                                </li>
                                                <li>
                                                    Una vez aprobado, el pago se
                                                    enviará a tu wallet
                                                    automáticamente
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Mensaje de Éxito */}
                            {reclamoCreado && (
                                <Card className="bg-green-50 border-green-200">
                                    <CardContent className="pt-6">
                                        <div className="flex gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium text-green-900">
                                                    ¡Reclamo creado
                                                    exitosamente!
                                                </p>
                                                <p className="text-xs text-green-700 mt-1">
                                                    Puedes ver el estado de tu
                                                    reclamo en "Mis Reclamos"
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Botones */}
                            <div className="flex gap-3 justify-end pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setFormulario({
                                            numeroPoliza: `POL-${walletConectada
                                                .substring(2, 8)
                                                .toUpperCase()}-${new Date().getFullYear()}`,
                                            descripcion: "",
                                            montoPesos: "",
                                            montoEth: "",
                                            tipoSiniestro: "auto",
                                            ubicacion: "",
                                        });
                                    }}>
                                    Limpiar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        creandoReclamo || !walletConectada
                                    }
                                    className="min-w-[150px]">
                                    {creandoReclamo ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Crear Reclamo
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Siguiente Paso */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            ¿Qué sigue después?
                        </h3>
                        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                            <li>
                                Tu reclamo será validado por un administrador
                            </li>
                            <li>
                                Si es válido, se evaluará para su aprobación
                            </li>
                            <li>Una vez aprobado, se procesará el pago</li>
                            <li>
                                Recibirás los fondos directamente en tu wallet
                            </li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
