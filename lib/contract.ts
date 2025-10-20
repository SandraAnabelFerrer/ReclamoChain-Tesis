import { ethers } from "ethers";

// ABI del contrato ReclamacionesSeguros (completo)
const CONTRACT_ABI = [
    // Funciones de lectura
    "function obtenerReclamo(uint256 _siniestroId) external view returns (uint256 siniestroId, address solicitante, string memory descripcion, uint256 monto, uint8 estado, uint256 fechaCreacion, uint256 fechaActualizacion, address validadoPor, address procesadoPor, string memory notasAdmin)",
    "function obtenerTodosLosReclamos() external view returns (uint256[] memory)",
    "function obtenerTotalReclamos() external view returns (uint256)",
    "function propietario() external view returns (address)",
    "function administradores(address) external view returns (bool)",
    "function obtenerBalance() external view returns (uint256)",

    // Funciones de escritura
    "function registrarReclamo(uint256 _siniestroId, string memory _descripcion, uint256 _monto) external",
    "function validarReclamo(uint256 _siniestroId) external",
    "function aprobarReclamo(uint256 _siniestroId, string memory _notas) external",
    "function rechazarReclamo(uint256 _siniestroId, string memory _razon) external",
    "function procesarPago(uint256 _siniestroId) external payable",
    "function agregarAdministrador(address _admin) external",
    "function removerAdministrador(address _admin) external",
    "function retirarFondos() external",

    // Eventos
    "event ReclamoCreado(uint256 indexed siniestroId, address indexed solicitante, string descripcion, uint256 monto)",
    "event ReclamoValidado(uint256 indexed siniestroId, address indexed validadoPor, uint256 timestamp)",
    "event ReclamoAprobado(uint256 indexed siniestroId, address indexed procesadoPor, uint256 monto, uint256 timestamp)",
    "event ReclamoRechazado(uint256 indexed siniestroId, address indexed procesadoPor, string razon, uint256 timestamp)",
    "event ReclamoPagado(uint256 indexed siniestroId, address indexed beneficiario, uint256 monto, uint256 timestamp)",
];

/**
 * Configuración del proveedor blockchain
 */
export function getProvider(): ethers.JsonRpcProvider {
    const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.GOERLI_RPC_URL;
    if (!rpcUrl) {
        throw new Error(
            "No se encontró URL de RPC. Define SEPOLIA_RPC_URL o GOERLI_RPC_URL en .env.local"
        );
    }
    return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Obtener wallet para transacciones
 */
export function getWallet(): ethers.Wallet {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("No se encontró PRIVATE_KEY en .env.local");
    }

    // Validar formato de private key
    const cleanPrivateKey = privateKey.startsWith("0x")
        ? privateKey.slice(2)
        : privateKey;
    if (!/^[0-9a-fA-F]{64}$/.test(cleanPrivateKey)) {
        throw new Error(
            `PRIVATE_KEY inválido. Debe ser 64 caracteres hexadecimales. ` +
                `Valor actual: ${privateKey.substring(0, 10)}... (${
                    privateKey.length
                } caracteres)`
        );
    }

    const provider = getProvider();
    return new ethers.Wallet(privateKey, provider);
}

/**
 * Obtener instancia del contrato para lectura
 */
export function getContractRead(): ethers.Contract {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error(
            "No se encontró NEXT_PUBLIC_CONTRACT_ADDRESS en .env.local"
        );
    }
    const provider = getProvider();
    const contract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        provider
    );
    console.log("Contrato de lectura creado:", contract);
    return contract;
}

/**
 * Obtener instancia del contrato para escritura
 */
export function getContractWrite(): ethers.Contract {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error(
            "No se encontró NEXT_PUBLIC_CONTRACT_ADDRESS en .env.local"
        );
    }
    const wallet = getWallet();
    return new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
}

/**
 * Mapear estado numérico del contrato a string
 */
export function mapearEstadoContrato(estado: number): string {
    const estados = ["creado", "validado", "aprobado", "rechazado", "pagado"];
    return estados[estado] || "desconocido";
}

/**
 * Convertir Wei a ETH
 */
export function weiToEth(wei: string): string {
    return ethers.formatEther(wei);
}

/**
 * Convertir ETH a Wei
 */
export function ethToWei(eth: string): string {
    // Convertir notación científica a decimal con suficiente precisión
    const ethValue = parseFloat(eth).toFixed(18);
    return ethers.parseEther(ethValue).toString();
}

/**
 * Obtener balance del contrato
 */
export async function obtenerBalanceContrato(): Promise<string> {
    const contrato = getContractRead();
    const balance = await contrato.obtenerBalance();
    return weiToEth(balance.toString());
}

/**
 * Verificar si una dirección es administrador
 */
export async function esAdministrador(direccion: string): Promise<boolean> {
    const contrato = getContractRead();
    return await contrato.administradores(direccion);
}

/**
 * Obtener dirección del propietario del contrato
 */
export async function obtenerPropietario(): Promise<string> {
    const contrato = getContractRead();
    return await contrato.propietario();
}
