import { useAuth } from "react-oidc-context";
import { useState } from "react";
import Header from "./Header";
import DashboardNav from "./DashBoard/DashboardNav";
import AiAvatarsSection from "./DashBoard/AiAvatarsSection";
import ClientSection from "./DashBoard/ClientSection";
import LoginPage from "./auth/LoginPage";

export default function App() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState("avatars");
  const [avatars, setAvatars] = useState([]);


  if (auth.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        Checking login session…
      </div>
    );
  }

  //  Only show login if truly unauthenticated
  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

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
