export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'RIDER';
  walletBalance: string;
  avatar?: string;
  rating: number;
  ratingsCount?: number;
  isVerified: boolean;
}

class AuthStore {
  private token: string | null = null;
  private user: UserProfile | null = null;
  private listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (err) {
        console.error('Error in AuthStore subscriber:', err);
      }
    });
  }

  setSession(token: string, user: UserProfile) {
    this.token = token;
    this.user = user;
    console.log(`🔑 [AuthStore] Session successfully started for user: ${user.name} (${user.role})`);
    this.notify();
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): UserProfile | null {
    return this.user;
  }

  updateUser(updatedUser: Partial<UserProfile>) {
    if (this.user) {
      this.user = { ...this.user, ...updatedUser };
      console.log(`👤 [AuthStore] User profile updated locally.`);
      this.notify();
    }
  }

  clearSession() {
    this.token = null;
    this.user = null;
    console.log('🔑 [AuthStore] Session cleared/logged out.');
    this.notify();
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

export const authStore = new AuthStore();
