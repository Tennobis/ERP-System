
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { BellRing, Cloud, Database, Link, Mail, Save, Server, Shield, User, Users, Zap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
      duration: 3000,
    });
  };

  // Mock integration status
  const integrations = [
    {
      id: "google-workspace",
      name: "Google Workspace",
      description: "Connect with Gmail, Drive, and Calendar",
      icon: <Cloud className="h-5 w-5" />,
      connected: true,
      lastSynced: "2 hours ago"
    },
    {
      id: "microsoft-365",
      name: "Microsoft 365",
      description: "Integrate with Outlook, OneDrive, and Teams",
      icon: <Database className="h-5 w-5" />,
      connected: false,
      lastSynced: null
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get notifications and updates in your Slack channels",
      icon: <Zap className="h-5 w-5" />,
      connected: true,
      lastSynced: "5 minutes ago"
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      description: "Sync financial data with your accounting system",
      icon: <Link className="h-5 w-5" />,
      connected: false,
      lastSynced: null
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Manage system-wide settings and configurations</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          {/* <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger> */}
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure system-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="ConstructFlow Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select 
                    id="timezone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="Asia/Kolkata"
                  >
                    <option value="Asia/Kolkata">India (GMT+5:30)</option>
                    <option value="America/New_York">Eastern Time (GMT-5:00)</option>
                    <option value="Europe/London">London (GMT+0:00)</option>
                    <option value="Asia/Singapore">Singapore (GMT+8:00)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <select 
                    id="currency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="INR"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <span className="text-xs text-muted-foreground">
                      When enabled, only admins can access the system
                    </span>
                  </div>
                  <Switch id="maintenance-mode" />
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage users and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">User management features coming soon.</p>
              </CardContent>
            </Card> */}
          </TabsContent>
          
          <TabsContent value="security">
            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security policies and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Security management features coming soon.</p>
              </CardContent>
            </Card> */}
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="mr-2 h-5 w-5" />
                  Integrations
                </CardTitle>
                <CardDescription>
                  Connect with external services and APIs. Manage active connections and configure new ones.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {integrations.map((integration) => (
                    <Card key={integration.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="text-muted-foreground">
                            {integration.icon}
                          </div>
                          <CardTitle className="text-lg font-medium">
                            {integration.name}
                          </CardTitle>
                        </div>
                        <Badge variant={integration.connected ? "default" : "outline"}>
                          {integration.connected ? "Connected" : "Not Connected"}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {integration.description}
                        </p>
                        {integration.connected && (
                          <p className="text-xs text-muted-foreground">
                            Last synced: {integration.lastSynced}
                          </p>
                        )}
                        <div className="mt-4 flex space-x-2">
                          <Button variant={integration.connected ? "outline" : "default"} size="sm">
                            {integration.connected ? "Configure" : "Connect"}
                          </Button>
                          {integration.connected && (
                            <Button variant="ghost" size="sm" className="text-destructive">
                              Disconnect
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">API Configuration</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="api-key"
                          defaultValue="sk_test_51Nf...XrF3"
                          type="password"
                          className="flex-1"
                        />
                        <Button variant="outline">Show</Button>
                        <Button variant="outline">Regenerate</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Keep this key secure. Do not share it publicly.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="webhook-url"
                          defaultValue="https://api.constructflow.com/webhooks"
                          className="flex-1 font-mono text-sm"
                          readOnly
                          onClick={(e) => {
                            // Select all text when clicked
                            (e.target as HTMLInputElement).select();
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText("https://api.constructflow.com/webhooks");
                            toast({
                              title: "Copied!",
                              description: "Webhook URL copied to clipboard",
                              duration: 2000,
                            });
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Configure external services to send events to this endpoint.
                      </p>
                    </div>


                    <div className="space-y-2">
                      <Label>Webhook Events</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="project-updates" defaultChecked />
                          <Label htmlFor="project-updates">Project Updates</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="task-completion" defaultChecked />
                          <Label htmlFor="task-completion">Task Completion</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="invoice-created" />
                          <Label htmlFor="invoice-created">Invoice Created</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="payment-received" defaultChecked />
                          <Label htmlFor="payment-received">Payment Received</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  {/* <Button variant="outline">
                    Test All Connections
                  </Button> */}
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BellRing className="mr-2 h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure email and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                
                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="app-notifications">In-App Notifications</Label>
                  </div>
                  <Switch id="app-notifications" defaultChecked />
                </div> */}
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
