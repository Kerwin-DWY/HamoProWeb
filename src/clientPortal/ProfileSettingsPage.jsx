import { useState } from "react";
import { Plus, QrCode, Upload } from "lucide-react";
import InviteCodeModal from "./InviteCodeModal";
import { acceptInvite } from "../api/lambda/acceptInvitesApi.js";
import { useAuth } from "../auth/AuthProvider";
import { useUser } from "../context/UserContext";

export default function ProfileSettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showInviteModal, setShowInviteModal] = useState(false);
    const auth = useAuth();
    const { chats, setChats } = useUser();

    const handleAcceptInvite = async (code) => {
        try {
            const result = await acceptInvite(auth.user.access_token, code);

            const newChat = {
                clientId: result.clientId,
                avatarId: result.avatarId,
                clientName: result.clientName,
                avatarName: result.avatarName,
            };

            setChats((prev) => [...prev, newChat]);
            setShowInviteModal(false);
        } catch (err) {
            alert("Invalid or expired invite code");
        }
    };

    return (
        <>
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
