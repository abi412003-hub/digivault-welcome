import { useLocalStorage } from "./useLocalStorage";

export interface Transaction {
  id: string;
  item: string;
  projectName: string;
  propertyName: string;
  createdAt: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("edigivault_transactions", []);

  const addTransaction = (transaction: Omit<Transaction, "id" | "createdAt">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions([...transactions, newTransaction]);
    return newTransaction;
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return {
    transactions,
    addTransaction,
    removeTransaction,
  };
}
