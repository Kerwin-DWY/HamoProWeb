import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

export default function AuthCallback() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        Signing you in…
      </div>
    );
  }

  if (auth.error) {
    return <div>Error: {auth.error.message}</div>;
  }

  // AUTH COMPLETE → GO TO MAIN APP
  return <Navigate to="/" replace />;
}
