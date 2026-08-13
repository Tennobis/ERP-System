import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Building2, Users, DollarSign, Calendar, TrendingUp, FileText, CreditCard, ShoppingCart, Package } from "lucide-react"
import { Link } from "react-router-dom"
import { useUser } from "@/contexts/UserContext"

const Index = () => {
  const dashboards = [
    {
      title: "Managing Director",
      description: "Executive overview and strategic insights",
      icon: BarChart3,
      link: "/md-dashboard",
      color: "bg-blue-500"
    },
    {
      title: "Admin & IT",
      description: "System monitoring, user management and IT operations",
      icon: Users,
      link: "/admin-dashboard",
      color: "bg-purple-500"
    },
    {
      title: "Design Dashboard",
      description: "Design approvals and project tracking",
      icon: Building2,
      link: "/design-dashboard",
      color: "bg-green-500"
    },
    {
      title: "Client Dashboard",
      description: "Client relationships and engagement",
      icon: Users,
      link: "/client-manager",
      color: "bg-orange-500"
    },
    {
      title: "Store Dashboard",
      description: "Inventory and material management",
      icon: Calendar,
      link: "/store-manager",
      color: "bg-red-500"
    },
    {
      title: "Accounts Dashboard",
      description: "Financial management and reporting",
      icon: DollarSign,
      link: "/accounts-manager",
      color: "bg-yellow-500"
    },
    {
      title: "Site Dashboard",
      description: "On-site operations and progress tracking",
      icon: TrendingUp,
      link: "/site-manager",
      color: "bg-indigo-500"
    },
    {
      title: "Client Portal",
      description: "Client access to project information",
      icon: Building2,
      link: "/client-portal",
      color: "bg-pink-500"
    }
  ]

  const managementModules = [
    {
      title: "Tender Management",
      description: "BOQ generation, tender submissions and tracking",
      icon: FileText,
      link: "/tender-management",
      color: "bg-cyan-500"
    },
    {
      title: "Billing Management", 
      description: "Invoice generation and payment tracking",
      icon: CreditCard,
      link: "/billing-management",
      color: "bg-emerald-500"
    },
    {
      title: "Purchase Management",
      description: "Smart procurement and vendor management",
      icon: ShoppingCart,
      link: "/purchase-management",
      color: "bg-violet-500"
    },
    {
      title: "Inventory",
      description: "Inventory tracking and Central Store management",
      icon: Package,
      link: "/inventory",
      color: "bg-amber-500"
    }
  ]

  const { user } = useUser();
  const hasAccess = user?.role === "admin" || user?.role === "md";
  console.log("Current user role:", user?.role);
  console.log("Has  access:", hasAccess);

  return (
    <div className="space-y-8">
      {hasAccess ? (
        <>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">ConstructFlow</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive construction management system with role-based dashboards for efficient project oversight and collaboration.
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-6">Dashboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dashboards.map((dashboard) => (
              <Card key={dashboard.title} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg ${dashboard.color} flex items-center justify-center mb-3`}>
                    <dashboard.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {dashboard.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full group-hover:bg-primary/90">
                    <Link to={dashboard.link}>
                      Access Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6 mt-12">Management Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {managementModules.map((module) => (
              <Card key={module.title} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-3`}>
                    <module.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full group-hover:bg-primary/90">
                    <Link to={module.link}>
                      Access Module
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-none">
            <CardHeader>
              <CardTitle className="text-2xl">Quick Stats</CardTitle>
              <CardDescription>Overview of system-wide metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">24</div>
                  <div className="text-sm text-muted-foreground">Active Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">₹50M</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">150</div>
                  <div className="text-sm text-muted-foreground">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">98%</div>
                  <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground">Only Admin and IT personnel have access to this dashboard.</p>
        </div>
      )}
    </div>
  )
}

export default Index
