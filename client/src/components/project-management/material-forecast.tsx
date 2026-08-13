import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, AlertTriangle, Calendar, Download, DollarSign, Clock, MapPin } from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EnhancedStatCard } from "@/components/enhanced-stat-card";
import type { InventoryItem } from "@/types/dummy-data-types";

interface MaterialForecastProps {
  projectId: string;
  timeframe: '2-weeks' | '1-month' | 'custom';
  inventoryData: InventoryItem[];
}

interface QuoteRequest {
  materialId: string;
  quantity: number;
  unit: string;
  requiredDate: string;
  additionalNotes: string;
}

export function MaterialForecast({ projectId, timeframe, inventoryData }: MaterialForecastProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'2-weeks' | '1-month' | 'custom'>(timeframe);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<InventoryItem | null>(null);
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest>({
    materialId: '',
    quantity: 0,
    unit: '',
    requiredDate: '',
    additionalNotes: ''
  });

  // Get unique categories from inventory data
  const categories = Array.from(new Set(inventoryData.map(item => 
    Array.isArray(item.category) ? item.category[0] : item.category
  )));

  // Calculate category statistics
  const categoryStats = categories.map(category => {
    const categoryItems = inventoryData.filter(item => 
      (Array.isArray(item.category) ? item.category[0] : item.category) === category
    );
    const totalQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = categoryItems.reduce((sum, item) => sum + (item.quantity * (item.unitCost || 0)), 0);
    const lowStockItems = categoryItems.filter(item => 
      item.safetyStock && item.quantity <= item.safetyStock
    ).length;
    
    return {
      category,
      itemCount: categoryItems.length,
      totalQuantity,
      totalValue,
      lowStockItems,
      items: categoryItems
    };
  });

  const totalInventoryValue = categoryStats.reduce((sum, cat) => sum + cat.totalValue, 0);
  const totalItems = inventoryData.length;
  const lowStockItemsCount = inventoryData.filter(item => 
    item.safetyStock && item.quantity <= item.safetyStock
  ).length;

  const getAvailabilityColor = (item: InventoryItem) => {
    if (!item.safetyStock) return 'default';
    if (item.quantity === 0) return 'destructive';
    if (item.quantity <= item.safetyStock) return 'secondary';
    if (item.quantity <= (item.safetyStock * 1.5)) return 'outline';
    return 'default';
  };

  const getAvailabilityText = (item: InventoryItem) => {
    if (!item.safetyStock) return 'Unknown';
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.safetyStock) return 'Low Stock';
    if (item.quantity <= (item.safetyStock * 1.5)) return 'Medium Stock';
    return 'In Stock';
  };

  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(value as '2-weeks' | '1-month' | 'custom');
  };

  const handleExportForecast = () => {
    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Overview sheet
    const overviewData = [
      {
        'Total Items': totalItems,
        'Total Inventory Value': `₹${(totalInventoryValue / 100000).toFixed(1)}L`,
        'Low Stock Items': lowStockItemsCount,
        'Categories': categories.length
      }
    ];
    const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, overviewSheet, 'Overview');

    // Category breakdown sheet
    const categoryData = categoryStats.map(cat => ({
      'Category': cat.category,
      'Total Value': `₹${(cat.totalValue / 100000).toFixed(1)}L`,
      'Percentage': `${((cat.totalValue / totalInventoryValue) * 100).toFixed(1)}%`,
      'Number of Items': cat.itemCount,
      'Low Stock Items': cat.lowStockItems
    }));
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, categorySheet, 'Category Breakdown');

    // Inventory sheet
    const inventorySheetData = inventoryData.map(item => ({
      'ID': item.id,
      'Name': item.name,
      'Category': Array.isArray(item.category) ? item.category[0] : item.category,
      'Quantity': item.quantity,
      'Unit': item.unit,
      'Location': item.location || 'N/A',
      'Total Value': `₹${(item.quantity * (item.unitCost || 0)).toLocaleString()}`,
      'Unit Cost': `₹${item.unitCost || 0}`,
      'Availability': getAvailabilityText(item),
      'Last Updated': item.lastUpdated || 'N/A'
    }));
    const inventorySheet = XLSX.utils.json_to_sheet(inventorySheetData);
    XLSX.utils.book_append_sheet(wb, inventorySheet, 'Inventory');

    // Export the workbook
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `inventory-forecast-${selectedTimeframe}-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success("Inventory forecast data has been exported to Excel");
  };

  const handleRequestQuote = (material: InventoryItem) => {
    setSelectedMaterial(material);
    setQuoteRequest({
      materialId: material.id,
      quantity: material.quantity,
      unit: material.unit,
      requiredDate: new Date().toISOString().split('T')[0],
      additionalNotes: ''
    });
    setIsQuoteDialogOpen(true);
  };

  const handleSubmitQuoteRequest = () => {
    // Here you would typically make an API call to submit the quote request
    toast.success(`Quote request sent for ${selectedMaterial?.name}`);
    setIsQuoteDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Material Forecasting & Scheduling</CardTitle>
            <CardDescription>Upcoming material requirements and procurement planning</CardDescription>
          </div>
          <div className="flex gap-2">
            {/* <Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2-weeks">Next 2 Weeks</SelectItem>
                <SelectItem value="1-month">Next Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select> */}
            {/* <Button variant="outline" size="sm" onClick={handleExportForecast}>
              <Download className="h-4 w-4 mr-1" />
              Export Forecast
            </Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Material List</TabsTrigger>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Category Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.map((cat) => (
                <Card key={cat.category} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {cat.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Value</span>
                      <span className="font-semibold text-lg">₹{(cat.totalValue / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Items</span>
                      <span className="font-medium">{cat.itemCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Low Stock</span>
                      <Badge variant={cat.lowStockItems > 0 ? "destructive" : "default"}>
                        {cat.lowStockItems}
                      </Badge>
                    </div>
                    <Progress 
                      value={(cat.totalValue / totalInventoryValue) * 100} 
                      className="h-2" 
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {((cat.totalValue / totalInventoryValue) * 100).toFixed(1)}% of total inventory
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Breakdown Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryStats.map((cat) => {
                    const percentage = (cat.totalValue / totalInventoryValue) * 100;
                    
                    return (
                      <div key={cat.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{cat.category}</span>
                          <span>₹{(cat.totalValue / 100000).toFixed(1)}L ({percentage.toFixed(1)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {inventoryData
                .filter(material => selectedCategory === 'all' || 
                  (Array.isArray(material.category) ? material.category[0] : material.category) === selectedCategory)
                .map((material) => (
                <Card key={material.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <h4 className="font-medium">{material.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(material.category) ? material.category[0] : material.category}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={getAvailabilityColor(material)}>
                            {getAvailabilityText(material)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-medium">{material.quantity} {material.unit}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="font-medium">₹{(material.quantity * (material.unitCost || 0)).toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {material.location || 'N/A'}
                        </p>
                        {material.safetyStock && (
                          <p className="text-xs text-muted-foreground">
                            Safety Stock: {material.safetyStock} {material.unit}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Unit Cost</p>
                        <p className="font-medium">₹{material.unitCost || 0}</p>
                        {/* <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => handleRequestQuote(material)}
                        >
                          Request Quote
                        </Button> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quote Request Dialog */}
            <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request Quote</DialogTitle>
                  <DialogDescription>
                    Submit a quote request for {selectedMaterial?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Required</Label>
                    <div className="flex gap-2">
                      <Input
                        id="quantity"
                        type="number"
                        value={quoteRequest.quantity}
                        onChange={(e) => setQuoteRequest(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                      />
                      <span className="flex items-center text-sm text-muted-foreground">{quoteRequest.unit}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="required-date">Required By</Label>
                    <Input
                      id="required-date"
                      type="date"
                      value={quoteRequest.requiredDate}
                      onChange={(e) => setQuoteRequest(prev => ({ ...prev, requiredDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific requirements or notes for the supplier..."
                      value={quoteRequest.additionalNotes}
                      onChange={(e) => setQuoteRequest(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmitQuoteRequest}>Submit Request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="space-y-3">
              {inventoryData
                .sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''))
                .map((material) => (
                <div key={material.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-20 text-sm text-center">
                    <div className="font-medium">{material.lastUpdated ? new Date(material.lastUpdated).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{material.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {Array.isArray(material.category) ? material.category[0] : material.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {material.quantity} {material.unit} - ₹{(material.quantity * (material.unitCost || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={getAvailabilityColor(material)}>
                      {getAvailabilityText(material)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {material.location || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
