import { X, Check } from "lucide-react";
import { useState } from "react";

export default function InviteCodeModal({ onClose, onSubmit }) {
    const [code, setCode] = useState("");

    const handleSubmit = () => {
        if (!code.trim()) return;
        onSubmit(code.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <h3 className="text-xl font-semibold text-slate-900">
                    Enter Invitation Code
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Paste the code provided by your therapist
                </p>

                {/* Input */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Invitation Code
                    </label>
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="HAMO-XXXXXX"
                        className="
              w-full rounded-xl px-4 py-3
              border border-slate-300
              font-mono tracking-wide
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                    />
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="flex-1 flex items-center justify-center gap-2
              bg-indigo-600 text-white py-3 rounded-xl
              hover:bg-indigo-700 transition shadow-lg"
                    >
                        <Check size={16} />
                        Connect
                    </button>
                </div>
            </div>
        </div>
    );
}
