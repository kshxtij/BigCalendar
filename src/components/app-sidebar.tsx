import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { CurrentlyPlayingSidebarFooter } from "@/components/spotify-footer"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={[]} />
      </SidebarContent>
      <SidebarFooter>
        <CurrentlyPlayingSidebarFooter />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
