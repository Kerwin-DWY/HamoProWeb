import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import { useUser } from "./context/UserContext";
import { getAppMode } from "./utils/appMode";
import { initUserProfile } from "./api/userApi";
import { fetchAvatars } from "./api/lamda/avatarsApi.js";
import Header from "./Header";
import DashboardNav from "./DashBoard/DashboardNav";
import AiAvatarsSection from "./DashBoard/AiAvatarsSection";
import ClientSection from "./DashBoard/ClientSection";
import LoginPage from "./auth/LoginPage";

export default function App() {
  const auth = useAuth();
  const { profile, setProfile } = useUser();
  const [avatars, setAvatars] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const mode = getAppMode(); // "pro" | "app"
  const host = window.location.hostname;

  // =====================================================
  // Derived default tab
  // =====================================================
  const defaultTab =
      profile?.role === "THERAPIST"
          ? "avatars"
          : profile?.role === "CLIENT"
              ? null
              : null;

  const resolvedTab = activeTab ?? defaultTab;

  // =====================================================
  // Role / domain mismatch
  // =====================================================
  const isRoleMismatch =
      (profile?.role === "THERAPIST" && host.startsWith("app.")) ||
      (profile?.role === "CLIENT" && host.startsWith("pro."));

  // =====================================================
  // Initialize profile
  // =====================================================
  useEffect(() => {
    if (!auth.user?.access_token) return;
    if (profile) return;

    initUserProfile({ token: auth.user.access_token, mode })
        .then(setProfile)
        .catch(console.error);
  }, [auth.user, profile, mode, setProfile]);

  // =====================================================
  // Fetch avatars
  // =====================================================
  useEffect(() => {
    if (!auth.user?.access_token) return;

    fetchAvatars(auth.user.access_token)
        .then(setAvatars)
        .catch(console.error);
  }, [auth.user]);

  // =====================================================
  // Guards
  // =====================================================
  if (auth.isLoading) {
    return <CenteredText>Initializing account…</CenteredText>;
  }

  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  if (!profile) {
    return <CenteredText>Initializing account…</CenteredText>;
  }

  if (isRoleMismatch) {
    return <RoleMismatchPage role={profile.role} />;
  }

  // =====================================================
  // UI
  // =====================================================
  return (
      <>
        <Header role={profile.role} />

        <main className="pt-[96px] min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">

          {/* Therapist ONLY */}
          {profile.role === "THERAPIST" && (
              <div className="flex justify-center px-6">
                <DashboardNav
                    activeTab={resolvedTab}
                    setActiveTab={setActiveTab}
                    role={profile.role}
                />
              </div>
          )}

          <div className="flex justify-center mt-12 px-6">
            {resolvedTab === "avatars" && profile.role === "THERAPIST" && (
                <AiAvatarsSection
                    avatars={avatars}
                    setAvatars={setAvatars}
                />
            )}

            {resolvedTab === "clients" && profile.role === "THERAPIST" && (
                <ClientSection avatars={avatars} />
            )}

            {/* CLIENT placeholder */}
            {profile.role === "CLIENT" && (
                <div className="text-slate-500 text-lg">
                  Client experience coming soon…
                </div>
            )}
          </div>
        </main>
      </>
  );
}

function CenteredText({ children }) {
  return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        {children}
      </div>
  );
}
