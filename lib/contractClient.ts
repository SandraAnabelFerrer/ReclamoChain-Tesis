/**
 * Funciones para interactuar con el contrato desde el CLIENTE (frontend)
 * Estas funciones usan la wallet de MetaMask del usuario
 */

import { ethers } from "ethers";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

const CONTRACT_ABI = [
    "function obtenerReclamo(uint256 _siniestroId) external view returns (uint256 siniestroId, address solicitante, string memory descripcion, uint256 monto, uint8 estado, uint256 fechaCreacion, uint256 fechaActualizacion, address validadoPor, address procesadoPor, string memory notasAdmin)",
    "function registrarReclamo(uint256 _siniestroId, string memory _descripcion, uint256 _monto) external",
    "function validarReclamo(uint256 _siniestroId) external",
    "function aprobarReclamo(uint256 _siniestroId, string memory _notas) external",
    "function rechazarReclamo(uint256 _siniestroId, string memory _razon) external",
    "function pagarReclamoPublico(uint256 _siniestroId) external payable",
    "function procesarPago(uint256 _siniestroId) external payable",
    "function administradores(address) external view returns (bool)",
    "function agregarAdministrador(address _admin) external",
    "function removerAdministrador(address _admin) external",
    "function propietario() external view returns (address)",
];

/**
 * Obtener el contrato conectado con la wallet del usuario en MetaMask
 */
export async function getContractWithUserWallet(): Promise<ethers.Contract> {
    if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask no detectado");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

/**
 * Validar un reclamo usando la wallet del admin conectado
 */
export async function validarReclamoConMetamask(siniestroId: number): Promise<{
    success: boolean;
    txHash?: string;
    adminAddress?: string;
    error?: string;
}> {
    try {
        const contract = await getContractWithUserWallet();

        // Obtener dirección del usuario
        const signer = await contract.runner?.getAddress();
        if (!signer)
            throw new Error("No se pudo obtener la dirección del usuario");

        // Verificar que es admin
        const esAdmin = await contract.administradores(signer);
        if (!esAdmin) {
            throw new Error("No eres administrador del contrato");
        }

        // Ejecutar transacción
        const tx = await contract.validarReclamo(siniestroId);
        console.log("Transacción enviada:", tx.hash);

        // Esperar confirmación
        await tx.wait();
        console.log("Transacción confirmada");

        return {
            success: true,
            txHash: tx.hash,
            adminAddress: signer,
        };
    } catch (error: any) {
        console.error("Error validando reclamo:", error);
        return {
            success: false,
            error: error.message || "Error desconocido",
        };
    }
}

/**
 * Aprobar un reclamo usando la wallet del admin conectado
 */
export async function aprobarReclamoConMetamask(
    siniestroId: number,
    notas: string
): Promise<{
    success: boolean;
    txHash?: string;
    adminAddress?: string;
    error?: string;
}> {
    try {
        const contract = await getContractWithUserWallet();

        // Obtener dirección del usuario
        const signer = await contract.runner?.getAddress();
        if (!signer)
            throw new Error("No se pudo obtener la dirección del usuario");

        // Verificar que es admin
        const esAdmin = await contract.administradores(signer);
        if (!esAdmin) {
            throw new Error("No eres administrador del contrato");
        }

        // Ejecutar transacción
        const tx = await contract.aprobarReclamo(siniestroId, notas);
        console.log("Transacción enviada:", tx.hash);

        await tx.wait();
        console.log("Transacción confirmada");

        return {
            success: true,
            txHash: tx.hash,
            adminAddress: signer,
        };
    } catch (error: any) {
        console.error("Error aprobando reclamo:", error);
        return {
            success: false,
            error: error.message || "Error desconocido",
        };
    }
}

/**
 * Rechazar un reclamo usando la wallet del admin conectado
 */
export async function rechazarReclamoConMetamask(
    siniestroId: number,
    razon: string
): Promise<{
    success: boolean;
    txHash?: string;
    adminAddress?: string;
    error?: string;
}> {
    try {
        const contract = await getContractWithUserWallet();

        // Obtener dirección del usuario
        const signer = await contract.runner?.getAddress();
        if (!signer)
            throw new Error("No se pudo obtener la dirección del usuario");

        // Verificar que es admin
        const esAdmin = await contract.administradores(signer);
        if (!esAdmin) {
            throw new Error("No eres administrador del contrato");
        }

        // Ejecutar transacción
        const tx = await contract.rechazarReclamo(siniestroId, razon);
        console.log("Transacción enviada:", tx.hash);

        await tx.wait();
        console.log("Transacción confirmada");

        return {
            success: true,
            txHash: tx.hash,
            adminAddress: signer,
        };
    } catch (error: any) {
        console.error("Error rechazando reclamo:", error);
        return {
            success: false,
            error: error.message || "Error desconocido",
        };
    }
}

/**
 * Verificar si una dirección es administrador
 */
export async function verificarEsAdmin(direccion: string): Promise<boolean> {
    try {
        const contract = await getContractWithUserWallet();
        return await contract.administradores(direccion);
    } catch (error) {
        console.error("Error verificando admin:", error);
        return false;
    }
}

/**
 * Verificar si el usuario conectado es propietario del contrato
 */
export async function verificarEsPropietario(): Promise<{
    esPropietario: boolean;
    propietario?: string;
    usuarioActual?: string;
}> {
    try {
        const contract = await getContractWithUserWallet();
        const propietario = await contract.propietario();
        const usuarioActual = await contract.runner?.getAddress();

        return {
            esPropietario:
                usuarioActual?.toLowerCase() === propietario?.toLowerCase(),
            propietario,
            usuarioActual,
        };
    } catch (error) {
        console.error("Error verificando propietario:", error);
        return { esPropietario: false };
    }
}

/**
 * Agregar un nuevo administrador (solo propietario)
 */
export async function agregarAdministradorConMetamask(
    direccionAdmin: string
): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
}> {
    try {
        const contract = await getContractWithUserWallet();

        // Verificar que el usuario es propietario
        const { esPropietario } = await verificarEsPropietario();
        if (!esPropietario) {
            throw new Error(
                "Solo el propietario del contrato puede agregar administradores"
            );
        }

        // Validar formato de dirección
        if (!ethers.isAddress(direccionAdmin)) {
            throw new Error("Dirección de wallet inválida");
        }

        // Verificar si ya es admin
        const yaEsAdmin = await contract.administradores(direccionAdmin);
        if (yaEsAdmin) {
            throw new Error("Esta dirección ya es administrador");
        }

        // Ejecutar transacción
        const tx = await contract.agregarAdministrador(direccionAdmin);
        console.log("Transacción enviada:", tx.hash);

        await tx.wait();
        console.log("Administrador agregado exitosamente");

        return {
            success: true,
            txHash: tx.hash,
        };
    } catch (error: any) {
        console.error("Error agregando administrador:", error);
        return {
            success: false,
            error: error.message || "Error desconocido",
        };
    }
}

/**
 * Remover un administrador (solo propietario)
 */
export async function removerAdministradorConMetamask(
    direccionAdmin: string
): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
}> {
    try {
        const contract = await getContractWithUserWallet();

        // Verificar que el usuario es propietario
        const { esPropietario } = await verificarEsPropietario();
        if (!esPropietario) {
            throw new Error(
                "Solo el propietario del contrato puede remover administradores"
            );
        }

        // Validar formato de dirección
        if (!ethers.isAddress(direccionAdmin)) {
            throw new Error("Dirección de wallet inválida");
        }

        // Verificar si es admin
        const esAdmin = await contract.administradores(direccionAdmin);
        if (!esAdmin) {
            throw new Error("Esta dirección no es administrador");
        }

        // Ejecutar transacción
        const tx = await contract.removerAdministrador(direccionAdmin);
        console.log("Transacción enviada:", tx.hash);

        await tx.wait();
        console.log("Administrador removido exitosamente");

        return {
            success: true,
            txHash: tx.hash,
        };
    } catch (error: any) {
        console.error("Error removiendo administrador:", error);
        return {
            success: false,
            error: error.message || "Error desconocido",
        };
    }
}
