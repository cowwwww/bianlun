import pb from './pocketbase';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  name?: string;
  avatar?: string;
  subscriptionType?: 'free' | 'monthly' | 'lifetime';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  private listeners: Array<(user: User | null) => void> = [];

  constructor() {
    // Listen to auth state changes
    pb.authStore.onChange(() => {
      this.notifyListeners();
    });
  }

  getCurrentUser(): User | null {
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return null;
    }

    const model = pb.authStore.model;
    return {
      id: model.id,
      email: model.email,
      displayName: model.name || model.username || model.email,
      name: model.name,
      avatar: model.avatar,
      subscriptionType: model.subscriptionType || 'free'
    };
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.getCurrentUser());
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    const user = this.getCurrentUser();
    this.listeners.forEach(listener => listener(user));
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      return {
        id: authData.record.id,
        email: authData.record.email,
        displayName: authData.record.name || authData.record.username || authData.record.email,
        name: authData.record.name,
        avatar: authData.record.avatar,
        subscriptionType: authData.record.subscriptionType || 'free'
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    try {
      // Create user
      const user = await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name: displayName || email.split('@')[0],
        subscriptionType: 'free'
      });

      // Auto sign in after signup
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      return {
        id: authData.record.id,
        email: authData.record.email,
        displayName: authData.record.name || authData.record.username || authData.record.email,
        name: authData.record.name,
        avatar: authData.record.avatar,
        subscriptionType: authData.record.subscriptionType || 'free'
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  }

  async signOut(): Promise<void> {
    pb.authStore.clear();
  }

  async updateProfile(updates: Partial<User>): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      await pb.collection('users').update(currentUser.id, {
        name: updates.displayName || updates.name,
        ...updates
      });

      this.notifyListeners();
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await pb.collection('users').requestPasswordReset(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

// Export singleton instance
export const auth = new AuthService();
export default auth;
