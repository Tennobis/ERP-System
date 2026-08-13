import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface RiskDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  risk: {
    project: string;
    riskLevel: string;
    probability: number;
    impact: string;
    mitigation: string;
    category?: string;
    lastAssessment?: string;
    nextReview?: string;
    owner?: string;
    mitigationActions?: string[];
  };
}

export function RiskDetailsDialog({ isOpen, onClose, risk }: RiskDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Risk Details - {risk.project}</DialogTitle>
          <DialogDescription>
            Comprehensive risk assessment and mitigation details
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Risk Assessment</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Risk Level:</span>
                  <Badge variant={risk.riskLevel === 'High' ? 'destructive' : risk.riskLevel === 'Medium' ? 'secondary' : 'outline'}>
                    {risk.riskLevel}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Probability:</span>
                  <span>{risk.probability}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Impact:</span>
                  <Badge variant={risk.impact === 'Critical' ? 'destructive' : risk.impact === 'Major' ? 'secondary' : 'outline'}>
                    {risk.impact}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span>{risk.category || 'Not specified'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-2">Timeline</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Assessment:</span>
                  <span>{risk.lastAssessment || 'Not available'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Next Review:</span>
                  <span>{risk.nextReview || 'Not scheduled'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Owner:</span>
                  <span>{risk.owner || 'Not assigned'}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-medium mb-2">Mitigation Strategy</h3>
            <p className="text-sm mb-4">{risk.mitigation}</p>
            
            <h4 className="font-medium mb-2">Action Items</h4>
            <ul className="list-disc list-inside space-y-1">
              {risk.mitigationActions?.map((action, index) => (
                <li key={index} className="text-sm">{action}</li>
              )) || (
                <li className="text-sm text-muted-foreground">No action items specified</li>
              )}
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 