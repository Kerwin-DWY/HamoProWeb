import { useAuth } from "react-oidc-context";
import { Brain, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium tracking-wide">Connecting...</p>
        </div>
      </div>
    );
  }

  if (auth.isAuthenticated) return null;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#fafafa]">
      {/* --- SOFT LIGHT BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-50/50 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-violet-50/50 blur-[120px]" />
        <div className="absolute bottom-0 left-[20%] w-full h-[30%] bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* --- LOGIN CARD --- */}
      <div className="relative z-10 w-full max-w-[420px] px-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          
          {/* LOGO SECTION */}
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              {/* Subtle shadow glow */}
              <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Brain className="text-white" size={28} />
              </div>
            </div>
            
            <h1 className="mt-8 text-2xl font-bold text-slate-900 tracking-tight">
              Hamo Pro
            </h1>
            <p className="mt-2 text-slate-500 text-sm font-medium">
              AI Therapy Avatar Management
            </p>
          </div>

          {/* MAIN CTA */}
          <div className="mt-10 space-y-3">
            <button
              onClick={() => auth.signinRedirect()}
              className="
                group w-full flex items-center justify-center gap-2
                bg-slate-900 text-white
                py-3.5 rounded-xl
                font-semibold text-[15px]
                shadow-xl shadow-slate-200
                hover:bg-indigo-600 hover:shadow-indigo-100
                transition-all duration-300 active:scale-[0.98]
              "
            >
              Continue with Cognito
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* STATUS FOOTER */}
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50/50 border border-emerald-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-widest">
                Service Online
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-slate-400 text-[12px] font-medium">
            &copy; 2026 Hamo AI Systems.
          </p>
          <p className="text-slate-300 text-[11px]">
            Privacy Policy &bull; Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}