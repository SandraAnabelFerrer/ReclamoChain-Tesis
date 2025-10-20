import { MainLayout } from "@/components/main-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BarChart3, DollarSign, TrendingUp, Users } from "lucide-react";

export default function EstadisticasPage() {
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
                            <div className="text-2xl font-bold">1,234</div>
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
                            <div className="text-2xl font-bold">892</div>
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
                            <div className="text-2xl font-bold">456</div>
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
                            <div className="text-2xl font-bold">$2,345,678</div>
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
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <span className="text-sm">
                                        Creadas: 234
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                    <span className="text-sm">
                                        Validadas: 156
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm">
                                        Aprobadas: 892
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                    <span className="text-sm">
                                        Rechazadas: 45
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                                    <span className="text-sm">
                                        Pagadas: 234
                                    </span>
                                </div>
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
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Automóvil</span>
                                    <span className="text-sm font-medium">
                                        45%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Hogar</span>
                                    <span className="text-sm font-medium">
                                        30%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Vida</span>
                                    <span className="text-sm font-medium">
                                        15%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Salud</span>
                                    <span className="text-sm font-medium">
                                        10%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
