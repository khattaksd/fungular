export interface UsageMeter {
  label: string;
  pct: number;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'due';
}

export interface BillingInfo {
  plan: string;
  price: string;
  seats: number;
  usage: UsageMeter[];
  invoices: Invoice[];
}
