import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Label } from "@/components/ui/label"
import { DropdownMenuDemo } from "@/components/calendar-type-dropdown"
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-sidebar text-white px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage><Label className="text-xl"><strong>October</strong> 2024</Label></BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            {/* Right aligned div */}
            <div className="flex-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DropdownMenuDemo />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-sidebar">
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider >
  );
}

export default App;
