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
      name: model.name || model.username || '',
      wechatId: model.wechat_id,
    };
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.getCurrentUser());

    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    const user = this.getCurrentUser();
    this.listeners.forEach(listener => listener(user));
  }

  async signIn(identity: string, password: string): Promise<User> {
    try {
      // Use PocketBase's built-in auth (supports username or email)
      const authData = await pb.collection('users').authWithPassword(identity, password);

      return {
        id: authData.record.id,
        name: authData.record.name || authData.record.username || '',
        wechatId: authData.record.wechat_id,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('用户名或密码错误');
    }
  }

  async signUp(username: string, password: string, fullName: string): Promise<User> {
    try {
      // Use PocketBase's proper user creation (password is hashed automatically)
      await pb.collection('users').create({
        username: username,
        password: password,
        passwordConfirm: password,
        name: fullName,
      });

      // Auto sign in after signup
      return await this.signIn(username, password);
    } catch (error) {
      console.error('Sign up error:', error);

      const pbError = error as { response?: { data?: Record<string, unknown> }; message?: string };
      if (pbError.response?.data) {
        const errorData = pbError.response.data;

        if (errorData.username) {
          throw new Error('该用户名已被注册');
        }
        if (errorData.password) {
          throw new Error('密码不符合要求（至少8位字符）');
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
      if (!currentUser?.id) {
        throw new Error('No user logged in');
      }

      await pb.collection('users').update(currentUser.id, {
        name: updates.name,
      });

      this.notifyListeners();
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }
}

export const auth = new AuthService();
export default auth;
