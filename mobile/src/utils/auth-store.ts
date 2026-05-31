export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'RIDER';
  walletBalance: string;
  avatar?: string;
  rating: number;
  isVerified: boolean;
}

class AuthStore {
  private token: string | null = null;
  private user: UserProfile | null = null;

  setSession(token: string, user: UserProfile) {
    this.token = token;
    this.user = user;
    console.log(`🔑 [AuthStore] Session successfully started for user: ${user.name} (${user.role})`);
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
    }
  }

  clearSession() {
    this.token = null;
    this.user = null;
    console.log('🔑 [AuthStore] Session cleared/logged out.');
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

export const authStore = new AuthStore();
