import { X } from "lucide-react";
import { useState } from "react";

export default function CreateClientModal({ avatars, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    sex: "",
    age: "",
    avatarId: "",
    emotionPattern: "",
    personality: "",
    cognition: "",
    goals: "",
    principles: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.avatarId) return;

    const selectedAvatar = avatars.find(
      (a, idx) => String(idx) === form.avatarId
    );

    onCreate({
      ...form,
      avatar: selectedAvatar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/40 pt-[120px]">
      <div
        className="
          w-full max-w-xl
          bg-white rounded-3xl
          shadow-2xl
          max-h-[calc(100vh-160px)]
          flex flex-col
          relative
        "
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b">
          <h3 className="text-xl font-bold text-slate-900">
            Create Client Profile
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Define client background and assign an AI therapy avatar
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          <Input label="Name" value={form.name} onChange={(v) => handleChange("name", v)} />
          <div>
          <label className="text-sm font-medium text-slate-700">
            Sex
          </label>
          <select
            value={form.sex}
            onChange={(e) => handleChange("sex", e.target.value)}
            className="
              mt-1 w-full
              rounded-xl border border-slate-300
              px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              bg-white
            "
          >
            <option value="">Select sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

          <Input label="Age" value={form.age} onChange={(v) => handleChange("age", v)} />

          {/* Avatar Select */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Assigned AI Avatar
            </label>
            <select
              value={form.avatarId}
              onChange={(e) => handleChange("avatarId", e.target.value)}
              className="
                mt-1 w-full
                rounded-xl border border-slate-300
                px-4 py-2.5
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            >
              <option value="">Select avatar</option>
              {avatars.map((avatar, idx) => (
                <option key={idx} value={idx}>
                  {avatar.name}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="Emotion Pattern"
            value={form.emotionPattern}
            onChange={(v) => handleChange("emotionPattern", v)}
          />

          <Textarea
            label="Personality & Characteristics"
            value={form.personality}
            onChange={(v) => handleChange("personality", v)}
          />

          <Textarea
            label="Cognition Features & Beliefs"
            value={form.cognition}
            onChange={(v) => handleChange("cognition", v)}
          />

          <Textarea
            label="Therapy Goals"
            value={form.goals}
            onChange={(v) => handleChange("goals", v)}
          />

          <Textarea
            label="Therapy Principles"
            value={form.principles}
            onChange={(v) => handleChange("principles", v)}
          />
        </div>

        {/* Footer (ALWAYS VISIBLE) */}
        <div className="px-8 py-4 border-t flex justify-end gap-3 bg-white rounded-b-3xl">
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
            Create Client
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Inputs ---------- */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          mt-1 w-full
          rounded-xl border border-slate-300
          px-4 py-2.5
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="
          mt-1 w-full
          rounded-xl border border-slate-300
          px-4 py-2.5
          resize-none
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />
    </div>
  );
}
