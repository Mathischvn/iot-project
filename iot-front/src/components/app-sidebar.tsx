import * as React from "react"

import { SearchForm } from "@/components/search-form"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
    navMain: [
        {
            title: "Main",
            url: "#",
            items: [
                {
                    title: "Dashboard",
                    url: "/",
                    isActive: true,
                },
            ],
        },
        {
            title: "Objets",
            url: "#",
            items: [
                {
                    title: "Lamp",
                    url: "/lamp",
                    isActive: true,
                },
                {
                    title: "Thermostat",
                    url: "/thermostat",
                    isActive: true,
                },
                {
                    title: "Motion Sensor",
                    url: "/motion",
                    isActive: true,
                },
            ],
        },
        {
            title: "Reports",
            url: "#",
            items: [
                {
                    title: "Logs",
                    url: "/reports",
                    isActive: true,
                },
            ],
        },
    ],
}




export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
