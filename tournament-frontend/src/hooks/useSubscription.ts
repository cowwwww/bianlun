import { useState, useEffect } from 'react';
import { auth } from '../services/authService';
import api from '../services/api';

export type SubscriptionType = 'free' | 'monthly' | 'lifetime';

export interface SubscriptionInfo {
  type: SubscriptionType;
  status: 'active' | 'expired' | 'cancelled';
  expiresAt?: string;
  aiUsageCount: number;
  aiUsageLimit: number;
  hasUploadAccess?: boolean;
  freeDownloadTokens?: number;
}

export interface SubscriptionAccess {
  canAccessSolutions: boolean;
  canAccessFullResources: boolean;
  canAccessJudgeContact: boolean;
  canUseAI: boolean;
  aiUsageRemaining: number;
  hasUploadAccess?: boolean;
  freeDownloadTokens?: number;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const currentUser = auth.getCurrentUser();

      if (!currentUser) {
        setSubscription(null);
        return;
      }

      // For now, use default free subscription since subscriptions API is not implemented
      // TODO: Implement subscriptions collection and API endpoints
      setSubscription({
        type: 'free',
        status: 'active',
        aiUsageCount: 0,
        aiUsageLimit: 5,
        hasUploadAccess: false,
        freeDownloadTokens: 0,
      });
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription information');
      // Set default free subscription on error
      setSubscription({
        type: 'free',
        status: 'active',
        aiUsageCount: 0,
        aiUsageLimit: 5,
        hasUploadAccess: false,
        freeDownloadTokens: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getAiUsageLimit = (type: SubscriptionType): number => {
    switch (type) {
      case 'lifetime': return 200;
      case 'monthly': return 50;
      default: return 5;
    }
  };

  const getAccess = (): SubscriptionAccess => {
    if (!subscription) {
      return {
        canAccessSolutions: false,
        canAccessFullResources: false,
        canAccessJudgeContact: false,
        canUseAI: false,
        aiUsageRemaining: 0,
        hasUploadAccess: false,
        freeDownloadTokens: 0,
      };
    }

    const hasActiveSubscription = subscription.type !== 'free' && subscription.status === 'active';
    const isLifetimeMember = subscription.type === 'lifetime' && subscription.status === 'active';
    const aiUsageRemaining = subscription.aiUsageLimit - subscription.aiUsageCount;
    const hasFreeTokens = (subscription.freeDownloadTokens || 0) > 0;

    const canAccessResources = hasActiveSubscription || hasFreeTokens || subscription.hasUploadAccess;

    return {
      canAccessSolutions: hasActiveSubscription,
      canAccessFullResources: canAccessResources,
      canAccessJudgeContact: isLifetimeMember,
      canUseAI: aiUsageRemaining > 0,
      aiUsageRemaining,
      hasUploadAccess: subscription.hasUploadAccess,
      freeDownloadTokens: subscription.freeDownloadTokens || 0,
    };
  };

  const useFreeDownloadToken = async () => {
    if (!subscription || !auth.getCurrentUser() || (subscription.freeDownloadTokens || 0) <= 0) return false;

    // TODO: Implement when subscriptions API is available
    // For now, just update local state
    setSubscription(prev => prev ? {
      ...prev,
      freeDownloadTokens: Math.max(0, (prev.freeDownloadTokens || 0) - 1)
    } : null);

    return true;
  };

  const incrementAiUsage = async () => {
    if (!subscription || !auth.getCurrentUser()) return false;

    // TODO: Implement when subscriptions API is available
    // For now, just update local state
    setSubscription(prev => prev ? {
      ...prev,
      aiUsageCount: prev.aiUsageCount + 1
    } : null);
    return true;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadSubscription();
      } else {
        setSubscription(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    subscription,
    loading,
    error,
    access: getAccess(),
    reload: loadSubscription,
    incrementAiUsage,
    useFreeDownloadToken,
  };
};
