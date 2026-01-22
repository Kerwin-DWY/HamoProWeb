import { Brain, LogOut } from "lucide-react";

export default function Header({ role }) {
    const signOut = () => {
        window.location.href = "/logout";
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-[72px] px-8 bg-white/80 backdrop-blur-xl">
            {/* LEFT */}
            <div className="flex items-center gap-3">
                <Brain size={36} className="text-indigo-600" />
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">
                        {role === "THERAPIST" ? "Hamo Pro" : "Hamo Client"}
                    </h1>
                    <p className="text-xs text-slate-500 tracking-wide">
                        {role === "THERAPIST"
                            ? "AI THERAPY AVATAR CONSOLE"
                            : "AI THERAPY ASSISTANT"}
                    </p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="ml-auto">
                <button
                    onClick={signOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl
                     text-slate-600 hover:text-slate-900
                     hover:bg-slate-100 transition"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </header>
    );
}
