import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import { signIn, signUp, confirmSignUp } from "../api/authApi.js";
import { acceptInvite } from "../api/lamda/acceptInvitesApi.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function CustomLoginPage({ mode }) { // mode: "app" | "pro"
    const navigate = useNavigate();
    const { signIn: authSignIn } = useAuth();
    const [authMode, setAuthMode] = useState("signin"); // signin | signup | confirm
    const lockedRole = mode === "pro" ? "THERAPIST" : "CLIENT";
    const [role, setRole] = useState(lockedRole);

    useEffect(() => {
        setRole(lockedRole);
    }, [lockedRole]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [inviteCode, setInviteCode] = useState("");
    const [confirmationCode, setConfirmationCode] = useState("");
    const [loading, setLoading] = useState(false);

    //  single redirect helper
    const redirectToPortal = () => {
        navigate(mode === "pro" ? "/pro" : "/app", { replace: true });
    };

    async function handleConfirm() {
        setLoading(true);
        try {
            await confirmSignUp({ email, code: confirmationCode });

            const result = await signIn({ email, password });
            authSignIn(result);

            if (role === "CLIENT" && inviteCode) {
                try {
                    await acceptInvite(
                        result.AuthenticationResult.AccessToken,
                        inviteCode
                    );
                } catch (inviteErr) {
                    console.error("Invite acceptance failed", inviteErr);
                    alert(
                        "Account created, but failed to accept invite: " +
                        inviteErr.message
                    );
                }
            }

            redirectToPortal();
        } catch (err) {
            console.error(err);
            alert(err.message || "Confirmation failed");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        setLoading(true);
        try {
            if (authMode === "signup") {
                if (role === "CLIENT" && !inviteCode) {
                    alert("Invitation code required");
                    setLoading(false);
                    return;
                }

                await signUp({ email, password });
                alert("Account created! Please check your email for the verification code.");
                setAuthMode("confirm");
                return;
            }

            const result = await signIn({ email, password });
            authSignIn(result);

            redirectToPortal();
        } catch (err) {
            console.error(err);
            if (err.name === "UserNotConfirmedException") {
                setAuthMode("confirm");
                alert("Please confirm your account.");
            } else {
                alert(err.message || "Authentication failed");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 px-6">
            <div className="w-full max-w-[420px] bg-white rounded-[32px] p-10 shadow-xl">
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
                        <Brain className="text-white" size={28} />
                    </div>
                    <h1 className="mt-6 text-2xl font-bold">Hamo</h1>
                    <p className="text-slate-500 text-sm">Your Personal Therapy Companion</p>
                </div>

                {authMode !== "confirm" && (
                    <div className="mt-8 flex rounded-xl bg-slate-100 p-1">
                        <button
                            onClick={() => setAuthMode("signin")}
                            className={`flex-1 py-2 rounded-lg ${
                                authMode === "signin" ? "bg-white shadow" : ""
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setAuthMode("signup")}
                            className={`flex-1 py-2 rounded-lg ${
                                authMode === "signup"
                                    ? "bg-indigo-500 text-white"
                                    : ""
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                <div className="mt-6 flex justify-center">
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium uppercase">
            {role} PORTAL
          </span>
                </div>

                {authMode !== "confirm" && (
                    <>
                        <input
                            className="mt-6 w-full border rounded-xl px-4 py-3"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            className="mt-4 w-full border rounded-xl px-4 py-3"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {authMode === "signup" && role === "CLIENT" && (
                            <input
                                className="mt-4 w-full border rounded-xl px-4 py-3"
                                placeholder="Invitation Code"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                            />
                        )}
                    </>
                )}

                {authMode === "confirm" && (
                    <input
                        className="mt-6 w-full border rounded-xl px-4 py-3"
                        placeholder="Verification Code"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                    />
                )}

                <button
                    disabled={loading}
                    onClick={authMode === "confirm" ? handleConfirm : handleSubmit}
                    className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
                >
                    {loading
                        ? "Please wait…"
                        : authMode === "signin"
                            ? "Sign In"
                            : authMode === "signup"
                                ? "Create Account"
                                : "Verify & Login"}
                </button>

                <p className="mt-6 text-center text-xs text-slate-400">
                    Version 1.0.1
                </p>
            </div>
        </div>
    );
}
