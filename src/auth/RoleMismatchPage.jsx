import { useNavigate } from "react-router-dom";

export default function RoleMismatchPage({ role }) {
    const navigate = useNavigate();

    const isTherapist = role === "THERAPIST";

    const targetDomain = isTherapist
        ? "https://pro.qualemind.com"
        : "https://app.qualemind.com";

    const targetLabel = isTherapist
        ? "Therapist Portal"
        : "Client Portal";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Access Restricted
                </h2>

                <p className="text-slate-600 leading-relaxed">
                    You are signed in as a{" "}
                    <span className="font-semibold">
            {role.toLowerCase()}
          </span>
                    , this portal is not available for your account.
                </p>

                <p className="text-slate-500 mt-3 text-sm">
                    Please use the correct portal for your role.
                </p>

                {/* Primary action */}
                <a
                    href={targetDomain}
                    className="mt-8 inline-flex items-center justify-center
            w-full rounded-xl bg-indigo-600 text-white
            py-3 font-medium hover:bg-indigo-700 transition"
                >
                    Go to {targetLabel}
                </a>

                {/* Logout action */}
                <button
                    onClick={() => navigate("/logout")}
                    className="mt-4 w-full rounded-xl
            border border-slate-300 py-3
            text-slate-700 font-medium
            hover:bg-slate-100 transition"
                >
                    Log out
                </button>

                <p className="mt-4 text-xs text-slate-400">
                    You will be signed out and redirected to login
                </p>
            </div>
        </div>
    );
}
