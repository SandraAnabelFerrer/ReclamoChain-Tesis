"use client";

import { MainLayout } from "@/components/main-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BarChart3, DollarSign, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function EstadisticasPage() {
    const [stats, setStats] = useState({
        totalReclamaciones: 0,
        reclamacionesAprobadas: 0,
        usuariosActivos: 0,
        montoTotal: 0,
    });
    const [reclamosPorEstado, setReclamosPorEstado] = useState<Record<string, number>>({});
    const [reclamosPorTipo, setReclamosPorTipo] = useState<Record<string, { count: number; percentage: number }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/estadisticas");
                const data = await response.json();
                
                if (data.success && data.data.database) {
                    const dbStats = data.data.database;
                    setStats({
                        totalReclamaciones: dbStats.totalReclamos || 0,
                        reclamacionesAprobadas: dbStats.reclamosPorEstado?.aprobado || 0,
                        usuariosActivos: dbStats.usuariosActivos || 0,
                        montoTotal: dbStats.montoTotalReclamado || 0,
                    });
                    setReclamosPorEstado(dbStats.reclamosPorEstado || {});
                    setReclamosPorTipo(dbStats.porTipo || {});
                }
            } catch (error) {
                console.error("Error fetching statistics:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <MainLayout>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">
                    Estadísticas
                </h1>
            </div>
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Reclamaciones
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loading ? "..." : stats.totalReclamaciones}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +20.1% desde el mes pasado
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Reclamaciones Aprobadas
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loading ? "..." : stats.reclamacionesAprobadas}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +15.3% desde el mes pasado
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Usuarios Activos
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loading ? "..." : stats.usuariosActivos}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +5.2% desde el mes pasado
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Monto Total
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loading ? "..." : `$${stats.montoTotal}`}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                +12.5% desde el mes pasado
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Resumen de Reclamaciones</CardTitle>
                            <CardDescription>
                                Distribución de reclamaciones por estado
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="space-y-4">
                                {loading ? (
                                    <p className="text-sm text-muted-foreground">Cargando...</p>
                                ) : (
                                    <>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                            <span className="text-sm">
                                                Creadas: {reclamosPorEstado.creado || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                            <span className="text-sm">
                                                Validadas: {reclamosPorEstado.validado || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                            <span className="text-sm">
                                                Aprobadas: {reclamosPorEstado.aprobado || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                            <span className="text-sm">
                                                Rechazadas: {reclamosPorEstado.rechazado || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                                            <span className="text-sm">
                                                Pagadas: {reclamosPorEstado.pagado || 0}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Tipo de Siniestros</CardTitle>
                            <CardDescription>
                                Distribución por tipo de seguro
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <p className="text-sm text-muted-foreground">Cargando...</p>
                                ) : Object.keys(reclamosPorTipo).length > 0 ? (
                                    Object.entries(reclamosPorTipo).map(([tipo, data]) => (
                                        <div key={tipo} className="flex items-center justify-between">
                                            <span className="text-sm capitalize">{tipo}</span>
                                            <span className="text-sm font-medium">
                                                {data.percentage}%
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
