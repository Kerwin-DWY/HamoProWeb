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

export default function App() {
  const auth = useAuth();
  const { profile, setProfile } = useUser();
  const [avatars, setAvatars] = useState([]);
  const mode = getAppMode(); // "pro" | "app"

  // Determine initial active tab based on user role
  const [activeTab, setActiveTab] = useState(() => {
    if (!profile) return null;
    return profile.role === "THERAPIST" ? "avatars" : "clients";
  });


  // Initialize user profile
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


  useEffect(() => {
    if (!profile) return;

    const host = window.location.hostname;

    if (profile.role === "THERAPIST" && host.startsWith("app.")) {
      window.location.replace("https://pro.qualemind.com");
    }

    if (profile.role === "CLIENT" && host.startsWith("pro.")) {
      window.location.replace("https://app.qualemind.com");
    }
  }, [profile]);


  // Fetch avatars (THIS WAS MISSING / BROKEN)
  useEffect(() => {
    if (!auth.user?.access_token) return;

    fetchAvatars(auth.user.access_token)
        .then(setAvatars)
        .catch(console.error);
  }, [auth.user]);

  // ---------- Guards ----------

  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  if (!profile) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          Initializing account…
        </div>
    );
  }

  // ---------- UI ----------

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
