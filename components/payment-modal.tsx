"use client";

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
import { AlertCircle, CheckCircle2, Loader2, Wallet, X } from "lucide-react";
import { useState } from "react";

// Declaración de tipo para window.ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

interface PaymentModalProps {
    reclamo: ReclamoDB;
    onClose: () => void;
    onSuccess: () => void;
}

export function PaymentModal({
    reclamo,
    onClose,
    onSuccess,
}: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [metodoSeleccionado, setMetodoSeleccionado] = useState<
        "metamask" | "contrato" | null
    >(null);
    const [walletConectada, setWalletConectada] = useState(false);
    const [cuentaActual, setCuentaActual] = useState<string>("");
    const { toast } = useToast();

    const conectarWallet = async () => {
        try {
            if (typeof window.ethereum === "undefined") {
                toast({
                    title: "MetaMask no detectado",
                    description:
                        "Por favor instala MetaMask para continuar con el pago",
                    variant: "destructive",
                });
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);

            if (accounts.length > 0) {
                setCuentaActual(accounts[0]);
                setWalletConectada(true);
                toast({
                    title: "Wallet conectada",
                    description: `Conectado a ${accounts[0].substring(
                        0,
                        6
                    )}...${accounts[0].substring(38)}`,
                });
            }
        } catch (error) {
            console.error("Error conectando wallet:", error);
            toast({
                title: "Error",
                description: "No se pudo conectar con MetaMask",
                variant: "destructive",
            });
        }
    };

    const pagarConMetamask = async () => {
        if (!walletConectada) {
            toast({
                title: "Wallet no conectada",
                description: "Por favor conecta tu wallet primero",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);

            console.log("🔍 Iniciando proceso de pago con MetaMask...");
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const signerAddress = await signer.getAddress();

            console.log("👛 Wallet conectada:", signerAddress);

            // Obtener dirección del contrato
            const contractAddress = process.env
                .NEXT_PUBLIC_CONTRACT_ADDRESS as string;
            
            console.log("🔍 DEBUG - Variables de entorno:");
            console.log("   - NEXT_PUBLIC_CONTRACT_ADDRESS:", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
            console.log("   - contractAddress asignado:", contractAddress);
            
            if (!contractAddress) {
                throw new Error(
                    "❌ Dirección del contrato no configurada.\n\n" +
                    "Agrega NEXT_PUBLIC_CONTRACT_ADDRESS en .env.local:\n" +
                    "NEXT_PUBLIC_CONTRACT_ADDRESS=0xdD89f538b34B9Bf62d4413Ee8FFa6F94C893497A\n\n" +
                    "Luego reinicia el servidor Next.js (npm run dev)"
                );
            }

            console.log("📍 Dirección del contrato:", contractAddress);
            console.log("🆔 Siniestro ID:", reclamo.siniestroId);
            console.log("💰 Monto a pagar:", reclamo.monto, "ETH");

            // ABI con la nueva función pública
            const contractABI = [
                "function pagarReclamoPublico(uint256 _siniestroId) external payable",
                "function procesarPago(uint256 _siniestroId) external payable",
                "function reclamos(uint256) view returns (uint256 siniestroId, address solicitante, string descripcion, uint256 monto, uint8 estado, uint256 fechaCreacion, uint256 fechaActualizacion, address validadoPor, address procesadoPor, string notasAdmin)",
                "function propietario() view returns (address)",
                "function administradores(address) view returns (bool)",
            ];

            const contract = new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            );

            // Convertir monto a wei PRIMERO
            const montoWei = ethers.parseEther(reclamo.monto.toString());
            console.log("💎 Monto en Wei:", montoWei.toString());

            // Verificar balance de la wallet
            const balance = await provider.getBalance(signerAddress);
            console.log("💰 Balance de tu wallet:", ethers.formatEther(balance), "ETH");

            if (balance < montoWei) {
                throw new Error(
                    `❌ Fondos insuficientes en tu wallet.\n\n` +
                    `Necesitas: ${ethers.formatEther(montoWei)} ETH\n` +
                    `Tienes: ${ethers.formatEther(balance)} ETH`
                );
            }

            // ⚠️ VALIDACIÓN DESACTIVADA TEMPORALMENTE
            // El error "missing trie node" indica que el RPC no está sincronizado
            // Dejamos que el smart contract haga las validaciones
            console.log("⚠️  Saltando validación de lectura (RPC no sincronizado)");
            console.log("   El smart contract validará el estado al ejecutar la transacción");

            toast({
                title: "Esperando confirmación",
                description:
                    "Por favor confirma la transacción en MetaMask...",
            });

            console.log("🚀 Enviando transacción a MetaMask...");
            console.log("   - Función: pagarReclamoPublico (cualquier usuario puede pagar)");
            console.log("   - Parámetros:", reclamo.siniestroId);
            console.log("   - Value (ETH):", ethers.formatEther(montoWei));
            console.log("   - Gas Limit: 300000 (manual, sin estimación)");
            console.log("   - Contract:", contractAddress);
            console.log("\n🔔 ESPERANDO CONFIRMACIÓN EN METAMASK...\n");

            // Ejecutar pago usando la función pública
            // IMPORTANTE: No usar gasLimit muy alto para evitar estimación automática
            let tx;
            try {
                tx = await contract.pagarReclamoPublico(reclamo.siniestroId, {
                    value: montoWei,
                    // No especificar gasLimit para que MetaMask use sus valores por defecto
                    // Esto evita el error de estimación
                });
            } catch (txError: any) {
                console.error("❌ Error al enviar transacción:", txError);
                console.error("❌ Código de error:", txError.code);
                console.error("❌ Mensaje:", txError.message);
                console.error("❌ Data:", txError.data);
                
                if (txError.code === 'ACTION_REJECTED') {
                    throw new Error("❌ Transacción rechazada por el usuario en MetaMask");
                }
                
                // Si es error de RPC, dar instrucciones
                if (txError.code === -32603 || txError.message?.includes('missing trie node')) {
                    throw new Error(
                        "❌ Error de conexión RPC.\n\n" +
                        "El nodo RPC no está sincronizado. Por favor:\n" +
                        "1. Abre MetaMask\n" +
                        "2. Ve a Configuración > Redes\n" +
                        "3. Edita la red Sepolia\n" +
                        "4. Cambia el RPC URL a:\n" +
                        "   https://rpc.sepolia.org\n" +
                        "   o\n" +
                        "   https://ethereum-sepolia.publicnode.com\n" +
                        "5. Guarda y vuelve a intentar"
                    );
                }
                
                throw new Error(
                    `❌ Error al enviar transacción:\n${txError.message}\n\n` +
                    `Código: ${txError.code || 'N/A'}`
                );
            }

            console.log("✅ Transacción firmada y enviada!");
            console.log("📝 Hash:", tx.hash);

            toast({
                title: "Transacción enviada",
                description: "Esperando confirmación en la blockchain...",
            });

            const receipt = await tx.wait();

            // Actualizar en el backend
            const response = await fetch(
                `/api/reclamos/${reclamo.siniestroId}/pagar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        hashTransaccion: receipt.hash,
                        metodoPago: "metamask",
                        pagadoPor: cuentaActual,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "¡Pago exitoso!",
                    description: `Reclamo ${reclamo.siniestroId} pagado correctamente`,
                });
                onSuccess();
                onClose();
            } else {
                throw new Error(data.message || "Error actualizando el pago");
            }
        } catch (error: any) {
            console.error("❌ ERROR COMPLETO:", error);
            console.error("❌ Error code:", error.code);
            console.error("❌ Error reason:", error.reason);
            console.error("❌ Error data:", error.data);

            let errorMessage = "Error procesando el pago";
            
            if (error.code === "ACTION_REJECTED") {
                errorMessage = "Transacción cancelada por el usuario";
            } else if (error.message?.includes("NO EXISTE")) {
                errorMessage = error.message;
            } else if (error.message?.includes("APROBADO")) {
                errorMessage = error.message;
            } else if (error.message?.includes("PAGADO")) {
                errorMessage = error.message;
            } else if (error.message?.includes("PERMISOS")) {
                errorMessage = error.message;
            } else if (error.message?.includes("Fondos insuficientes")) {
                errorMessage = error.message;
            } else if (error.reason) {
                errorMessage = `Error del contrato: ${error.reason}`;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast({
                title: "Error en el pago",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const pagarDesdeContrato = async () => {
        try {
            setLoading(true);

            toast({
                title: "Procesando pago",
                description:
                    "Pagando desde el balance del contrato inteligente...",
            });

            const response = await fetch(
                `/api/reclamos/${reclamo.siniestroId}/pagar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        metodoPago: "contrato",
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                toast({
                    title: "¡Pago exitoso!",
                    description: `Reclamo ${reclamo.siniestroId} pagado desde el contrato`,
                });
                onSuccess();
                onClose();
            } else {
                throw new Error(data.message || "Error procesando el pago");
            }
        } catch (error: any) {
            console.error("Error procesando pago:", error);
            toast({
                title: "Error en el pago",
                description: error.message || "Error procesando el pago",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatearMonto = (monto: number | string) => {
        const montoNum = typeof monto === "string" ? parseFloat(monto) : monto;
        return new Intl.NumberFormat("es-ES", {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4,
        }).format(montoNum);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Procesar Pago de Reclamo</CardTitle>
                        <CardDescription>
                            Siniestro ID: {reclamo.siniestroId}
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Información del reclamo */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-gray-600">
                                    Beneficiario
                                </Label>
                                <p className="font-mono text-sm">
                                    {reclamo.solicitante.substring(0, 6)}...
                                    {reclamo.solicitante.substring(38)}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-600">
                                    Monto a Pagar
                                </Label>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatearMonto(reclamo.monto)} ETH
                                </p>
                            </div>
                            <div className="col-span-2">
                                <Label className="text-sm text-gray-600">
                                    Descripción
                                </Label>
                                <p className="text-sm">{reclamo.descripcion}</p>
                            </div>
                        </div>
                    </div>

                    {/* Selección de método de pago */}
                    {!metodoSeleccionado ? (
                        <div className="space-y-4">
                            <Label className="text-base">
                                Selecciona método de pago:
                            </Label>

                            {/* Opción MetaMask */}
                            <button
                                onClick={() => setMetodoSeleccionado("metamask")}
                                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <Wallet className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1">
                                            Pagar con MetaMask
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Paga directamente desde tu wallet de
                                            MetaMask. Tendrás control total de
                                            la transacción.
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                            <CheckCircle2 className="h-3 w-3" />
                                            <span>Mayor descentralización</span>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Opción Contrato */}
                            <button
                                onClick={() => setMetodoSeleccionado("contrato")}
                                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1">
                                            Pagar desde Contrato
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Utiliza los fondos previamente
                                            depositados en el contrato
                                            inteligente.
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                            <CheckCircle2 className="h-3 w-3" />
                                            <span>Pago automatizado</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Método MetaMask seleccionado */}
                            {metodoSeleccionado === "metamask" && (
                                <div className="space-y-4">
                                    {!walletConectada ? (
                                        <>
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                                                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                                                <div className="text-sm">
                                                    <p className="font-medium">
                                                        Conecta tu wallet
                                                    </p>
                                                    <p className="text-gray-600">
                                                        Necesitas conectar
                                                        MetaMask para continuar
                                                        con el pago
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={conectarWallet}
                                                className="w-full"
                                                size="lg"
                                            >
                                                <Wallet className="mr-2 h-5 w-5" />
                                                Conectar MetaMask
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    <span className="font-medium">
                                                        Wallet Conectada
                                                    </span>
                                                </div>
                                                <p className="text-sm font-mono text-gray-600">
                                                    {cuentaActual}
                                                </p>
                                            </div>

                                            <Button
                                                onClick={pagarConMetamask}
                                                disabled={loading}
                                                className="w-full"
                                                size="lg"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Procesando pago...
                                                    </>
                                                ) : (
                                                    <>
                                                        Confirmar Pago de{" "}
                                                        {formatearMonto(
                                                            reclamo.monto
                                                        )}{" "}
                                                        ETH
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Método Contrato seleccionado */}
                            {metodoSeleccionado === "contrato" && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            <span className="font-medium">
                                                Pago desde Contrato
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            El pago se realizará automáticamente
                                            desde el balance del contrato
                                            inteligente.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={pagarDesdeContrato}
                                        disabled={loading}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Procesando pago...
                                            </>
                                        ) : (
                                            <>
                                                Procesar Pago de{" "}
                                                {formatearMonto(reclamo.monto)}{" "}
                                                ETH
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                            <Button
                                onClick={() => setMetodoSeleccionado(null)}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                Cambiar método de pago
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
