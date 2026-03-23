import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const { user, isLoadingAuth, loginWithGoogle } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/Dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            <span className="text-primary">Bills-n-</span>Budget
          </h1>
          <p className="text-muted-foreground">
            Sign in with Google to access your budget dashboard
          </p>
        </div>

        <Button className="w-full" onClick={loginWithGoogle}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
