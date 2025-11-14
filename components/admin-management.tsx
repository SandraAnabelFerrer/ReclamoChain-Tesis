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
import {
    agregarAdministradorConMetamask,
    removerAdministradorConMetamask,
    verificarEsAdmin,
    verificarEsPropietario,
} from "@/lib/contractClient";
import { Loader2, Shield, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

interface AdminInfo {
    direccion: string;
    esAdmin: boolean;
}

export function AdminManagement() {
    const [nuevaWallet, setNuevaWallet] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificando, setVerificando] = useState(false);
    const [esPropietario, setEsPropietario] = useState(false);
    const [propietarioAddress, setPropietarioAddress] = useState("");
    const [walletConectada, setWalletConectada] = useState("");
    const [admins, setAdmins] = useState<string[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        verificarPermisos();
    }, []);

    const verificarPermisos = async () => {
        try {
            const resultado = await verificarEsPropietario();
            setEsPropietario(resultado.esPropietario);
            setPropietarioAddress(resultado.propietario || "");
            setWalletConectada(resultado.usuarioActual || "");
        } catch (error) {
            console.error("Error verificando permisos:", error);
        }
    };

    const verificarWallet = async () => {
        if (!nuevaWallet.trim()) {
            toast({
                title: "Error",
                description: "Ingresa una dirección de wallet",
                variant: "destructive",
            });
            return;
        }

        setVerificando(true);
        try {
            const esAdmin = await verificarEsAdmin(nuevaWallet);
            toast({
                title: esAdmin ? "Es Administrador ✓" : "No es Administrador",
                description: esAdmin
                    ? "Esta wallet ya tiene permisos de administrador"
                    : "Esta wallet no es administrador del contrato",
                variant: esAdmin ? "default" : "destructive",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Error verificando la wallet",
                variant: "destructive",
            });
        } finally {
            setVerificando(false);
        }
    };

    const agregarAdmin = async () => {
        if (!nuevaWallet.trim()) {
            toast({
                title: "Error",
                description: "Ingresa una dirección de wallet",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            toast({
                title: "Procesando",
                description: "Confirma la transacción en MetaMask...",
            });

            const resultado = await agregarAdministradorConMetamask(
                nuevaWallet
            );

            if (resultado.success) {
                toast({
                    title: "¡Administrador agregado!",
                    description: `Wallet agregada exitosamente. TX: ${resultado.txHash?.substring(
                        0,
                        10
                    )}...`,
                });
                setNuevaWallet("");
                setAdmins([...admins, nuevaWallet]);
            } else {
                toast({
                    title: "Error",
                    description:
                        resultado.error || "Error agregando administrador",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error agregando admin:", error);
            toast({
                title: "Error",
                description: error.message || "Error de conexión",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const removerAdmin = async (direccion: string) => {
        if (
            !confirm(
                `¿Estás seguro de remover a ${direccion.slice(
                    0,
                    6
                )}...${direccion.slice(-4)} como administrador?`
            )
        ) {
            return;
        }

        setLoading(true);
        try {
            toast({
                title: "Procesando",
                description: "Confirma la transacción en MetaMask...",
            });

            const resultado = await removerAdministradorConMetamask(direccion);

            if (resultado.success) {
                toast({
                    title: "Administrador removido",
                    description: `Wallet removida exitosamente. TX: ${resultado.txHash?.substring(
                        0,
                        10
                    )}...`,
                });
                setAdmins(admins.filter((a) => a !== direccion));
            } else {
                toast({
                    title: "Error",
                    description:
                        resultado.error || "Error removiendo administrador",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error removiendo admin:", error);
            toast({
                title: "Error",
                description: error.message || "Error de conexión",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!esPropietario) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Gestión de Administradores
                    </CardTitle>
                    <CardDescription>
                        Solo el propietario del contrato puede gestionar
                        administradores
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="font-semibold mb-4">
                            No tienes permisos para gestionar administradores
                        </p>

                        <div className="space-y-3 text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                            <div>
                                <p className="font-medium text-gray-700">
                                    Tu wallet conectada:
                                </p>
                                <code className="bg-white px-2 py-1 rounded border">
                                    {walletConectada
                                        ? `${walletConectada.slice(
                                              0,
                                              10
                                          )}...${walletConectada.slice(-8)}`
                                        : "No conectada"}
                                </code>
                            </div>

                            <div>
                                <p className="font-medium text-gray-700">
                                    Propietario del contrato:
                                </p>
                                <code className="bg-white px-2 py-1 rounded border">
                                    {propietarioAddress.slice(0, 10)}...
                                    {propietarioAddress.slice(-8)}
                                </code>
                            </div>

                            <div className="pt-3 border-t border-yellow-300">
                                <p className="font-medium text-gray-800 mb-2">
                                    💡 Solución:
                                </p>
                                <p className="text-left">
                                    Para gestionar administradores, debes
                                    conectar MetaMask con la wallet propietaria.
                                    Esta es la wallet cuya PRIVATE_KEY está en
                                    tu archivo <code>.env.local</code>
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Gestión de Administradores
                </CardTitle>
                <CardDescription>
                    Agrega o remueve administradores del contrato inteligente
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Formulario para agregar admin */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="wallet">
                            Dirección de Wallet (0x...)
                        </Label>
                        <Input
                            id="wallet"
                            type="text"
                            placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                            value={nuevaWallet}
                            onChange={(e) => setNuevaWallet(e.target.value)}
                            disabled={loading || verificando}
                        />
                        <p className="text-sm text-gray-500">
                            La dirección debe ser una wallet de Ethereum válida
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={verificarWallet}
                            variant="outline"
                            disabled={loading || verificando}
                            className="flex-1">
                            {verificando ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Verificar
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={agregarAdmin}
                            disabled={loading || verificando}
                            className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Agregar Admin
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Lista de admins agregados en esta sesión */}
                {admins.length > 0 && (
                    <div className="space-y-2">
                        <Label>Administradores Agregados</Label>
                        <div className="space-y-2">
                            {admins.map((admin) => (
                                <div
                                    key={admin}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <code className="text-sm">
                                        {admin.slice(0, 8)}...{admin.slice(-6)}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => removerAdmin(admin)}
                                        disabled={loading}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Información adicional */}
                <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                    <p className="font-medium">ℹ️ Información importante:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>
                            Solo el propietario puede agregar o remover admins
                        </li>
                        <li>
                            Los admins pueden validar, aprobar y rechazar
                            reclamos
                        </li>
                        <li>
                            Cada operación requiere confirmación en MetaMask
                        </li>
                        <li>Las transacciones se registran en la blockchain</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
