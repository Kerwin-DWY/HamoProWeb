import { useEffect, useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { useUser } from "./context/UserContext";
import { initUserProfile } from "./api/lambda/userApi.js";
import { fetchAvatars } from "./api/lambda/avatarsApi.js";
import Header from "./Header";
import DashboardNav from "./DashBoard/DashboardNav";
import AiAvatarsSection from "./DashBoard/AiAvatarsSection";
import ClientSection from "./DashBoard/ClientSection";
import CustomLoginPage from "./auth/CustomLoginPage";
import RoleMismatchPage from "./auth/RoleMismatchPage.jsx";
import ProfileSettingsPage from "./clientPortal/ProfileSettingsPage.jsx";
import ChatsList from "./clientPortal/ChatsList.jsx";

export default function App({ portal }) {
  const auth = useAuth();
  const { profile, setProfile } = useUser();
  const [avatars, setAvatars] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const effectiveMode = portal; // SINGLE SOURCE OF TRUTH

  // for Query in DB and debugging, remove in production
  useEffect(() => {
    if (!auth.user) return;

    console.log("ACCESS TOKEN:", auth.user.access_token);
    console.log("ID TOKEN:", auth.user.id_token);
    console.log("Cognito user sub:", auth.user.profile?.sub);
  }, [auth.user]);

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
  // Role mismatch detection
  const isRoleMismatch =
    (profile?.role === "THERAPIST" && effectiveMode === "app") ||
    (profile?.role === "CLIENT" && effectiveMode === "pro");


  // =====================================================
  // Initialize profile
  // =====================================================
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    if (!auth.user?.access_token) return;

    initUserProfile({
      authToken: auth.user.access_token,
      mode: effectiveMode, // single source of truth
    })
        .then(setProfile)
        .catch((err) => {
          console.error("Profile init error:", err);
          setInitError(err);
        });
  }, [auth.user, profile, effectiveMode, setProfile]);


  // =====================================================
  // Fetch therapist's avatars
  // =====================================================
  useEffect(() => {
    if (!auth.user?.access_token) return;

    fetchAvatars(auth.user.access_token)
      .then(setAvatars)// save in avatars state
      .catch(console.error);
  }, [auth.user]);

  // =====================================================
  // Guards
  // =====================================================
  if (auth.isLoading) {
    return <CenteredText>Initializing account…</CenteredText>;
  }

  if (!auth.isAuthenticated) {
    return <CustomLoginPage mode={effectiveMode} />;
  }

  if (initError) {
    return (
      <CenteredText>
        <div className="flex flex-col items-center">
          <p className="text-red-500 mb-2 font-medium">Initialization Failed</p>
          <p className="text-sm text-slate-500 mb-6 max-w-md text-center">{initError.message || "Unknown error occurred"}</p>
          <button
            onClick={() => auth.signOut()} // Allow user to logout and retry
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            Sign Out
          </button>
        </div>
      </CenteredText>
    );
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
            <ChatsList />
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
