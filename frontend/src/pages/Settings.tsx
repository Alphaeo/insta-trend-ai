import { useEffect, useState } from "react";
import { User, Bell, Shield, CreditCard, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/contexts/I18nContext";
import api from "@/lib/api";

export default function Settings() {
  const { t } = useTranslation('settings');
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);

  const loadProfile = async () => {
    try {
      const res = await api.get("/user/me");
      setProfile(res.data);
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const tabs = [
    { id: "profile", label: 'Profile', icon: User },
    { id: "notifications", label: 'Notifications', icon: Bell },
    { id: "privacy", label: 'Security', icon: Shield },
    { id: "billing", label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Manage your account preferences and application settings
        </p>
      </div>

      {/* Settings Layout */}
      <div className="grid lg:grid-cols-[350px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-left transition-all ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-3xl p-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-card p-6 rounded-lg shadow">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{t('profile.title')}</h2>
                  <p className="text-muted-foreground">
                    {t('profile.description')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('profile.name')}</Label>
                    <Input 
                      id="name" 
                      value={profile?.full_name || ""} 
                      onChange={(e) => setProfile((p: any) => ({ ...p, full_name: e.target.value }))}
                      className="rounded-2xl border-border h-14"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profile?.email || ""} 
                      disabled
                      className="rounded-2xl border-border h-14"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">{t('profile.bio')}</Label>
                    <Textarea
                      id="bio"
                      value={profile?.bio || ""}
                      onChange={(e) => setProfile((p: any) => ({ ...p, bio: e.target.value }))}
                      className="rounded-2xl border-border min-h-[120px]"
                      placeholder={t('profile.bioPlaceholder', 'Tell us a little bit about yourself')}
                    />
                  </div>
                </div>
              </div>



              <div className="pt-6">
                <Button
                  disabled={saving}
                  onClick={async () => {
                    if (!profile) return;
                    setSaving(true);
                    try {
                      await api.put("/user/me", {
                        full_name: profile.full_name,
                        bio: profile.bio,
                        timezone: profile.timezone,
                        language: profile.language,
                      });
                      // Afficher un message de succès
                      alert(t('profile.saved'));
                    } catch (e) {
                      console.error("Failed to save profile", e);
                      alert(t('profile.error', 'Failed to save settings'));
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 px-8 py-6 text-lg rounded-full w-full md:w-auto"
                >
                  {saving ? t('saving', 'Saving...') : `💾 ${t('profile.save')}`}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t('notifications.title')}
                </h2>
                <p className="text-muted-foreground">
                  {t('notifications.description')}
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage email notifications for your account
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {profile?.email || 'No email set'}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setProfile((p: any) => ({
                          ...p,
                          notifications: {
                            ...p.notifications,
                            email: !p.notifications?.email
                          }
                        }))}
                      >
                        {profile?.notifications?.email ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  disabled={saving}
                  onClick={async () => {
                    if (!profile) return;
                    setSaving(true);
                    try {
                      await api.put("/user/me/notifications", {
                        email: profile.notifications?.email || false,
                        push: profile.notifications?.push || false,
                        newsletter: profile.notifications?.newsletter || false,
                      });
                      alert(t('notifications.saved', 'Notification preferences saved successfully'));
                    } catch (e) {
                      console.error("Failed to save notification preferences", e);
                      alert(t('notifications.error', 'Failed to save notification preferences'));
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 px-6 py-3 rounded-full"
                >
                  {saving ? t('saving', 'Saving...') : t('notifications.save')}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t('privacy.title')}
                </h2>
                <p className="text-muted-foreground">
                  {t('privacy.description')}
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{t('privacy.twoFactor')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('privacy.twoFactorDescription', 'Add an extra layer of security to your account')}
                      </p>
                    </div>
                    <Button variant="outline">
                      {profile?.twoFactorEnabled ? t('common.disable') : t('common.enable')}
                    </Button>
                  </div>
                </div>

                <div className="p-6 border rounded-lg">
                  <h3 className="font-medium mb-4">Change Password</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
                    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
                    
                    if (newPassword !== confirmPassword) {
                      alert('New passwords do not match');
                      return;
                    }

                    try {
                      setSaving(true);
                      await api.post('/user/change-password', {
                        current_password: currentPassword,
                        new_password: newPassword
                      });
                      alert('Password updated successfully');
                      form.reset();
                    } catch (error) {
                      console.error('Error updating password:', error);
                      alert('Failed to update password. Please try again.');
                    } finally {
                      setSaving(false);
                    }
                  }}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          name="currentPassword"
                          type="password" 
                          required
                          className="rounded-2xl border-border h-14"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          name="newPassword"
                          type="password" 
                          required
                          minLength={8}
                          className="rounded-2xl border-border h-14"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          name="confirmPassword"
                          type="password" 
                          required
                          className="rounded-2xl border-border h-14"
                        />
                      </div>
                      <div className="pt-2">
                        <Button 
                          type="submit"
                          disabled={saving}
                          className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 px-6 py-3 rounded-full"
                        >
                          {saving ? 'Updating...' : 'Update Password'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="p-6 border border-destructive/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-destructive">{t('privacy.dangerZone')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('privacy.dangerZoneDescription', 'These actions are irreversible')}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                      {t('privacy.deleteAccount')}
                    </Button>
                    <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                      {t('privacy.exportData')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}



          {activeTab === "billing" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Subscription Plans
                </h2>
                <p className="text-muted-foreground">
                  Choose the plan that works best for you
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <div className={`p-6 border rounded-2xl ${
                  profile?.plan === 'free' ? 'ring-2 ring-primary' : ''
                }`}>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold">Free</h3>
                      <p className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Basic features
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Limited access
                      </li>
                    </ul>
                    <Button 
                      variant={profile?.plan === 'free' ? 'default' : 'outline'} 
                      className="w-full mt-4"
                      disabled={profile?.plan === 'free'}
                    >
                      {profile?.plan === 'free' ? 'Current Plan' : 'Select Free'}
                    </Button>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className={`p-6 border-2 border-primary rounded-2xl bg-primary/5 ${
                  profile?.plan === 'pro' ? 'ring-2 ring-primary' : ''
                }`}>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Pro</h3>
                        <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">Popular</span>
                      </div>
                      <p className="text-3xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        All Free features
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Advanced analytics
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Priority support
                      </li>
                    </ul>
                    <Button 
                      variant={profile?.plan === 'pro' ? 'default' : 'default'} 
                      className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      onClick={async () => {
                        try {
                          await api.post('/billing/upgrade', { plan: 'pro' });
                          alert('Our team will contact you shortly to complete your subscription.');
                        } catch (error) {
                          console.error('Error upgrading plan:', error);
                          alert('Failed to upgrade. Please try again.');
                        }
                      }}
                      disabled={profile?.plan === 'pro'}
                    >
                      {profile?.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                    </Button>
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className={`p-6 border rounded-2xl ${
                  profile?.plan === 'enterprise' ? 'ring-2 ring-primary' : ''
                }`}>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold">Enterprise</h3>
                      <p className="text-3xl font-bold">Custom</p>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        All Pro features
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Custom solutions
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Dedicated support
                      </li>
                    </ul>
                    <Button 
                      variant={profile?.plan === 'enterprise' ? 'default' : 'outline'} 
                      className="w-full mt-4"
                      onClick={async () => {
                        try {
                          await api.post('/billing/contact', { plan: 'enterprise' });
                          alert('Our sales team will contact you shortly to discuss enterprise options.');
                        } catch (error) {
                          console.error('Error contacting sales:', error);
                          alert('Failed to send request. Please try again.');
                        }
                      }}
                      disabled={profile?.plan === 'enterprise'}
                    >
                      {profile?.plan === 'enterprise' ? 'Current Plan' : 'Contact Sales'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6 border rounded-2xl bg-muted/20">
                <h3 className="font-medium mb-2">Need help choosing a plan?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our team is here to help you find the perfect solution for your needs.
                </p>
                <Button variant="outline" className="w-full sm:w-auto">
                  Contact Support
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
