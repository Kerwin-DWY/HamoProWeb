import { useAuth } from "react-oidc-context";
import Header from "./Header";
import DashboardNav from "./DashBoard/DashboardNav";
import AiAvatarsSection from "./DashBoard/AiAvatarsSection";
import LoginPage from "./auth/LoginPage";
import { useState } from "react";

export default function App() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState("avatars");

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
          {activeTab === "avatars" && <AiAvatarsSection />}
        </div>
      </main>
    </>
  );
}
