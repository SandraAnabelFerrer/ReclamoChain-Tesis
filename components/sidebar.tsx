"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    DollarSign,
    FileText,
    Home,
    Menu,
    Settings,
    Users,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
    {
        name: "Dashboard",
        href: "/",
        icon: Home,
    },
    {
        name: "Reclamaciones",
        href: "/reclamos",
        icon: FileText,
    },
    {
        name: "Pagos",
        href: "/pagos",
        icon: DollarSign,
    },
    {
        name: "Estadísticas",
        href: "/estadisticas",
        icon: BarChart3,
    },
    {
        name: "Usuarios",
        href: "/usuarios",
        icon: Users,
    },
    {
        name: "Configuración",
        href: "/configuracion",
        icon: Settings,
    },
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Sistema de Reclamaciones
                    </h2>
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <Button
                                key={item.name}
                                variant={
                                    pathname === item.href
                                        ? "secondary"
                                        : "ghost"
                                }
                                className="w-full justify-start"
                                asChild>
                                <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.name}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-semibold">
                        <Wallet className="h-6 w-6" />
                        <span>Reclamaciones</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}
