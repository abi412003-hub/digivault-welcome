import { ArrowLeft, Bell, MessageSquare, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import BottomNav from "@/components/BottomNav";
import { useTransactions } from "@/hooks/useTransactions";

const Transactions = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactions();

  return (
    <div className="min-h-screen bg-muted/30 pb-24">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-primary/20">
              <Bell className="h-5 w-5 text-primary" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-primary/20">
              <MessageSquare className="h-5 w-5 text-primary" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-primary/10 text-primary">U</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Title with Icon */}
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Transactions</h1>
        </div>
        <Separator className="mb-6" />

        {/* Transactions Table */}
        {transactions.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-primary/5">
              <div className="p-3 text-sm font-medium text-foreground border-r border-border">
                Item
              </div>
              <div className="p-3 text-sm font-medium text-foreground border-r border-border">
                Project Name
              </div>
              <div className="p-3 text-sm font-medium text-foreground">
                Property Name
              </div>
            </div>

            {/* Table Body */}
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={`grid grid-cols-3 ${
                  index !== transactions.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="p-3 text-sm text-muted-foreground border-r border-border">
                  {transaction.item}
                </div>
                <div className="p-3 text-sm text-muted-foreground border-r border-border">
                  {transaction.projectName}
                </div>
                <div className="p-3 text-sm text-muted-foreground">
                  {transaction.propertyName}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Transactions;
