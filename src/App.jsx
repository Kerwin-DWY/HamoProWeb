import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import { useUser } from "./context/UserContext";
import { getAppMode } from "./utils/appMode";
import { initUserProfile } from "./api/userApi";
import { fetchAvatars } from "./api/avatarsApi";
import Header from "./Header";
import DashboardNav from "./DashBoard/DashboardNav";
import AiAvatarsSection from "./DashBoard/AiAvatarsSection";
import ClientSection from "./DashBoard/ClientSection";
import LoginPage from "./auth/LoginPage";
import { Navigate } from "react-router-dom";

export default function App() {
  const auth = useAuth();
  const { profile, setProfile } = useUser();
  const [avatars, setAvatars] = useState([]);
  const mode = getAppMode(); // "pro" | "app"
  const host = window.location.hostname;

  // -----------------------------
  // Initialize active tab by role
  // -----------------------------
  const [activeTab, setActiveTab] = useState(() => {
    if (!profile) return null;
    return profile.role === "THERAPIST" ? "avatars" : "clients";
  });

  // -----------------------------
  // Detect role / domain mismatch
  // -----------------------------
  const isRoleMismatch =
      (profile?.role === "THERAPIST" && host.startsWith("app.")) ||
      (profile?.role === "CLIENT" && host.startsWith("pro."));

  // -----------------------------
  // Initialize user profile
  // -----------------------------
  useEffect(() => {
    if (!auth.user?.access_token) return;
    if (profile) return;

    initUserProfile({
      token: auth.user.access_token,
      mode,
    })
        .then(setProfile)
        .catch(console.error);
  }, [auth.user, profile, mode]);

  // -----------------------------
  // Fetch avatars (therapist data)
  // -----------------------------
  useEffect(() => {
    if (!auth.user?.access_token) return;

    fetchAvatars(auth.user.access_token)
        .then(setAvatars)
        .catch(console.error);
  }, [auth.user]);

  // -----------------------------
  // Guards
  // -----------------------------
  //  Auth still restoring from storage
  if (auth.isLoading) {
    return (
        <div className="h-screen flex items-center justify-center text-slate-500">
          Initializing account…
        </div>
    );
  }

// Not authenticated
  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

// Authenticated, waiting for profile
  if (!profile) {
    return (
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          Initializing account…
        </div>
    );
  }


  // -----------------------------
  // Role / Domain mismatch page
  // -----------------------------
  if (isRoleMismatch) {
    return <RoleMismatchPage role={profile.role} />;
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
      <>
        <Header role={profile.role} />

        <main className="pt-[96px] min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
          <div className="flex justify-center px-6">
            <DashboardNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                role={profile.role}
            />
          </div>

          <div className="flex justify-center mt-12 px-6">
            {activeTab === "avatars" && profile.role === "THERAPIST" && (
                <AiAvatarsSection
                    avatars={avatars}
                    setAvatars={setAvatars}
                />
            )}

            {activeTab === "clients" && profile.role === "CLIENT" && (
                <ClientSection avatars={avatars} />
            )}
          </div>
        </main>
      </>
  );
}

// =====================================================
// Role mismatch blocking page
// =====================================================
function RoleMismatchPage({ role }) {
  const targetDomain =
      role === "THERAPIST"
          ? "https://pro.qualemind.com"
          : "https://app.qualemind.com";

  return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Access Restricted
          </h2>

          <p className="text-slate-600 mb-6">
            You are signed in as a{" "}
            <span className="font-medium">{role.toLowerCase()}</span>, but this
            portal is not available for your role.
          </p>

          <a
              href={targetDomain}
              className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition"
          >
            Go to correct portal
          </a>
        </div>
      </div>
  );
}
