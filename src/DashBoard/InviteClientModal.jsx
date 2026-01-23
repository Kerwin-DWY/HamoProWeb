import { X, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function InviteClientModal({ client, inviteCode, onClose }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-slate-900">
                    Invite {client.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Share this invitation code with your client
                </p>

                {/* Code */}
                <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Invitation Code
                        </p>
                        <p className="mt-1 text-lg font-mono font-semibold text-slate-900">
                            {inviteCode}
                        </p>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl
              bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                        {copied ? (
                            <>
                                <CheckCircle size={16} />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy size={16} />
                                Copy
                            </>
                        )}
                    </button>
                </div>

                <p className="mt-6 text-xs text-slate-500 text-center">
                    Clients can enter this code during signup to connect with you
                </p>
            </div>
        </div>
    );
}
