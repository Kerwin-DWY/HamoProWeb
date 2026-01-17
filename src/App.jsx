import { useAuth } from "react-oidc-context";
import { useState } from "react";
import { useEffect } from "react";
import { fetchAvatars } from "./api/avatarsApi";
import Header from "./Header";
import DashboardNav from "./DashBoard/DashboardNav";
import AiAvatarsSection from "./DashBoard/AiAvatarsSection";
import ClientSection from "./DashBoard/ClientSection";
import LoginPage from "./auth/LoginPage";
export default function App() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState("avatars");
  const [avatars, setAvatars] = useState([]);

  // Avatars fetch here cause it needs to be shared between AiAvatarsSection and ClientSection
  useEffect(() => {
  if (!auth.user?.access_token) return;

  fetchAvatars(auth.user.access_token)
    .then(setAvatars)
    .catch(console.error);
  }, [auth.user]);

  console.log("Access token:", auth.user?.access_token);

  // Only show login AFTER loading is complete
  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated → go straight to main app
  return (
    <>
      <Header />

      <main className="pt-[96px] min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="flex justify-center px-6">
          <DashboardNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        <div className="flex justify-center mt-12 px-6">
          {activeTab === "avatars" && (
            <AiAvatarsSection
              avatars={avatars}
              setAvatars={setAvatars}
            />
          )}

          {activeTab === "clients" && (
            <ClientSection
              avatars={avatars}
              onStartChat={(client) =>
                console.log("Start chat with:", client)
              }
            />
          )}
        </div>
      </main>
    </>
  );
}
