import { Brain, User, BarChart3 } from "lucide-react";

const tabs = [
  { key: "avatars", label: "AI Avatars", icon: Brain },
  { key: "clients", label: "Clients", icon: User },
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function DashboardNav({ activeTab, setActiveTab }) {
  return (
    <div className="w-full max-w-3xl px-6">
      <div
        className="
          flex justify-center
          bg-white/70 backdrop-blur-xl
          border border-slate-200
          rounded-full
          shadow-lg
          px-2 py-2
        "
      >
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`
                flex items-center gap-2
                px-6 py-2 rounded-full
                text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
