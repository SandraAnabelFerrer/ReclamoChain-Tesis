import { MainLayout } from "@/components/main-layout";
import { ReclamosManager } from "@/components/reclamos-manager";

export default function ReclamosPage() {
    return (
        <MainLayout>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">
                    Gestión de Reclamaciones
                </h1>
            </div>
            <div className="flex-1">
                <ReclamosManager />
            </div>
        </MainLayout>
    );
}
