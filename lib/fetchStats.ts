import { ReclamoService } from "@/lib/reclamoService";

export async function fetchStats() {
    const service = new ReclamoService();
    await service.init();

    const totalReclamaciones = await service.getTotalReclamaciones();
    const reclamacionesAprobadas = await service.getReclamacionesAprobadas();
    const usuariosActivos = await service.getUsuariosActivos();
    const montoTotal = await service.getMontoTotal();

    return {
        totalReclamaciones,
        reclamacionesAprobadas,
        usuariosActivos,
        montoTotal,
    };
}
