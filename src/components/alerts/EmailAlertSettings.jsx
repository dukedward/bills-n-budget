import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAlertSettings, saveAlertSettings } from "@/api/alerts";

const DEFAULT_ALERT_SETTINGS = {
  email_alerts_enabled: false,
  alert_email: "",
  sms_alerts_enabled: false,
  alert_phone: "",
  days_before_due: 3,
  overdue_alerts: true,
};

export default function EmailAlertSettings() {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();

  const { data: settings = DEFAULT_ALERT_SETTINGS, isLoading } = useQuery({
    queryKey: ["alertSettings", user?.uid],
    queryFn: () => getAlertSettings(user.uid, user.email || ""),
    enabled: !!user?.uid,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      await saveAlertSettings(user.uid, newSettings, {
        email: user.email || "",
        displayName: user.displayName || "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertSettings", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["user", user?.uid] });
      toast.success("Alert settings saved");
    },
    onError: () => {
      toast.error("Failed to save alert settings");
    },
  });

  //   const sendTestEmail = async () => {
  //     setIsSending(true);
  //     try {
  //       await base44.integrations.Core.SendEmail({
  //         to: settings.alert_email || user.email,
  //         subject: "Bill-N-Budget - Test Alert Email",
  //         body: `
  //           <h2>Test Email Alert</h2>
  //           <p>This is a test email from Bill-N-Budget to confirm your email alerts are working correctly.</p>
  //           <p>You will receive alerts for:</p>
  //           <ul>
  //             <li>Bills due in ${settings.days_before_due || 3} days</li>
  //             <li>Overdue unpaid bills ${settings.overdue_alerts ? "(enabled)" : "(disabled)"}</li>
  //           </ul>
  //           <p>Thank you for using Bill-N-Budget!</p>
  //         `,
  //       });
  //       toast.success("Test email sent! Check your inbox.");
  //     } catch (error) {
  //       toast.error("Failed to send test email");
  //     } finally {
  //       setIsSending(false);
  //     }
  //   };

  //   const sendTestSMS = async () => {
  //     if (!settings.alert_phone) {
  //       toast.error("Please enter a phone number first");
  //       return;
  //     }
  //     setIsSending(true);
  //     try {
  //       const message = `Bills-N-Budget Test Alert: This is a test SMS to confirm your text alerts are working. You'll receive alerts ${settings.days_before_due || 3} days before bills are due${settings.overdue_alerts ? " and for overdue bills" : ""}.`;

  //       await base44.integrations.Core.InvokeLLM({
  //         prompt: `Send an SMS to ${settings.alert_phone} with this message: "${message}". This is a test notification from a budget tracking app.`,
  //       });

  //       toast.success("Test SMS sent! Check your phone.");
  //     } catch (error) {
  //       toast.error("Failed to send test SMS");
  //     } finally {
  //       setIsSending(false);
  //     }
  //   };

  const handleToggle = (field, value) => {
    updateSettingsMutation.mutate({ ...settings, [field]: value });
  };

  const handleUpdate = (field, value) => {
    updateSettingsMutation.mutate({ ...settings, [field]: value });
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <CardTitle>Email Alerts</CardTitle>
          </div>
          <CardDescription>
            Get notified about upcoming and overdue bills via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for your bills
              </p>
            </div>
            <Switch
              checked={settings.email_alerts_enabled}
              onCheckedChange={(checked) =>
                handleToggle("email_alerts_enabled", checked)
              }
            />
          </div>

          {settings.email_alerts_enabled && (
            <>
              <div className="space-y-2">
                <Label>Alert Email Address</Label>
                <Input
                  type="email"
                  value={settings.alert_email || user?.email || ""}
                  onChange={(e) => handleUpdate("alert_email", e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <Button
                variant="outline"
                onClick={sendTestEmail}
                disabled={isSending}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isSending ? "Sending..." : "Send Test Email"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle>SMS Text Alerts</CardTitle>
          </div>
          <CardDescription>
            Get notified about upcoming and overdue bills via text message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable SMS Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive text message notifications for your bills
              </p>
            </div>
            <Switch
              checked={settings.sms_alerts_enabled}
              onCheckedChange={(checked) =>
                handleToggle("sms_alerts_enabled", checked)
              }
            />
          </div>

          {settings.sms_alerts_enabled && (
            <>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={settings.alert_phone || ""}
                  onChange={(e) => handleUpdate("alert_phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <Button
                variant="outline"
                onClick={sendTestSMS}
                disabled={isSending}
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {isSending ? "Sending..." : "Send Test SMS"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle>Alert Preferences</CardTitle>
          </div>
          <CardDescription>
            Configure when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Days Before Due Date</Label>
            <Input
              type="number"
              min="1"
              max="30"
              value={settings.days_before_due || 3}
              onChange={(e) =>
                handleUpdate("days_before_due", parseInt(e.target.value))
              }
            />
            <p className="text-xs text-muted-foreground">
              Get notified this many days before a bill is due
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Overdue Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get alerts for unpaid overdue bills
              </p>
            </div>
            <Switch
              checked={settings.overdue_alerts}
              onCheckedChange={(checked) =>
                handleToggle("overdue_alerts", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
