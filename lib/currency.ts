/**
 * Utilidades para conversión de monedas
 */

// Tipo de cambio aproximado ETH a ARS (se actualizará dinámicamente)
// 1 ETH ≈ 2,500,000 ARS (valor aproximado, se debe actualizar con API)
const ETH_TO_ARS_RATE = 2500000;

/**
 * Obtener el tipo de cambio actual de ETH a ARS
 * Consulta la API de CoinGecko para obtener el precio en tiempo real
 */
export async function getEthToArsRate(): Promise<number> {
    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=ars",
            {
                next: { revalidate: 60 }, // Cache por 60 segundos
            }
        );

        if (!response.ok) {
            throw new Error(`API response error: ${response.status}`);
        }

        const data = await response.json();
        const rate = data?.ethereum?.ars;

        if (!rate || typeof rate !== "number") {
            throw new Error("Invalid rate data received from API");
        }

        return rate;
    } catch (error) {
        console.error("Error obteniendo tipo de cambio:", error);
        // Fallback al valor por defecto
        return ETH_TO_ARS_RATE;
    }
}

/**
 * Convertir pesos argentinos a ETH
 */
export async function pesosToEth(pesos: number): Promise<number> {
    const rate = await getEthToArsRate();
    return pesos / rate;
}

/**
 * Convertir ETH a pesos argentinos
 */
export async function ethToPesos(eth: number): Promise<number> {
    const rate = await getEthToArsRate();
    return eth * rate;
}

/**
 * Formatear monto en pesos argentinos
 */
export function formatPesos(amount: number): string {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Formatear monto en ETH
 */
export function formatEth(amount: number): string {
    return `${amount.toFixed(6)} ETH`;
}
