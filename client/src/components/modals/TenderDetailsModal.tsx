import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { FileText, MapPin, Calendar, DollarSign, Building2, Users, CheckCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface TenderDetailsModalProps {
  tender: {
    id: string;
    projectName: string;
    client: string;
    estimatedValue: number;
    submissionDate: string;
    status: 'draft' | 'submitted' | 'under-evaluation' | 'awarded' | 'rejected';
    completionPercentage: number;
    category: string;
    location: string;
  };
  open: boolean;
  onClose: () => void;
}

const TenderDetailsModal: React.FC<TenderDetailsModalProps> = ({ tender, open, onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awarded': return 'default';
      case 'submitted': return 'secondary';
      case 'under-evaluation': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const formatValue = (value: number) => {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">{tender.projectName}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Tender ID: {tender.id}</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="p-6 h-[calc(80vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Main Details */}
            <div className="space-y-4">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Project Status</h3>
                      <Badge variant={getStatusColor(tender.status)}>
                        {tender.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completion</span>
                        <span>{tender.completionPercentage}%</span>
                      </div>
                      <Progress value={tender.completionPercentage} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Key Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Client</p>
                        <p className="font-medium">{tender.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Value</p>
                        <p className="font-medium">{formatValue(tender.estimatedValue)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Submission Date</p>
                        <p className="font-medium">{tender.submissionDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{tender.location}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Additional Details */}
            <div className="space-y-4">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Project Timeline</h3>
                  <div className="space-y-3">
                    {[
                      { stage: 'Document Preparation', status: 'completed', date: '2024-01-15' },
                      { stage: 'Internal Review', status: 'completed', date: '2024-01-20' },
                      { stage: 'Client Submission', status: tender.status === 'draft' ? 'pending' : 'completed', date: tender.submissionDate },
                      { stage: 'Evaluation', status: tender.status === 'under-evaluation' ? 'in-progress' : 'pending', date: '-' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                          item.status === 'completed' ? 'bg-green-100' :
                          item.status === 'in-progress' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          <CheckCircle className={`h-3 w-3 ${
                            item.status === 'completed' ? 'text-green-600' :
                            item.status === 'in-progress' ? 'text-blue-600' :
                            'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{item.stage}</p>
                            <span className="text-xs text-muted-foreground">{item.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Team Members</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'John Doe', role: 'Project Manager' },
                      { name: 'Jane Smith', role: 'Technical Lead' },
                      { name: 'Mike Johnson', role: 'Cost Estimator' }
                    ].map((member, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                          <Users className="h-3 w-3 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TenderDetailsModal; 