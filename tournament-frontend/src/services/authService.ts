import pb from './pocketbase';

export interface User {
  id: string;
  name?: string;
  wechatId?: string;
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
    // Check if we have a stored model (not using isValid since we use dummy token)
    if (!pb.authStore.model) {
      return null;
    }

    const model = pb.authStore.model;
    return {
      id: model.wechat_id || model.id,
      name: model.full_name,
      wechatId: model.wechat_id,
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

  async signIn(name: string, password: string): Promise<User> {
    try {
      // Simple database check - find user by full_name and verify password
      const records = await pb.collection('users').getList(1, 1, {
        filter: `full_name = "${name}" && password = "${password}"`
      });
      
      if (records.items.length === 0) {
        throw new Error('Invalid credentials');
      }
      
      const user = records.items[0];
      
      // Store user info in authStore manually
      pb.authStore.save('dummy-token', user);
      
      return {
        id: user.id,
        name: user.full_name,
        wechatId: user.wechat_id,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error((error as Error).message || 'Failed to sign in');
    }
  }

  async signUp(name: string, password: string, fullName: string): Promise<User> {
    try {
      // Simple create - just store the data directly
      await pb.collection('users').create({
        full_name: fullName,
        password: password
      });

      // Auto sign in after signup
      return await this.signIn(fullName, password);
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Parse PocketBase error response
      const pbError = error as { response?: { data?: { full_name?: unknown; password?: unknown } }; message?: string };
      if (pbError.response && pbError.response.data) {
        const errorData = pbError.response.data;
        
        // Check for duplicate name
        if (errorData.full_name) {
          throw new Error('该姓名已被注册');
        }
        
        // Check for password validation errors
        if (errorData.password) {
          throw new Error('密码不符合要求（至少6位字符）');
        }
      }
      
      throw new Error(pbError.message || '注册失败，请稍后重试');
    }
  }

  async signOut(): Promise<void> {
    pb.authStore.clear();
  }

  async updateProfile(updates: Partial<User>): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('No user logged in');
      }

      // Find user record by id
      const records = await pb.collection('users').getList(1, 1, {
        filter: `id = "${currentUser.id}"`
      });
      
      if (records.items.length > 0) {
        await pb.collection('users').update(records.items[0].id, {
          full_name: updates.name,
        });
      }

      this.notifyListeners();
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }
}

// Export singleton instance
export const auth = new AuthService();
export default auth;
