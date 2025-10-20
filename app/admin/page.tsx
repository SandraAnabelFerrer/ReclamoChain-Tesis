import { AdminPanel } from "@/components/admin-panel";
import { MainLayout } from "@/components/main-layout";

export default function AdminPage() {
    return (
        <MainLayout>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">
                    Panel Administrativo
                </h1>
            </div>
            <div className="flex-1">
                <AdminPanel />
            </div>
        </MainLayout>
    );
}
