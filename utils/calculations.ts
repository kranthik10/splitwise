import { Expense, Friend, Settlement } from '@/types';

export function calculateBalances(
  expenses: Expense[],
  settlements: Settlement[],
  currentUserId: string,
  friends: Friend[]
): Friend[] {
  const balances: { [key: string]: number } = {};

  friends.forEach(friend => {
    balances[friend.id] = 0;
  });

  expenses.forEach(expense => {
    const totalShares = expense.participants.reduce((sum, p) => sum + p.share, 0);
    
    expense.participants.forEach(participant => {
      const owedAmount = (participant.share / totalShares) * expense.amount;
      
      if (participant.userId === currentUserId && expense.paidBy !== currentUserId) {
        balances[expense.paidBy] = (balances[expense.paidBy] || 0) - owedAmount;
      } else if (participant.userId !== currentUserId && expense.paidBy === currentUserId) {
        balances[participant.userId] = (balances[participant.userId] || 0) + owedAmount;
      }
    });
  });

  settlements.forEach(settlement => {
    if (settlement.from === currentUserId) {
      balances[settlement.to] = (balances[settlement.to] || 0) - settlement.amount;
    } else if (settlement.to === currentUserId) {
      balances[settlement.from] = (balances[settlement.from] || 0) + settlement.amount;
    }
  });

  return friends.map(friend => ({
    ...friend,
    balance: balances[friend.id] || 0,
  }));
}

export function getTotalBalance(friends: Friend[]): number {
  return friends.reduce((sum, friend) => sum + friend.balance, 0);
}
