"use client";

import { MobileSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, User } from "lucide-react";

export function Navbar() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <MobileSidebar />
            <div className="w-full flex-1">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 md:grow-0">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar reclamaciones..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                        />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Notificaciones</span>
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                    <User className="h-4 w-4" />
                    <span className="sr-only">Perfil</span>
                </Button>
            </div>
        </header>
    );
}
