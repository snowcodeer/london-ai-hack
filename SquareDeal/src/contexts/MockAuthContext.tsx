import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserType = 'customer' | 'business';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
}

export interface MockOrganization {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Mock profiles
export const MOCK_CUSTOMER: MockUser = {
  id: 'customer_123',
  name: 'John Smith',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  type: 'customer',
};

export const MOCK_BUSINESS_USER: MockUser = {
  id: 'business_user_456',
  name: 'Sarah Mitchell',
  email: 'sarah@shoreditchplumbing.co.uk',
  phone: '+44 20 7123 4567',
  type: 'business',
};

export const MOCK_ORGANIZATION: MockOrganization = {
  id: 'org_shoreditch_plumbing',
  name: 'Shoreditch Plumbing Services',
  email: 'info@shoreditchplumbing.co.uk',
  phone: '+44 20 7123 4567',
};

interface MockAuthContextType {
  user: MockUser | null;
  organization: MockOrganization | null;
  userType: UserType | null;
  switchToCustomer: () => void;
  switchToBusiness: () => void;
  signOut: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [organization, setOrganization] = useState<MockOrganization | null>(null);

  const switchToCustomer = () => {
    setUser(MOCK_CUSTOMER);
    setOrganization(null);
  };

  const switchToBusiness = () => {
    setUser(MOCK_BUSINESS_USER);
    setOrganization(MOCK_ORGANIZATION);
  };

  const signOut = () => {
    setUser(null);
    setOrganization(null);
  };

  const userType: UserType | null = organization ? 'business' : user ? 'customer' : null;

  return (
    <MockAuthContext.Provider
      value={{
        user,
        organization,
        userType,
        switchToCustomer,
        switchToBusiness,
        signOut,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within MockAuthProvider');
  }
  return context;
}

// Hooks that mimic Clerk API
export function useUser() {
  const { user } = useMockAuth();
  return { user, isLoaded: true };
}

export function useOrganization() {
  const { organization } = useMockAuth();
  return { organization, isLoaded: true };
}
