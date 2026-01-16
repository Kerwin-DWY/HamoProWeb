import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import CreateAvatarModal from "./CreateAvatarModal";
import { useAuth } from "react-oidc-context"; 
import { createAvatar } from "../api/avatarsApi";

export default function AiAvatarsSection({ avatars, setAvatars }) {
  const auth = useAuth(); 
  const [showModal, setShowModal] = useState(false);

  const handleCreateAvatar = async (form) => {
    try {
      const created = await createAvatar(
        auth.user.access_token, // Cognito token
        form                    // avatar payload
      );

      setAvatars((prev) => [...prev, created]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create avatar");
    }
  };

  return (
    <div className="w-full max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            AI Therapy Avatars
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage and design your therapy AI personas
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="
            flex items-center gap-2
            bg-indigo-600 text-white
            px-5 py-2.5 rounded-xl
            shadow-lg hover:bg-indigo-700
            transition
          "
        >
          <Plus size={18} />
          Create Avatar
        </button>
      </div>

      {/* Content */}
      {avatars.length === 0 ? (
        <EmptyState onCreate={() => setShowModal(true)} />
      ) : (
        <AvatarGrid avatars={avatars} />
      )}

      {showModal && (
        <CreateAvatarModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateAvatar}
        />
      )}
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div
      className="
        flex flex-col items-center justify-center
        bg-white/70 backdrop-blur-xl
        border border-slate-200
        rounded-3xl
        p-16 text-center
        shadow-xl
      "
    >
      <Sparkles size={48} className="text-indigo-500 mb-6" />

      <h3 className="text-xl font-semibold text-slate-800">
        No AI Avatars Yet
      </h3>

      <p className="text-slate-500 mt-2 max-w-md">
        Create your first AI therapy avatar with its own theory,
        methodology, and principles.
      </p>

      <button
        onClick={onCreate}
        className="
          mt-6
          bg-indigo-600 text-white
          px-6 py-3 rounded-xl
          font-medium
          shadow-lg hover:bg-indigo-700
          transition
        "
      >
        Create Your First Avatar
      </button>
    </div>
  );
}

function AvatarGrid({ avatars }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {avatars.map((avatar, idx) => (
        <div
          key={idx}
          className="
            bg-white/80 backdrop-blur-xl
            border border-slate-200
            rounded-2xl p-6
            shadow-md hover:shadow-xl
            transition
          "
        >
          <h4 className="text-lg font-semibold text-slate-900">
            {avatar.name}
          </h4>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Theory:</span>{" "}
              {avatar.theory}
            </p>
            <p>
              <span className="font-medium text-slate-800">Methodology:</span>{" "}
              {avatar.methodology}
            </p>
            <p>
              <span className="font-medium text-slate-800">Principles:</span>{" "}
              {avatar.principles}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
