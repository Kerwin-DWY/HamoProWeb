import { Brain, User, BarChart3 } from "lucide-react";

const ALL_TABS = [
    { key: "avatars", label: "AI Avatars", icon: Brain, modes: ["pro"] },
    { key: "history", label: "Chat History", icon: BarChart3 },
    { key: "dashboard", label: "Dashboard", icon: BarChart3, modes: ["pro"] },
    { key: "clients", label: "Clients", icon: User, modes: ["app"] },
];

export default function DashboardNav({ activeTab, setActiveTab, role }) {
    // Filter tabs based on user role
    const tabs = ALL_TABS.filter(tab => {
        if (role === "THERAPIST") {
            return tab.key !== "clients";
        }
        if (role === "CLIENT") {
            return tab.key === "clients";
        }
        return false;
    });


    return (
        <div className="w-full max-w-3xl px-6">
            <div className="flex justify-center bg-white/70 backdrop-blur-xl border rounded-full shadow-lg px-2 py-2">
                {tabs.map(({ key, label, icon: Icon }) => {
                    const isActive = activeTab === key;

                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-indigo-600 text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                            }`}
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
