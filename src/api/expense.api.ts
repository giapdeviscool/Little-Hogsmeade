import { httpClient } from './httpClient';
import { getAuthToken } from '../store/auth.store';

export interface ExpenseCategory {
  id: string;
  name: string;
  costType: 'FIXED' | 'VARIABLE' | 'SEMI_VARIABLE';
  isSystem: boolean;
  branchId?: string | null;
}

export interface Expense {
  id: string;
  branchId: string;
  expenseCategoryId: string;
  amount: number;
  description: string;
  date: string;
  employeeId: string;
  receiptUrl?: string;
  expenseCategory?: ExpenseCategory;
  employee?: {
    id: string;
    fullName: string;
  };
}

export interface FinancialSummary {
  revenue: number;
  fixedCosts: {
    total: number;
    breakdown: { name: string; amount: number }[];
  };
  variableCosts: {
    total: number;
    breakdown: { name: string; amount: number }[];
  };
  semiVariableCosts: {
    total: number;
    breakdown: { name: string; amount: number }[];
  };
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  variableCostPerUnit: number;
  avgPricePerUnit: number;
  totalUnitsSold: number;
  breakEvenRevenue: number | null;
  breakEvenUnits: number | null;
  marginOfSafety: number | null;
  marginOfSafetyPercent: number;
}

export interface BreakEvenData {
  breakEvenRevenue: number | null;
  breakEvenUnits: number | null;
  marginOfSafety: number | null;
  marginOfSafetyPercent: number;
}

export interface CostStructureData {
  name: string;
  amount: number;
  costType: string;
  percent: number;
}

export interface FinancialSnapshot {
  id: string;
  branchId: string | null;
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  totalFixedCost: number;
  totalVariableCost: number;
  cogs: number;
  grossProfit: number;
  netProfit: number;
  breakEvenRevenue: number;
  generatedAt: string;
}

// ----------------------------------------------------
// EXPENSE CATEGORIES
// ----------------------------------------------------

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await httpClient<any>('/expenses/categories');
  return response.data;
};

export const createExpenseCategory = async (data: { name: string; costType: string; isSystem?: boolean; branchId?: string | null }): Promise<ExpenseCategory> => {
  const response = await httpClient<any>('/expenses/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

export const updateExpenseCategory = async (id: string, data: { name?: string; costType?: string; branchId?: string | null }): Promise<ExpenseCategory> => {
  const response = await httpClient<any>(`/expenses/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
};

export const deleteExpenseCategory = async (id: string): Promise<void> => {
  await httpClient<any>(`/expenses/categories/${id}`, {
    method: 'DELETE',
  });
};

// ----------------------------------------------------
// EXPENSES (PHIẾU CHI)
// ----------------------------------------------------

export const getExpenses = async (branchId: string, startDate?: string, endDate?: string): Promise<Expense[]> => {
  const params = new URLSearchParams();
  params.append('branchId', branchId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await httpClient<any>(`/expenses?${params.toString()}`);
  return response.data;
};

export const createExpense = async (data: any): Promise<Expense> => {
  const response = await httpClient<any>('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await httpClient<any>(`/expenses/${id}`, {
    method: 'DELETE',
  });
};

// ----------------------------------------------------
// FINANCE (BÁO CÁO TÀI CHÍNH)
// ----------------------------------------------------

export const getFinanceDashboard = async (branchId: string, startDate: string, endDate: string): Promise<FinancialSummary> => {
  const params = new URLSearchParams();
  params.append('branchId', branchId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  
  const response = await httpClient<any>(`/finance/dashboard?${params.toString()}`);
  return response.data;
};

export const getBreakEven = async (branchId: string, startDate: string, endDate: string): Promise<BreakEvenData> => {
  const params = new URLSearchParams();
  params.append('branchId', branchId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  
  const response = await httpClient<any>(`/finance/break-even?${params.toString()}`);
  return response.data;
};

export interface DailyProfitData {
  date: string;
  revenue: number;
  variableCost: number;
  fixedCost: number;
  netProfit: number;
}

export const getDailyProfit = async (branchId: string, startDate: string, endDate: string): Promise<DailyProfitData[]> => {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  
  const response = await httpClient<any>(`/finance/daily-profit?${params.toString()}`);
  return response.data;
};

export const getCostStructure = async (branchId: string, startDate: string, endDate: string): Promise<CostStructureData[]> => {
  const params = new URLSearchParams();
  params.append('branchId', branchId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  
  const response = await httpClient<any>(`/finance/cost-structure?${params.toString()}`);
  return response.data;
};

export const generateSnapshot = async (branchId: string | null, periodStart: string, periodEnd: string): Promise<any> => {
  const response = await httpClient<any>('/finance/snapshot/generate', {
    method: 'POST',
    body: JSON.stringify({ branchId, periodStart, periodEnd })
  });
  return response;
};

export const getFinanceSnapshots = async (branchId?: string): Promise<FinancialSnapshot[]> => {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  const response = await httpClient<any>(`/finance/snapshots?${params.toString()}`);
  return response.data;
};

export const exportFinanceReport = async (branchId: string, startDate: string, endDate: string, format: 'csv' | 'xlsx'): Promise<void> => {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', branchId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  params.append('format', format);
  
  const token = getAuthToken();
  const url = `http://localhost:3000/api/v1/finance/export?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Lỗi khi xuất file báo cáo');
  }
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `Bao-cao-tai-chinh-${startDate}-den-${endDate}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
