import { useState } from "react";
import { Plus, QrCode, Upload, CheckCircle2 } from "lucide-react";
import InviteCodeModal from "./InviteCodeModal";
import { acceptInvite } from "../api/lambdaAPI/acceptInvitesApi.js";
import { createUserChat } from "../api/lambdaAPI/userChatsApi.js";
import { useAuth } from "../auth/AuthProvider";
import { useUser } from "../context/UserContext";

export default function ProfileSettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const auth = useAuth();
    const { chats, setChats } = useUser();

    const handleAcceptInvite = async (code) => {
        try {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4dfe4d4d-54ad-4d09-bc30-acc643ee8859',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileSettingsPage.jsx:20',message:'acceptInvite called',data:{code},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
            // #endregion
            const result = await acceptInvite(auth.user.access_token, code);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4dfe4d4d-54ad-4d09-bc30-acc643ee8859',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileSettingsPage.jsx:22',message:'acceptInvite result',data:{result,clientId:result.clientId,avatarId:result.avatarId,clientName:result.clientName,avatarName:result.avatarName},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H2'})}).catch(()=>{});
            // #endregion

            const newChat = {
                clientId: result.clientId,
                avatarId: result.avatarId,
                clientName: result.clientName,
                avatarName: result.avatarName,
            };
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4dfe4d4d-54ad-4d09-bc30-acc643ee8859',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileSettingsPage.jsx:28',message:'newChat constructed',data:{newChat},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
            // #endregion

            // Save to backend
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4dfe4d4d-54ad-4d09-bc30-acc643ee8859',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileSettingsPage.jsx:30',message:'calling createUserChat',data:{newChat},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
            // #endregion
            await createUserChat(auth.user.access_token, newChat);

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4dfe4d4d-54ad-4d09-bc30-acc643ee8859',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileSettingsPage.jsx:32',message:'createUserChat success',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
            // #endregion

            // Update local state
            setChats((prev) => [...prev, newChat]);
            setShowInviteModal(false);
            
            // Show beautiful success message
            setSuccessMessage(`Successfully connected to ${result.avatarName}!`);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
        } catch (err) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/4dfe4d4d-54ad-4d09-bc30-acc643ee8859',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProfileSettingsPage.jsx:41',message:'handleAcceptInvite error',data:{error:err.message,stack:err.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H2,H3'})}).catch(()=>{});
            // #endregion
            console.error("Invite acceptance error:", err);
            alert(err.message || "Invalid or expired invite code");
        }
    };

    return (
        <>
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-top-5 duration-300">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                        <CheckCircle2 size={24} />
                        <div>
                            <p className="font-semibold">{successMessage}</p>
                            <p className="text-sm text-green-100">Check the Chats tab to start your therapy session</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl mx-auto space-y-10 px-6">

                {/* ===============================
                    Connect New Avatar
                =============================== */}
                <section className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl p-8">
                    <h2 className="text-xl font-semibold text-slate-900 mb-6">
                        Connect New Avatar
                    </h2>

                    <div className="space-y-4">
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="
                            w-full flex items-center justify-center gap-2
                            border-2 border-indigo-500 text-indigo-600
                            py-3 rounded-2xl font-medium
                            hover:bg-indigo-50 transition
              "
                        >
                            <Plus size={18} />
                            Add with Invite Code
                        </button>
                    </div>
                </section>

                {/* ===============================
                    Profile Settings
                =============================== */}
                <section className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl p-8">
                    <h2 className="text-xl font-semibold text-slate-900 mb-8">
                        Profile Settings
                    </h2>

                    {/* Avatar Row */}
                    <div className="flex items-center gap-6 mb-8">
                        <div
                            className="
                            w-20 h-20 rounded-full
                            bg-gradient-to-br from-indigo-400 to-purple-500
                            flex items-center justify-center
                            text-white text-3xl font-semibold
                            "
                        >
                            K
                        </div>

                        <button
                            className="
                            flex items-center gap-2
                            px-5 py-2 rounded-xl
                            border border-slate-300
                            text-slate-700
                            hover:bg-slate-100 transition
                              "
                        >
                            <Upload size={16} />
                            Change Avatar
                        </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        <Input label="Email" />

                        <PasswordInput
                            label="Current Password"
                            value={currentPassword}
                            onChange={setCurrentPassword}
                        />

                        <PasswordInput
                            label="New Password"
                            value={newPassword}
                            onChange={setNewPassword}
                        />

                        <button
                            className="
                            w-full mt-6
                            bg-indigo-600 text-white
                            py-3 rounded-2xl
                            font-medium
                            hover:bg-indigo-700
                            transition shadow-lg
                          "
                        >
                            Save Changes
                        </button>
                    </div>
                </section>
            </div>

            {/* ===============================
                  Invite Code Modal
              =============================== */}
            {showInviteModal && (
                <InviteCodeModal
                    onClose={() => setShowInviteModal(false)}
                    onSubmit={handleAcceptInvite}
                />
            )}
        </>
    );
}

/* =====================================================
   Reusable Inputs
===================================================== */

function Input({ label, value, disabled }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label}
            </label>
            <input
                value={value}
                disabled={disabled}
                className={`
                  w-full rounded-xl px-4 py-2.5
                  border border-slate-300
                  ${disabled ? "bg-slate-100 text-slate-400" : ""}
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
        `}
            />
        </div>
    );
}

function PasswordInput({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label}
            </label>
            <input
                type="password"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="
                  w-full rounded-xl px-4 py-2.5
                  border border-slate-300
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                "
            />
        </div>
    );
}
