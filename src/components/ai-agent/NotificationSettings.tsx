import { useState, useEffect } from 'react';
import { Bell, Check, MessageSquare, Globe, ExternalLink } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { notificationService } from '@/lib/supabase-notifications';
import type { UserSubscription } from '@/types/ai-agent';

export function NotificationSettings() {
  const { publicKey } = useWallet();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [settings, setSettings] = useState({
    browserPush: false,
    telegram: false,
    alertTypes: {
      dust_tokens: true,
      scam_warnings: true,
      weekly_summary: false
    }
  });

  // Load existing subscription
  useEffect(() => {
    if (!publicKey) return;
    
    const loadSubscription = async () => {
      const sub = await notificationService.getSubscription(publicKey.toBase58());
      if (sub) {
        setSubscription(sub);
        setSettings({
          browserPush: false,
          telegram: !!sub.telegramUserId,
          alertTypes: sub.alertTypes
        });
      }
    };

    loadSubscription();
  }, [publicKey]);

  const handleToggle = (key: 'browserPush' | 'telegram') => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAlertTypeToggle = (type: keyof typeof settings.alertTypes) => {
    setSettings(prev => ({
      ...prev,
      alertTypes: {
        ...prev.alertTypes,
        [type]: !prev.alertTypes[type]
      }
    }));
  };

  const handleLinkTelegram = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!telegramId || telegramId.length < 5) {
      toast.error('Please enter a valid Telegram User ID');
      return;
    }

    setIsLoading(true);

    try {
      await notificationService.subscribeUser({
        walletAddress: publicKey.toBase58(),
        telegramUserId: telegramId,
        tier: 'free'
      });

      toast.success('Telegram linked successfully!');
      
      // Reload subscription
      const sub = await notificationService.getSubscription(publicKey.toBase58());
      setSubscription(sub);
      setTelegramId('');
      setSettings(prev => ({ ...prev, telegram: true }));
    } catch (error) {
      console.error('Link Telegram error:', error);
      toast.error('Failed to link Telegram');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);

    try {
      // Subscribe user if not already
      if (!subscription) {
        await notificationService.subscribeUser({
          walletAddress: publicKey.toBase58(),
          tier: 'free'
        });
      }

      // Update alert settings
      const success = await notificationService.updateAlertSettings(
        publicKey.toBase58(),
        settings.alertTypes
      );

      if (success) {
        toast.success('Notification preferences saved!');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const getTelegramBotLink = () => {
    const botUsername = import.meta.env.VITE_TELEGRAM_ALERT_BOT_USERNAME || 'ArsweepAlertBot';
    return `https://t.me/${botUsername}`;
  };

  if (!publicKey) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-sm">Enable Smart Alerts</h3>
            <p className="text-xs text-muted-foreground">Get notified about important events</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Please connect your wallet to enable notifications
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-600/20 rounded-lg">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
          <Bell className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base">Enable Smart Alerts</h3>
          <p className="text-xs text-muted-foreground">Get notified about important events</p>
        </div>
      </div>

      {/* Notification Methods */}
      <div className="space-y-3">
        {/* Browser Push */}
        <div className="p-3.5 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="browser-push" className="font-medium text-sm cursor-pointer">
                Browser notifications
              </Label>
            </div>
            <Switch
              id="browser-push"
              checked={settings.browserPush}
              onCheckedChange={() => handleToggle('browserPush')}
            />
          </div>
          <p className="text-xs text-muted-foreground ml-6.5">
            Get instant alerts in your browser (Coming soon)
          </p>
        </div>

        {/* Telegram */}
        <div className="p-3.5 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="telegram" className="font-medium text-sm cursor-pointer">
                Telegram alerts
              </Label>
            </div>
            <Switch
              id="telegram"
              checked={settings.telegram}
              onCheckedChange={() => handleToggle('telegram')}
              disabled={!subscription?.telegramUserId}
            />
          </div>
          
          {subscription?.telegramUserId ? (
            <p className="text-xs text-green-600 ml-6.5 font-medium">
              ✅ Connected: {subscription.telegramUsername ? `@${subscription.telegramUsername}` : subscription.telegramUserId}
            </p>
          ) : (
            <div className="ml-6.5 space-y-2 mt-2">
              <p className="text-xs text-muted-foreground">
                1. Open bot: <a 
                  href={getTelegramBotLink()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline inline-flex items-center gap-1"
                >
                  {import.meta.env.VITE_TELEGRAM_ALERT_BOT_USERNAME || 'ArsweepAlertBot'}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                2. Send <code className="bg-muted px-1 rounded">/start</code> to get your ID
              </p>
              <p className="text-xs text-muted-foreground">
                3. Copy your Telegram ID and paste below:
              </p>
              <div className="flex gap-2 mt-2">
                <Input
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  placeholder="Your Telegram ID (e.g., 7828594154)"
                  className="text-xs h-8"
                />
                <Button
                  onClick={handleLinkTelegram}
                  disabled={isLoading || !telegramId}
                  size="sm"
                  className="h-8 text-xs"
                >
                  Link
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Types */}
      <div className="space-y-2 pt-2 border-t">
        <p className="text-xs font-medium text-muted-foreground px-1">Alert types</p>
        
        <label className="flex items-center gap-2.5 p-2.5 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            checked={settings.alertTypes.dust_tokens}
            onChange={() => handleAlertTypeToggle('dust_tokens')}
            className="h-4 w-4 rounded"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">New dust tokens detected</p>
            <p className="text-xs text-muted-foreground">When new tokens appear in your wallet</p>
          </div>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            checked={settings.alertTypes.scam_warnings}
            onChange={() => handleAlertTypeToggle('scam_warnings')}
            className="h-4 w-4 rounded"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">Scam token warnings</p>
            <p className="text-xs text-muted-foreground">High-priority security alerts</p>
          </div>
        </label>

        <label className="flex items-center gap-2.5 p-2.5 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            checked={settings.alertTypes.weekly_summary}
            onChange={() => handleAlertTypeToggle('weekly_summary')}
            className="h-4 w-4 rounded"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">Weekly summary</p>
            <p className="text-xs text-muted-foreground">Recap of swept tokens and savings</p>
          </div>
        </label>
      </div>

      {/* Tier Badge */}
      {subscription && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-blue-500" />
            <p className="text-sm">
              <span className="font-medium">Current tier: </span>
              <span className="text-blue-500 capitalize">{subscription.tier}</span>
            </p>
          </div>
          {subscription.tier === 'free' && (
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Hold $ARSWP tokens to unlock Premium features (coming soon)
            </p>
          )}
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {isLoading ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}
