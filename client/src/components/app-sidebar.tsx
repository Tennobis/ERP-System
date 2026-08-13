import {
  BarChart3,
  Building2,
  Calendar,
  ClipboardList,
  DollarSign,
  FileText,
  HardHat,
  Home,
  Monitor,
  Package,
  PaintBucket,
  Settings,
  Users,
  Warehouse,
  LogOut,
  ShoppingCart,
  Receipt,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("/");
  const { state, toggleSidebar } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHROpen, setIsHROpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Update active item and dropdown states based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    setActiveItem(currentPath);

    if (currentPath.startsWith("/hr")) setIsHROpen(true);

    const baseMap: Record<string, string> = {
      admin: "/admin-dashboard",
      drawing: "/design-dashboard",
      client: "/client-manager",
      store: "/store-manager",
      accounts: "/accounts-manager",
      // site: "/site-manager",
      inventory: "/inventory",
      projects: "/projects",
      documents: "/documents",
    };
    const next: Record<string, boolean> = {};
    Object.entries(baseMap).forEach(([id, base]) => {
      next[id] = currentPath === base || currentPath.startsWith(base + "/");
    });
    setOpenSections(next);
  }, [location.pathname]);

  // Split items into different categories for better organization
  const topItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
      allowedRoles: ["admin", "md"],
    },
    {
      title: "Admin & IT",
      url: "/admin-dashboard",
      icon: Monitor,
      allowedRoles: ["admin"],
    }
  ];

  const mainItems = [
    {
      title: "Managing Director",
      url: "/md-dashboard",
      icon: BarChart3,
      allowedRoles: ["admin", "md"],
    },
    // {
    //   title: "Admin & IT",
    //   url: "/admin-dashboard",
    //   icon: Monitor,
    //   allowedRoles: ["admin"],
    // },
    {
      title: "Drawing Dashboard",
      url: "/design-dashboard",
      icon: PaintBucket,
      allowedRoles: ["admin", "md", "client-manager", "project"],
    },
    {
      title: "Client Dashboard",
      url: "/client-manager",
      icon: Users,
      allowedRoles: ["admin", "md", "client-manager"],
    },
    {
      title: "Store Dashboard",
      url: "/store-manager",
      icon: Package,
      allowedRoles: ["admin", "md", "store"],
    },
    {
      title: "Accounts Dashboard",
      url: "/accounts-manager",
      icon: DollarSign,
      allowedRoles: ["admin", "md", "accounts"],
    },
    {
      title: "Site Dashboard",
      url: "/site-manager",
      icon: HardHat,
      allowedRoles: ["admin", "md", "project"],
    },
    // {
    //   title: "Client Portal",
    //   url: "/client-portal",
    //   icon: Building2,
    //   allowedRoles: ["admin", "client"],
    // },
    {
      title: "Project Management",
      url: "/projects",
      icon: ClipboardList,
      allowedRoles: ["admin", "md", "project"],
    },
    {
      title: "Tender Management",
      url: "/tender-management",
      icon: FileText,
      allowedRoles: ["admin", "md", "tender"],
    },
    {
      title: "Billing Management",
      url: "/billing-management",
      icon: Receipt,
      allowedRoles: ["admin", "md", "accounts"],
    },
    {
      title: "Purchase Management",
      url: "/purchase-management",
      icon: ShoppingCart,
      allowedRoles: ["admin", "md", "project", "store", "accounts"],
    },

    {
      title: "Inventory",
      url: "/inventory",
      icon: Warehouse,
      allowedRoles: ["admin", "md", "store", "project", "warehouse"],
    },
    // {
    //   title: "Documents",
    //   url: "/documents",
    //   icon: FileText,
    //   allowedRoles: [
    //     "admin",
    //     "md",
    //     "client-manager",
    //     "store",
    //     "accounts",
    //     "site",
    //     "client",
    //     "hr",
    //     "project"
    //   ],
    // },
  ];

  const bottomItems = [
    {
      title: "Central Store Management",
      url: "/warehouse-management",
      icon: Warehouse,
      allowedRoles: ["admin", "md", "warehouse", "project", "store"],
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
      allowedRoles: [
        "admin",
        "md",
        "client-manager",
        "store",
        "accounts",
        "tender",
        "client",
        "hr",
        "project",
        "warehouse"
      ],
    },
    // {
    //   title: "System Settings",
    //   url: "/settings",
    //   icon: Settings,
    //   allowedRoles: ["admin"],
    // },
  ];

  // HR menu items with subitems
  const hrItems = {
    title: "Human Resources",
    icon: Users,
    allowedRoles: ["admin", "md", "hr", "accounts"],
    subitems: [
      {
        title: "Employees",
        url: "/hr/employees",
      },
      {
        title: "Salary Management",
        url: "/hr/salaries",
      },
    ],
  };

  // Sections with dropdown subitems (deep links)
  const sections = [
    // {
    //   id: "admin",
    //   title: "Admin & IT",
    //   base: "/admin-dashboard",
    //   icon: Monitor,
    //   allowedRoles: ["admin"],
    //   subitems: [
    //     { title: "System Monitoring", url: "/admin-dashboard/monitoring" },
    //     { title: "User Management", url: "/admin-dashboard/users" },
    //     { title: "Modules & API", url: "/admin-dashboard/modules" },
    //     { title: "Security", url: "/admin-dashboard/security" },
    //     { title: "Logs & Audit", url: "/admin-dashboard/logs" },
    //   ],
    // },
    {
      id: "md",
      title: "Managing Director",
      base: "/md-dashboard",
      icon: BarChart3,
      allowedRoles: ["admin", "md"],
      subitems: [
        { title: "Executive Overview", url: "/md-dashboard/executive" },
        { title: "Project Performance", url: "/md-dashboard/projects" },
        { title: "Financial Insights", url: "/md-dashboard/financials" },
      ],
    },
    {
      id: "design",
      title: "Drawing Dashboard",
      base: "/design-dashboard",
      icon: PaintBucket,
      allowedRoles: ["admin", "md", "client-manager", "project"],
      subitems: [
        { title: "Drawing Overview", url: "/design-dashboard/overview" },
        { title: "Review Queue", url: "/design-dashboard/queue" },
      ],
    },
    {
      id: "client",
      title: "Client Dashboard",
      base: "/client-manager",
      icon: Users,
      allowedRoles: ["admin", "md", "client-manager"],
      subitems: [
        { title: "Client Engagement", url: "/client-manager/engagement" },
        { title: "Billing Insights", url: "/client-manager/billing" },
      ],
    },
    {
      id: "store",
      title: "Store Dashboard",
      base: "/store-manager",
      icon: Package,
      allowedRoles: ["admin", "md", "store"],
      subitems: [
        { title: "Overview", url: "/store-manager/overview" },
        { title: "Analytics", url: "/store-manager/analytics" },
        { title: "Vehicle Tracking", url: "/store-manager/vehicle-tracking" },
        { title: "Store Staff", url: "/store-manager/store-staffs" },
      ],
    },
    {
      id: "accounts",
      title: "Accounts Dashboard",
      base: "/accounts-manager",
      icon: DollarSign,
      allowedRoles: ["admin", "md", "accounts"],
      subitems: [
        { title: "Overview", url: "/accounts-manager/overview" },
        { title: "Invoicing", url: "/accounts-manager/invoicing" },
        { title: "Budget Control", url: "/accounts-manager/budget" },
        { title: "Payroll & Compliance", url: "/accounts-manager/payroll" },
        { title: "Tax Management", url: "/accounts-manager/taxes" },
      ],
    },
    {
      id: "site",
      title: "Site Dashboard",
      base: "/site-manager",
      icon: HardHat,
      allowedRoles: ["admin", "md", "project"],
      subitems: [
        { title: "Execution Timeline", url: "/site-manager/timeline" },
        { title: "Daily & Weekly Reports", url: "/site-manager/reports" },
        { title: "Central Warehouse", url: "/site-manager/central-warehouse" },
      ],
    },

    {
      id: "inventory",
      title: "SiteStock Management",
      base: "/inventory",
      icon: Warehouse,
      allowedRoles: ["admin", "md", "store", "project", "warehouse"],
      subitems: [
        { title: "SiteStock", url: "/inventory/inventory" },
        { title: "Material Forecast", url: "/inventory/material-forecast" },
        { title: "Issue Tracking", url: "/inventory/issue-tracking" },
        { title: "Transfers", url: "/inventory/transfers" },
        { title: "Warehouse", url: "/inventory/warehouse" },
      ],
    },
    // {
    //   id: "documents",
    //   title: "Documents",
    //   base: "/documents",
    //   icon: FileText,
    //   allowedRoles: [
    //     "admin",
    //     "md",
    //     "client-manager",
    //     "store",
    //     "accounts",
    //     "site",
    //     "client",
    //     "hr",
    //     "project",
    //   ],
    //   subitems: [
    //     { title: "All Files", url: "/documents/all" },
    //     { title: "My Documents", url: "/documents/my" },
    //   ],
    // },
    // {
    //   id: "client-portal",
    //   title: "Client Portal",
    //   base: "/client-portal",
    //   icon: Users,
    //   allowedRoles: ["admin", "md", "client"],
    //   subitems: [
    //     { title: "Design Review", url: "/client-portal/designs" },
    //     { title: "Financials", url: "/client-portal/financials" },
    //     { title: "Progress Tracker", url: "/client-portal/progress" },
    //     { title: "Documents", url: "/client-portal/documents" },
    //   ],
    // },
    {
      id: "tender",
      title: "Tender Management",
      base: "/tender-management",
      icon: FileText,
      allowedRoles: ["admin", "md", "client-manager", "tender"],
      subitems: [
        { title: "Dashboard", url: "/tender-management/dashboard" },
        { title: "BOQ Generation", url: "/tender-management/preparation" },
        { title: "Submission Tracking", url: "/tender-management/tracking" },
        { title: "Active Tenders", url: "/tender-management/active-tenders" },
      ],
    },
    {
      id: "billing",
      title: "Billing Management",
      base: "/billing-management",
      icon: DollarSign,
      allowedRoles: ["admin", "md", "accounts"],
      subitems: [
        { title: "Overview", url: "/billing-management/overview" },
        { title: "Invoices", url: "/billing-management/invoices" },
        { title: "Payments", url: "/billing-management/payments" },
        { title: "Requests", url: "/billing-management/requests" },
        { title: "Material Indanes", url: "/billing-management/material-indanes" },
      ],
    },
    {
      // id: "purchase",
      title: "Purchase Management",
      base: "/purchase-management",
      icon: Package,
      allowedRoles: ["admin", "md", "project", "store", "accounts"],
      subitems: [
        { title: "Overview", url: "/purchase-management/overview" },
        { title: "Material Requests", url: "/purchase-management/material-requests" },
        ...(user?.role === "project" || user?.role === "store" ? [] : 
          [{ title: "Purchase Orders", url: "/purchase-management/purchase-orders" }]),
        { title: "Vendor Management", url: "/purchase-management/vendors" },

        // { title: "Smart Procurement", url: "/purchase-management/procurement" },
        // { title: "Vendor Management", url: "/purchase-management/vendors" },
      ],
    },
  ];

  const filteredTopItems = user
    ? topItems.filter((item) => item.allowedRoles.includes(user.role))
    : [];

  const filteredMainItems = user
    ? mainItems.filter((item) => item.allowedRoles.includes(user.role))
    : [];

  const filteredBottomItems = user
    ? bottomItems.filter((item) => item.allowedRoles.includes(user.role))
    : [];

  const sectionBases = sections.map((s) => s.base);
  const filteredTopItemsNoSections = filteredTopItems.filter((i) => !sectionBases.includes(i.url));
  const filteredMainItemsNoSections = filteredMainItems.filter((i) => !sectionBases.includes(i.url));
  const filteredBottomItemsNoSections = filteredBottomItems.filter((i) => !sectionBases.includes(i.url));

  const showHR = user && hrItems.allowedRoles.includes(user.role);

  const handleMenuItemClick = (url: string) => {
    setActiveItem(url);
    navigate(url);

    // Auto-open HR dropdown if navigating to HR pages (but not just "/hr")
    if (url.startsWith("/hr") && url !== "/hr") {
      setIsHROpen(true);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      console.log("Starting logout process...");
      await logout();
      console.log("Logout completed, navigating to login...");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="sidebar" className="border-r" collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isCollapsed ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={toggleSidebar}
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            ) : (
              <>
                <Building2 className="h-6 w-6 flex-shrink-0" />
                <span className="text-lg font-semibold truncate">
                  ConstructFlow
                </span>
              </>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>ERP Modules</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Top items (Home) */}
              {filteredTopItemsNoSections.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={cn(
                      activeItem === item.url ? "bg-accent" : "",
                      isCollapsed && "justify-center px-0"
                    )}
                    onClick={() => handleMenuItemClick(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "flex-shrink-0",
                          isCollapsed ? "h-4 w-4" : "h-4 w-4"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate text-base">{item.title}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              
              {/* Dropdown sections with subitems */}
              {sections
                .filter((section) => user && section.allowedRoles.includes(user.role))
                .map((section) => (
                  <Collapsible
                    key={section.id}
                    open={openSections[section.id]}
                    onOpenChange={(o) => setOpenSections((prev) => ({ ...prev, [section.id]: o }))}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            activeItem === section.base || activeItem.startsWith(section.base + "/") ? "bg-accent" : "",
                            isCollapsed && "justify-center px-0"
                          )}
                          tooltip={isCollapsed ? `${section.title} - Click to expand` : undefined}
                          onClick={() => handleMenuItemClick(section.base)}
                        >
                          <div
                            className={cn(
                              "flex items-center gap-2 w-full",
                              isCollapsed && "justify-center"
                            )}
                          >
                            <section.icon
                              className={cn(
                                "flex-shrink-0",
                                isCollapsed ? "h-4 w-4" : "h-4 w-4"
                              )}
                            />
                            {!isCollapsed && (
                              <>
                                <span className="truncate text-base flex-1">{section.title}</span>
                                {openSections[section.id] ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.subitems.map((subitem) => (
                            <SidebarMenuSubItem key={subitem.title}>
                              <SidebarMenuSubButton asChild isActive={activeItem === subitem.url}>
                                <button onClick={() => handleMenuItemClick(subitem.url)} className="w-full text-left">
                                  <span>{subitem.title}</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}

              {/* Keep other single links that aren’t part of dropdown sections */}
              {filteredMainItemsNoSections.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={cn(
                      activeItem === item.url ? "bg-accent" : "",
                      isCollapsed && "justify-center px-0"
                    )}
                    onClick={() => handleMenuItemClick(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "flex-shrink-0",
                          isCollapsed ? "h-4 w-4" : "h-4 w-4"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate text-base">{item.title}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* HR Dropdown Menu - positioned before Calendar */}
              {showHR && (
                <Collapsible open={isHROpen} onOpenChange={setIsHROpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={cn(
                          activeItem.startsWith("/hr") ? "bg-accent" : "",
                          isCollapsed && "justify-center px-0"
                        )}
                        tooltip={isCollapsed ? `${hrItems.title} - Click to expand` : undefined}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-2 w-full",
                            isCollapsed && "justify-center"
                          )}
                        >
                          <hrItems.icon
                            className={cn(
                              "flex-shrink-0",
                              isCollapsed ? "h-4 w-4" : "h-4 w-4"
                            )}
                          />
                          {!isCollapsed && (
                            <>
                              <span className="truncate text-base flex-1">{hrItems.title}</span>
                              {isHROpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </>
                          )}
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {hrItems.subitems.map((subitem) => (
                          <SidebarMenuSubItem key={subitem.title}>
                            <SidebarMenuSubButton asChild isActive={activeItem === subitem.url}>
                              <button onClick={() => handleMenuItemClick(subitem.url)} className="w-full text-left">
                                <span>{subitem.title}</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Bottom items (Calendar) */}
              {filteredBottomItemsNoSections.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={cn(
                      activeItem === item.url ? "bg-accent" : "",
                      isCollapsed && "justify-center px-0"
                    )}
                    onClick={() => handleMenuItemClick(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "flex-shrink-0",
                          isCollapsed ? "h-4 w-4" : "h-4 w-4"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate text-base">{item.title}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn("border-t", isCollapsed ? "p-2" : "p-4")}>
        <div className="flex flex-col gap-4">
          {!isCollapsed && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-2 h-auto",
                  isCollapsed && "w-full flex justify-center"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isCollapsed && "justify-center"
                  )}
                >
                  <Avatar
                    className={cn(
                      "flex-shrink-0",
                      isCollapsed ? "h-6 w-6" : "h-6 w-6"
                    )}
                  >
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.role}
                      </span>
                    </div>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive"
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
