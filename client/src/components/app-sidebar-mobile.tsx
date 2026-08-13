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
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AppSidebarMobileProps {
  className?: string;
}

export function AppSidebarMobile({ className }: AppSidebarMobileProps) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("/");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHROpen, setIsHROpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Update active item when location changes
  useEffect(() => {
    setActiveItem(location.pathname);
    
    // Auto-open HR dropdown if on HR pages
    if (location.pathname.startsWith("/hr")) {
      setIsHROpen(true);
    }

    const baseMap: Record<string, string> = {
      admin: "/admin-dashboard",
      drawing: "/design-dashboard",
      client: "/client-manager",
      store: "/store-manager",
      accounts: "/accounts-manager",
      // site: "/site-manager",
      inventory: "/inventory",
      projects: "/projects",
      // documents: "/documents",
    };
    const next: Record<string, boolean> = {};
    Object.entries(baseMap).forEach(([id, base]) => {
      next[id] = location.pathname === base || location.pathname.startsWith(base + "/");
    });
    setOpenSections(next);
  }, [location.pathname]);



  // Prevent body scroll when sidebar is open (mobile UX improvement)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
      title: "SiteStock",
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
      allowedRoles: ["admin", "md", "warehouse", "store", "project"],
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
        // "site",
        "client",
        "hr",
        "project"
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
      allowedRoles: ["admin", "md", "store", "project"],
      subitems: [
        { title: "SiteStock", url: "/inventory/inventory" },
        { title: "Material Forecast", url: "/inventory/material-forecast" },
        { title: "Issue Tracking", url: "/inventory/issue-tracking" },
        { title: "Transfers", url: "/inventory/transfers" },
        { title: "Warehouse", url: "/inventory/warehouse" },
      ],
    },
    {
          id: "tender",
          title: "Tender Management",
          base: "/tender-management",
          icon: FileText,
          allowedRoles: ["admin", "md", "client-manager"],
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
          ],
        },
        {
          id: "purchase",
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
    {
      id: "documents",
      title: "Documents",
      base: "/documents",
      icon: FileText,
      allowedRoles: [
        "admin",
        "md",
        "client-manager",
        "store",
        "accounts",
        // "site",
        "client",
        "hr",
        "project",
      ],
      subitems: [
        { title: "All Files", url: "/documents/all" },
        { title: "My Documents", url: "/documents/my" },
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
    setIsOpen(false); // Close the sheet after navigation

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
      setIsOpen(false);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "md:hidden h-10 w-10 touch-manipulation",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "active:scale-95 transition-all duration-150",
            className
          )}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-80 p-0 flex flex-col bg-sidebar text-sidebar-foreground">
        <SheetHeader className="border-b border-sidebar-border p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-7 w-7 text-sidebar-foreground" />
              <SheetTitle className="text-lg font-semibold text-sidebar-foreground">
                ConstructFlow
              </SheetTitle>
            </div>
            <SheetClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8 touch-manipulation",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "active:scale-95 transition-all duration-150"
                )}
              >
                {/* <X className="h-4 w-4" /> */}
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-3 px-1">
                ERP Modules
              </h3>
              <div className="space-y-1">
                {/* Top items (Home) */}
                {filteredTopItemsNoSections.map((item) => (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-12 px-3 text-left",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "active:scale-95 transition-all duration-150",
                      "touch-manipulation text-sidebar-foreground",
                      activeItem === item.url && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    )}
                    onClick={() => handleMenuItemClick(item.url)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {item.title}
                    </span>
                  </Button>
                ))}

                {/* Collapsible dropdown sections */}
                {sections
                  .filter((section) => user && section.allowedRoles.includes(user.role))
                  .map((section) => (
                    <Collapsible
                      key={section.id}
                      open={openSections[section.id]}
                      onOpenChange={(o) => setOpenSections((prev) => ({ ...prev, [section.id]: o }))}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start gap-3 h-12 px-3 text-left",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            "active:scale-95 transition-all duration-150",
                            "touch-manipulation text-sidebar-foreground",
                            (activeItem === section.base || activeItem.startsWith(section.base + "/")) && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          )}
                          onClick={() => handleMenuItemClick(section.base)}
                        >
                          <section.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm font-medium truncate flex-1">
                            {section.title}
                          </span>
                          {openSections[section.id] ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-8 space-y-1 mt-1">
                          {section.subitems.map((subitem) => (
                            <Button
                              key={subitem.title}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start gap-3 h-10 px-3 text-left",
                                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                "active:scale-95 transition-all duration-150",
                                "touch-manipulation text-sidebar-foreground",
                                activeItem === subitem.url && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                              )}
                              onClick={() => handleMenuItemClick(subitem.url)}
                            >
                              <span className="text-sm font-medium truncate">
                                {subitem.title}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}

                {/* Keep other single links not part of dropdown */}
                {filteredMainItemsNoSections.map((item) => (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-12 px-3 text-left",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "active:scale-95 transition-all duration-150",
                      "touch-manipulation text-sidebar-foreground",
                      activeItem === item.url && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    )}
                    onClick={() => handleMenuItemClick(item.url)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {item.title}
                    </span>
                  </Button>
                ))}

                {/* HR Dropdown - positioned before Calendar */}
                {showHR && (
                  <Collapsible open={isHROpen} onOpenChange={setIsHROpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-12 px-3 text-left",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          "active:scale-95 transition-all duration-150",
                          "touch-manipulation text-sidebar-foreground",
                          activeItem.startsWith("/hr") && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        )}
                      >
                        <hrItems.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium truncate flex-1">
                          {hrItems.title}
                        </span>
                        {isHROpen ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-8 space-y-1 mt-1">
                        {hrItems.subitems.map((subitem) => (
                          <Button
                            key={subitem.title}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 h-10 px-3 text-left",
                              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              "active:scale-95 transition-all duration-150",
                              "touch-manipulation text-sidebar-foreground",
                              activeItem === subitem.url && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                            )}
                            onClick={() => handleMenuItemClick(subitem.url)}
                          >
                            <span className="text-sm font-medium truncate">
                              {subitem.title}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Bottom items (Calendar) */}
                {filteredBottomItemsNoSections.map((item) => (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-12 px-3 text-left",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "active:scale-95 transition-all duration-150",
                      "touch-manipulation text-sidebar-foreground",
                      activeItem === item.url && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    )}
                    onClick={() => handleMenuItemClick(item.url)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {item.title}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-4 flex-shrink-0 space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-sidebar-foreground/70">
              Theme
            </span>
            <ThemeToggle />
          </div>

          <Separator className="my-3 bg-sidebar-border" />

          {/* User Profile Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-3 h-auto min-h-[60px]",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "active:scale-95 transition-all duration-150",
                  "touch-manipulation text-sidebar-foreground"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-sm font-medium">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium truncate w-full">
                      {user.name}
                    </span>
                    <span className="text-xs text-sidebar-foreground/70 truncate w-full capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  navigate("/profile");
                  setIsOpen(false);
                }}
              >
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SheetContent>
    </Sheet>
  );
}
