import { useState, useEffect } from "react";
import { Plus, Upload, CheckCircle2, Save, Loader2 } from "lucide-react";
import InviteCodeModal from "./InviteCodeModal";
import { acceptInvite } from "../api/lambdaAPI/acceptInvitesApi.js";
import { createUserChat } from "../api/lambdaAPI/userChatsApi.js";
import { updateNickname } from "../api/lambdaAPI/userApi.js";
import { useAuth } from "../auth/AuthProvider";
import { useUser } from "../context/UserContext";

export default function ProfileSettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [savingNickname, setSavingNickname] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const auth = useAuth();
    const { chats, setChats, profile, setProfile } = useUser();

    // Initialize nickname from profile
    useEffect(() => {
        if (profile?.nickname) {
            setNickname(profile.nickname);
        }
    }, [profile]);

    const handleSaveNickname = async () => {
        if (!nickname.trim()) {
            alert("Please enter a nickname");
            return;
        }

        setSavingNickname(true);
        try {
            const updatedProfile = await updateNickname(auth.user.access_token, nickname);
            setProfile(updatedProfile);
            setSuccessMessage("Nickname updated!");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to update nickname:", err);
            alert("Failed to update nickname");
        } finally {
            setSavingNickname(false);
        }
    };

    const handleAcceptInvite = async (code) => {
        try {
            const result = await acceptInvite(auth.user.access_token, code);

            const newChat = {
                clientId: result.clientId,
                avatarId: result.avatarId,
                clientName: result.clientName,
                avatarName: result.avatarName,
            };

            // Save to backend
            await createUserChat(auth.user.access_token, newChat);

            // Update local state
            setChats((prev) => [...prev, newChat]);
            setShowInviteModal(false);
            
            // Show success message
            setSuccessMessage(`Successfully connected to ${result.avatarName}!`);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
        } catch (err) {
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
                            bg-gradient-to-br from-fuchsia-400 to-purple-500
                            flex items-center justify-center
                            text-white text-3xl font-semibold
                            "
                        >
                            {(nickname || auth.user?.profile?.email || 'U')[0].toUpperCase()}
                        </div>

                        <div className="flex-1">
                            <p className="text-sm text-slate-500 mb-1">Display Name</p>
                            <p className="font-medium text-slate-900">
                                {nickname || auth.user?.profile?.email?.split('@')[0] || 'Not set'}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Nickname Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nickname
                            </label>
                            <div className="flex gap-3">
                                <input
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="Enter your nickname"
                                    className="flex-1 rounded-xl px-4 py-2.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleSaveNickname}
                                    disabled={savingNickname}
                                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {savingNickname ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                This name will be displayed in your chat sessions
                            </p>
                        </div>

                        <Input label="Email" value={auth.user?.profile?.email || ''} disabled />

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
                            Change Password
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
