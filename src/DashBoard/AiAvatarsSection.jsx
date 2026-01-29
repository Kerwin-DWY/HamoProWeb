import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import CreateAvatarModal from "./CreateAvatarModal";
import EditAvatarModal from "./EditAvatarModal";
import { createAvatar, deleteAvatar, updateAvatar } from "../api/lambdaAPI/avatarsApi.js";
import { X } from "lucide-react";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function AiAvatarsSection({ avatars, setAvatars }) {
  const auth = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [avatarToDelete, setAvatarToDelete] = useState(null);
  const [avatarToEdit, setAvatarToEdit] = useState(null);

  // create avatar
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

  // Update avatar
  const handleUpdateAvatar = async (avatarId, updates) => {
    try {
      const updated = await updateAvatar(
        auth.user.access_token,
        avatarId,
        updates
      );

      setAvatars((prev) =>
        prev.map((a) => (a.avatarId === avatarId ? updated : a))
      );

      setAvatarToEdit(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update avatar");
    }
  };

  // Delete avatar
  const handleConfirmDelete = async () => {
    try {
      await deleteAvatar(
        auth.user.access_token,
        avatarToDelete.avatarId
      );

      setAvatars((prev) =>
        prev.filter((a) => a.avatarId !== avatarToDelete.avatarId)
      );

      setAvatarToDelete(null);
    } catch (err) {
      alert("Failed to delete avatar");
    }
  };

  return (
    <div className="w-full max-w-4xl">
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
        <AvatarGrid
          avatars={avatars}
          onDeleteClick={setAvatarToDelete}
          onEditClick={setAvatarToEdit}
        />
      )}

      {showModal && (
        <CreateAvatarModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateAvatar}
        />
      )}

      {avatarToEdit && (
        <EditAvatarModal
          avatar={avatarToEdit}
          onClose={() => setAvatarToEdit(null)}
          onUpdate={handleUpdateAvatar}
        />
      )}

      {avatarToDelete && (
        <DeleteConfirmModal
          avatar={avatarToDelete}
          onCancel={() => setAvatarToDelete(null)}
          onConfirm={handleConfirmDelete}
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

function AvatarGrid({ avatars, onDeleteClick, onEditClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {avatars.map((avatar) => (
        <div
          key={avatar.avatarId}
          onClick={() => onEditClick(avatar)}
          className="
            relative
            bg-white/80 backdrop-blur-xl
            border border-slate-200
            rounded-2xl p-6
            shadow-md hover:shadow-xl
            transition
            max-w-md
            cursor-pointer
          "
        >
          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(avatar);
            }}
            className="
              absolute top-4 right-4
              w-8 h-8
              rounded-full
              bg-red-500 text-white
              flex items-center justify-center
              hover:bg-red-600
              shadow
              z-10
            "
          >
            <X size={14} />
          </button>

          <h4 className="text-lg font-semibold text-slate-900">
            {avatar.name}
          </h4>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p><b>Theory:</b> {avatar.theory}</p>
            <p><b>Methodology:</b> {avatar.methodology}</p>
            <p><b>Principles:</b> {avatar.principles}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeleteConfirmModal({ avatar, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          Delete Avatar
        </h3>

        <p className="text-sm text-slate-600 mt-2">
          Are you sure you want to delete{" "}
          <span className="font-medium">{avatar.name}</span>?
          <br />
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
