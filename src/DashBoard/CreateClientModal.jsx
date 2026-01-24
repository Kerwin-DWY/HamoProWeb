import { X } from "lucide-react";
import { useState } from "react";

export default function CreateClientModal({ onClose, onCreate, avatars}) {
   // client model
  const [form, setForm] = useState({
    name: "",
    sex: "",
    age: "",
    emotionPattern: "",
    personality: "",
    cognition: "",
    goals: "",
    principles: "",
    avatars: [],
    selectedAvatarId: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name) return;
      if (!form.selectedAvatarId || form.avatars.length === 0) {
          alert("Please assign an avatar before creating the client");
          return;
      }
    onCreate(form);
  };

  return (
      <div className="fixed inset-0 z-50 flex justify-center bg-black/40 pt-[120px]">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl max-h-[calc(100vh-160px)] flex flex-col relative">

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
              Define client background and therapy context
            </p>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
            <Input label="Name" value={form.name} onChange={(v) => handleChange("name", v)} />

            <Select
                label="Sex"
                value={form.sex}
                onChange={(v) => handleChange("sex", v)}
                options={[
                  "", "Male", "Female", "Non-binary", "Prefer not to say"
                ]}
            />

              <Input label="Age" value={form.age} onChange={(v) => handleChange("age", v)} />

              {/* Avatar Assignment */}
              <div>
                  <label className="text-sm font-medium text-slate-700">
                      Assign AI Avatar
                  </label>

                  <select
                      value={form.selectedAvatarId}
                      onChange={(e) => {
                          const avatarId = e.target.value;
                          const avatar = avatars.find(a => a.avatarId === avatarId);
                          if (!avatar) return;

                          setForm(prev => ({
                              ...prev,

                              selectedAvatarId: avatar.avatarId,

                              //  keep avatars as array
                              avatars: [
                                  {
                                      avatarId: avatar.avatarId,
                                      avatarName: avatar.name,
                                  },
                              ],
                          }));
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                      <option value="">Assign an avatar</option>

                      {avatars.map((avatar) => (
                          <option key={avatar.avatarId} value={avatar.avatarId}>
                              {avatar.name}
                          </option>
                      ))}
                  </select>

              </div>

              <Textarea label="Emotion Pattern" value={form.emotionPattern} onChange={(v) => handleChange("emotionPattern", v)} />
            <Textarea label="Personality & Characteristics" value={form.personality} onChange={(v) => handleChange("personality", v)} />
            <Textarea label="Cognition Features & Beliefs" value={form.cognition} onChange={(v) => handleChange("cognition", v)} />
            <Textarea label="Therapy Goals" value={form.goals} onChange={(v) => handleChange("goals", v)} />
            <Textarea label="Therapy Principles" value={form.principles} onChange={(v) => handleChange("principles", v)} />
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t flex justify-end gap-3 bg-white rounded-b-3xl">
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
            <button onClick={handleSubmit} className="px-6 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow">
              Create Client
            </button>
          </div>
        </div>
      </div>
  );
}

/* ---------- Inputs ---------- */

function Input({ label, value, onChange }) {
  return (
      <div>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500"
        />
      </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
      <div>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <textarea
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 resize-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
      <div>
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
        >
          {options.map((opt) => (
              <option key={opt} value={opt}>{opt || "Select"}</option>
          ))}
        </select>
      </div>
  );
}
