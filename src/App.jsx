import { useAuth } from "react-oidc-context";
import { useEffect, useState } from "react";
import { useUser } from "./context/UserContext";
import {getAppMode, getLocalModeOverride} from "./utils/appMode";
import { initUserProfile } from "./api/userApi";
import { fetchAvatars } from "./api/lamda/avatarsApi.js";
import Header from "./Header";
import DashboardNav from "./DashBoard/DashboardNav";
import AiAvatarsSection from "./DashBoard/AiAvatarsSection";
import ClientSection from "./DashBoard/ClientSection";
import LoginPage from "./auth/LoginPage";
import RoleMismatchPage from "./auth/RoleMismatchPage.jsx";
import ProfileSettingsPage from "./client/ProfileSettingsPage.jsx";

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
              ? "chats"
              : null;

  const resolvedTab = activeTab ?? defaultTab;

  // =====================================================
  // Role / domain mismatch.
  // For Develop -> http://localhost:5174?mode=app and http://localhost:5174?mode=pro
  // =====================================================
  const localMode = getLocalModeOverride();
  const isLocalhost = host === "localhost";

  const effectiveMode = isLocalhost
      ? localMode
      : host.startsWith("pro.")
          ? "pro"
          : host.startsWith("app.")
              ? "app"
              : null;

  const isRoleMismatch =
      (profile?.role === "THERAPIST" && effectiveMode === "app") ||
      (profile?.role === "CLIENT" && effectiveMode === "pro");


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

          {/* NAV — both roles */}
          <div className="flex justify-center px-6">
            <DashboardNav
                activeTab={resolvedTab}
                setActiveTab={setActiveTab}
                role={profile.role}
            />
          </div>

          <div className="flex justify-center mt-12 px-6 w-full">

            {/* ================= THERAPIST ================= */}
            {profile.role === "THERAPIST" && resolvedTab === "avatars" && (
                <AiAvatarsSection
                    avatars={avatars}
                    setAvatars={setAvatars}
                />
            )}

            {profile.role === "THERAPIST" && resolvedTab === "clients" && (
                <ClientSection avatars={avatars} />
            )}

            {profile.role === "THERAPIST" && resolvedTab === "dashboard" && (
                <div className="text-slate-500 text-lg">
                  Dashboard coming soon…
                </div>
            )}

            {/* ================= CLIENT ================= */}
            {profile.role === "CLIENT" && resolvedTab === "chats" && (
                <div className="text-slate-500 text-lg">
                  Chat list coming soon…
                </div>
            )}

            {profile.role === "CLIENT" && resolvedTab === "settings" && (
                <ProfileSettingsPage />
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
