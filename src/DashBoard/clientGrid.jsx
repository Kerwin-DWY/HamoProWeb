import { useState } from "react";
import { X, Mail } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import InviteClientModal from "./InviteClientModal";
import { createInvite } from "../api/lambdaAPI/invitesApi";

export default function ClientGrid({ clients, onDeleteClick }) {
    const auth = useAuth();

    const [inviteClient, setInviteClient] = useState(null);
    const [inviteCode, setInviteCode] = useState(null);
    const [loadingId, setLoadingId] = useState(null);

    const handleInvite = async (client) => {
        setLoadingId(client.clientId);
        const avatar = client.avatars.find(
            a => a.avatarId === client.selectedAvatarId
        );

        if (!avatar) {
            alert("Selected avatar not found");
            return;
        }

        try {

            const result = await createInvite(auth.user.access_token, {
                clientId: client.clientId,
                clientName: client.name,
                avatarId: avatar.avatarId,
                avatarName: avatar.avatarName,
            });

            setInviteClient({ ...client, avatar });
            setInviteCode(result.inviteCode);
        } catch (err) {
            console.error(err);
            alert("Failed to generate invite");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <div
                        key={client.clientId}
                        className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition max-w-md"
                    >
                        {/* Delete */}
                        <button
                            onClick={() => onDeleteClick(client)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow"
                        >
                            <X size={14} />
                        </button>

                        <h4 className="text-lg font-semibold text-slate-900">
                            {client.name}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">
                            {client.sex}, {client.age}
                        </p>

                        <div className="mt-4 text-sm text-slate-600 space-y-1">
                            <p>
                                <span className="font-medium">Therapy Goals:</span>{" "}
                                {client.goals}
                            </p>
                            <p>
                                <span className="font-medium">Emotion Pattern:</span>{" "}
                                {client.emotionPattern}
                            </p>
                        </div>

                        {/* INVITE */}
                        <button
                            disabled={loadingId === client.clientId}
                            onClick={() => handleInvite(client)}
                            className="mt-6 w-full flex items-center justify-center gap-2
                                     bg-indigo-600 text-white py-2.5 rounded-xl
                                     hover:bg-indigo-700 transition shadow disabled:opacity-60"
                        >
                            <Mail size={16} />
                            {loadingId === client.clientId ? "Generating…" : "Invite Client"}
                        </button>

                    </div>
                ))}
            </div>

            {inviteClient && inviteCode && (
                <InviteClientModal
                    client={inviteClient}
                    inviteCode={inviteCode}
                    onClose={() => {
                        setInviteClient(null);
                        setInviteCode(null);
                    }}
                />
            )}
        </>
    );
}
