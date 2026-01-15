import { useState } from "react";
import { Plus, Users } from "lucide-react";
import CreateClientModal from "./CreateClientModal";

export default function ClientsSection({ avatars, onStartChat }) {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleCreateClient = (client) => {
    setClients((prev) => [...prev, client]);
    setShowModal(false);
  };

  return (
    <div className="w-full max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Clients
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage therapy clients and assign AI avatars
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
          Create Client
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState onCreate={() => setShowModal(true)} />
      ) : (
        <ClientGrid clients={clients} onStartChat={onStartChat} />
      )}

      {showModal && (
        <CreateClientModal
          avatars={avatars}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateClient}
        />
      )}
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="
      flex flex-col items-center justify-center
      bg-white/70 backdrop-blur-xl
      border border-slate-200
      rounded-3xl
      p-16 text-center
      shadow-xl
    ">
      <Users size={48} className="text-indigo-500 mb-6" />

      <h3 className="text-xl font-semibold text-slate-800">
        No Clients Yet
      </h3>

      <p className="text-slate-500 mt-2 max-w-md">
        Create a client profile and assign a therapy AI avatar.
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
        Create First Client
      </button>
    </div>
  );
}

function ClientGrid({ clients, onStartChat }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {clients.map((client, idx) => (
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
            {client.name}
          </h4>

          <p className="text-sm text-slate-500 mt-1">
            {client.sex}, {client.age}
          </p>

          <div className="mt-4 text-sm text-slate-600 space-y-1">
            <p>
              <span className="font-medium">Avatar:</span>{" "}
              {client.avatar?.name}
            </p>
            <p>
              <span className="font-medium">Emotion Pattern:</span>{" "}
              {client.emotionPattern}
            </p>
          </div>

          <button
            onClick={() => onStartChat(client)}
            className="
              mt-6 w-full
              bg-indigo-600 text-white
              py-2.5 rounded-xl
              hover:bg-indigo-700
              transition
              shadow
            "
          >
            Start Chat
          </button>
        </div>
      ))}
    </div>
  );
}
