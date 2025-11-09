import {Link, Outlet, useLocation} from "react-router-dom"
import {AppSidebar} from "@/components/app-sidebar"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {Separator} from "@radix-ui/react-separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {useEffect} from "react";
import {GatewayApi} from "@/components/api/gatewayApi.ts";

function useBreadcrumbs() {
    const { pathname } = useLocation()
    const parts = pathname.replace(/^\//, "").split("/").filter(Boolean)
    return [{path: "/", label: "Dashboard"}, ...parts.map((p, i) => {
        const path = "/" + parts.slice(0, i + 1).join("/")
        const label = p.charAt(0).toUpperCase() + p.slice(1)
        return {path, label}
    })]
}

export default function App() {
    const crumbs = useBreadcrumbs()
    useEffect(() => {
        (async () => {
            try {
                const things = await GatewayApi.listThings<any[]>();
                if (Array.isArray(things) && things.length > 0) {
                    localStorage.setItem("things", JSON.stringify(things));
                }
            } catch {
                // ignore
            }
        })();
    }, []);
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {crumbs.map((c, i) => {
                                const isLast = i === crumbs.length - 1
                                return (
                                    <BreadcrumbItem key={c.path}>
                                        {isLast ? (
                                            <BreadcrumbPage>{c.label}</BreadcrumbPage>
                                        ) : (
                                            <>
                                                <BreadcrumbLink asChild>
                                                    <Link to={c.path}>{c.label}</Link>
                                                </BreadcrumbLink>
                                                <BreadcrumbSeparator />
                                            </>
                                        )}
                                    </BreadcrumbItem>
                                )
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {/* 👉 Cette zone affiche la page correspondant à la route sélectionnée */}
                <main className="flex flex-1 flex-col gap-4 p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
