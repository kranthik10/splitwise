export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency?: string;
}

export interface Friend extends User {
  balance: number;
}

export interface Group {
  id: string;
  name: string;
  icon?: string;
  members: User[];
  createdAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  groupId?: string;
  participants: {
    userId: string;
    share: number;
  }[];
  date: string;
  category?: string;
}

export interface Settlement {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
  groupId?: string;
}

export type SplitType = 'equal' | 'exact' | 'percentage';
