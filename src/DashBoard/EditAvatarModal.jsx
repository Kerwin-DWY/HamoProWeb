import { X } from "lucide-react";
import { useState } from "react";

export default function EditAvatarModal({ avatar, onClose, onUpdate }) {
  const [form, setForm] = useState({
    name: avatar.name || "",
    theory: avatar.theory || "",
    methodology: avatar.methodology || "",
    principles: avatar.principles || "",
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onUpdate(avatar.avatarId, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="
          w-full max-w-xl
          bg-white rounded-3xl
          shadow-2xl
          p-8
          relative
        "
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-slate-900">
          Edit AI Avatar
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Update how this therapy avatar thinks and behaves
        </p>

        <div className="mt-6 space-y-4">
          {[
            ["name", "Avatar Name"],
            ["theory", "Therapy Theory"],
            ["methodology", "Methodology"],
            ["principles", "Core Principles"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-medium text-slate-700">
                {label}
              </label>
              <input
                value={form[key]}
                onChange={(e) =>
                  setForm({ ...form, [key]: e.target.value })
                }
                className="
                  mt-1 w-full
                  rounded-xl border border-slate-300
                  px-4 py-2.5
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                "
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
