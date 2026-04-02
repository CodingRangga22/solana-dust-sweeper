import { supabase } from './supabase';
import type { UserSubscription } from '@/types/ai-agent';

export class NotificationService {
  
  async subscribeUser(data: {
    walletAddress: string;
    telegramUserId?: string;
    telegramUsername?: string;
    tier?: 'free' | 'premium';
  }): Promise<UserSubscription | null> {
    try {
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .upsert({
          wallet_address: data.walletAddress,
          telegram_user_id: data.telegramUserId,
          telegram_username: data.telegramUsername,
          tier: data.tier || 'free',
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wallet_address'
        })
        .select()
        .single();

      if (error) throw error;
      
      return this.mapToUserSubscription(subscription);
    } catch (error) {
      console.error('Subscribe user error:', error);
      return null;
    }
  }

  async getSubscription(walletAddress: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (error) throw error;
      
      return this.mapToUserSubscription(data);
    } catch (error) {
      console.error('Get subscription error:', error);
      return null;
    }
  }

  async updateAlertSettings(
    walletAddress: string,
    alertTypes: {
      dust_tokens?: boolean;
      scam_warnings?: boolean;
      weekly_summary?: boolean;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          alert_types: alertTypes,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Update alert settings error:', error);
      return false;
    }
  }

  async logNotification(data: {
    walletAddress: string;
    notificationType: string;
    message: string;
    deliveryMethod: 'telegram' | 'browser_push' | 'both';
    metadata?: any;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_logs')
        .insert({
          wallet_address: data.walletAddress,
          notification_type: data.notificationType,
          message: data.message,
          delivery_method: data.deliveryMethod,
          metadata: data.metadata,
          status: 'sent'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Log notification error:', error);
      return false;
    }
  }

  private mapToUserSubscription(data: any): UserSubscription {
    return {
      id: data.id,
      walletAddress: data.wallet_address,
      telegramUserId: data.telegram_user_id,
      telegramUsername: data.telegram_username,
      tier: data.tier,
      alertTypes: data.alert_types,
      isActive: data.is_active
    };
  }
}

export const notificationService = new NotificationService();
