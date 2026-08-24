import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MobileAppRole, AppNotification } from '../types';
import { api } from '../services/api';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller';
  phone: string;
  location?: string;
  sellerId?: string;
}

interface AuthContextType {
  role: MobileAppRole;
  setRole: (r: MobileAppRole) => void;
  currentUser: AuthUser;
  sellerWalletBalance: number;
  notifications: AppNotification[];
  unreadCount: number;
  refreshWallet: () => void;
  refreshNotifications: () => void;
  markNotificationsRead: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<MobileAppRole>('customer');
  const [sellerWalletBalance, setSellerWalletBalance] = useState(1240);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const customerUser: AuthUser = {
    id: 'USR-001',
    name: 'Aryan Mehta',
    email: 'aryan@besteal.com',
    role: 'customer',
    phone: '+91 98765 43210',
    location: 'Koramangala, Bengaluru',
  };

  const sellerUser: AuthUser = {
    id: 'USR-002',
    name: 'Rajan Electronics',
    email: 'seller@rajan.com',
    role: 'seller',
    phone: '+91 98111 22233',
    location: 'Bengaluru',
    sellerId: 'SEL-001',
  };

  const currentUser = role === 'seller' ? sellerUser : customerUser;

  const refreshWallet = () => {
    api.getSellerWallet('SEL-001').then((data) => {
      setSellerWalletBalance(data.balance);
    }).catch(() => {});
  };

  const refreshNotifications = () => {
    api.getNotifications(currentUser.id).then((data) => {
      setNotifications(data);
    }).catch(() => {});
  };

  const markNotificationsRead = () => {
    api.markNotificationsRead().then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }).catch(() => {});
  };

  useEffect(() => {
    refreshWallet();
    refreshNotifications();
  }, [role]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        sellerWalletBalance,
        notifications,
        unreadCount,
        refreshWallet,
        refreshNotifications,
        markNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
