import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Check, AlertTriangle, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Types for our transactions
type Transaction = {
  id: string;
  desc: string;
  amount: string;
  date: string;
  type: 'Credit' | 'Debit';
};

type BankAccount = {
  bank: string;
  account: string;
  balance: string;
  status: string;
};

const ReconciliationPanel = () => {
  // State management
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [matchedCount, setMatchedCount] = useState(85);
  const [unmatchedTransactions, setUnmatchedTransactions] = useState<Transaction[]>([
    { id: '1', desc: 'NEFT-XX123 - ABC Corp', amount: '₹2,50,000', date: '25 May 2024', type: 'Credit' },
    { id: '2', desc: 'CHQ-801 - XYZ Ltd', amount: '₹1,75,000', date: '24 May 2024', type: 'Debit' },
    { id: '3', desc: 'UPI-XX789 - John Doe', amount: '₹45,000', date: '23 May 2024', type: 'Credit' }
  ]);

  const bankAccounts: BankAccount[] = [
    { bank: 'HDFC Bank', account: '50100483722XX', balance: '₹12,50,000', status: 'Reconciled' },
    { bank: 'ICICI Bank', account: '30245XX7821', balance: '₹8,75,000', status: 'Pending' },
    { bank: 'SBI', account: '35401XX9945', balance: '₹15,20,000', status: 'In Progress' }
  ];

  // Handle opening the match modal
  const handleMatchClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsMatchModalOpen(true);
  };

  // Handle confirming the match
  const handleConfirmMatch = () => {
    if (selectedTransaction) {
      // Remove the matched transaction from the unmatched list
      setUnmatchedTransactions(prev => 
        prev.filter(t => t.id !== selectedTransaction.id)
      );

      // Update the matched percentage
      const newMatchedCount = Math.min(100, matchedCount + 5);
      setMatchedCount(newMatchedCount);

      // Show success message
      toast.success("Transaction matched successfully!");
      setIsMatchModalOpen(false);
      setSelectedTransaction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Matched Transactions</p>
                <p className="text-2xl font-bold text-green-600">{matchedCount}%</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={matchedCount} className="h-2 mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unmatched Items</p>
                <p className="text-2xl font-bold text-orange-600">{unmatchedTransactions.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Requires manual review</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Reconciled</p>
                <p className="text-2xl font-bold text-blue-600">May 25</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">2 days ago</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* <Card>
          <CardHeader>
            <CardTitle>Bank Statements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankAccounts.map((bank, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{bank.bank}</p>
                    <p className="text-sm text-gray-600">A/C: {bank.account}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{bank.balance}</p>
                    <Badge variant={
                      bank.status === 'Reconciled' ? 'default' :
                      bank.status === 'Pending' ? 'secondary' : 'outline'
                    }>
                      {bank.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle>Unmatched Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unmatchedTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.desc}</p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'Credit' ? '+' : '-'}{transaction.amount}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMatchClick(transaction)}
                    >
                      Match
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Transaction Modal */}
      <Dialog open={isMatchModalOpen} onOpenChange={setIsMatchModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Match Transaction</DialogTitle>
            <DialogDescription>
              Match this transaction with a corresponding invoice or record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg bg-muted">
              <h3 className="font-medium mb-2">Transaction Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Description:</span>
                  <span>{selectedTransaction?.desc}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className={selectedTransaction?.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                    {selectedTransaction?.type === 'Credit' ? '+' : '-'}{selectedTransaction?.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{selectedTransaction?.date}</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Match With</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select matching record" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inv-001">Invoice #INV-001 - ABC Corp</SelectItem>
                  <SelectItem value="inv-002">Invoice #INV-002 - XYZ Ltd</SelectItem>
                  <SelectItem value="pay-001">Payment #PAY-001 - John Doe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMatchModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmMatch}>
                Confirm Match
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReconciliationPanel; 