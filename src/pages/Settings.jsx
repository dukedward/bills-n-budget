import EmailAlertSettings from "@/components/alerts/EmailAlertSettings";

export default function Settings() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your preferences and notifications
        </p>
      </div>

      <EmailAlertSettings />
    </div>
  );
}
