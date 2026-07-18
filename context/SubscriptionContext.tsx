import React, { createContext, useState, useContext, ReactNode } from 'react';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';

interface SubscriptionContextType {
  subscriptions: Subscription[];
  addSubscription: (newSubscription: Subscription) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = (newSubscription: Subscription) => {
    setSubscriptions((prev) => [newSubscription, ...prev]);
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
}
