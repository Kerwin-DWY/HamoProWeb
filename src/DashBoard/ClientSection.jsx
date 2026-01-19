import { useState, useEffect } from "react"; // Combined imports
import { Plus, Users } from "lucide-react";
import CreateClientModal from "./CreateClientModal";
import { createClient, fetchClients, deleteClient } from "../api/clientsApi";
import { useAuth } from "react-oidc-context";
import ClientGrid from  "./clientGrid";

export default function ClientsSection({ avatars }) { // Removed unused onStartChat prop
  const auth = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  useEffect(() => {
    if (!auth.user?.access_token) return;
    setLoading(true);
    fetchClients(auth.user.access_token)
      .then(setClients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [auth.user]);

  const handleCreateClient = async (form) => {
    try {
      const created = await createClient(auth.user.access_token, form);
      setClients((prev) => [...prev, created]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create client");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteClient(auth.user.access_token, clientToDelete.clientId);
      setClients((prev) => prev.filter((c) => c.clientId !== clientToDelete.clientId));
      setClientToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete client");
    }
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clients</h2>
          <p className="text-sm text-slate-500 mt-1">Manage therapy clients and assign AI avatars</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-indigo-700 transition"
        >
          <Plus size={18} />
          Create Client
        </button>
      </div>

      {loading ? (
        <ClientsLoading />
      ) : clients.length === 0 ? (
        <EmptyState onCreate={() => setShowModal(true)} />
      ) : (
        <ClientGrid
          clients={clients}
          avatars={avatars} 
          // CHANGED: Removed onStartChat prop as it is no longer needed here
          onDeleteClick={setClientToDelete}
        />
      )}

      {showModal && (
        <CreateClientModal
          avatars={avatars}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateClient}
        />
      )}

      {clientToDelete && (
        <DeleteClientConfirmModal
          client={clientToDelete}
          onCancel={() => setClientToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

// --- Helper Components

function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-16 text-center shadow-xl">
      <Users size={48} className="text-indigo-500 mb-6" />
      <h3 className="text-xl font-semibold text-slate-800">No Clients Yet</h3>
      <p className="text-slate-500 mt-2 max-w-md">Create a client profile and assign a therapy AI avatar.</p>
      <button onClick={onCreate} className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition">
        Create First Client
      </button>
    </div>
  );
}

function DeleteClientConfirmModal({ client, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Delete Client</h3>
        <p className="text-sm text-slate-600 mt-2">
          Are you sure you want to delete <span className="font-medium">{client.name}</span>?<br />
          This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

function ClientsLoading() {
  return (
    <div className="flex flex-col items-center justify-center bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-16 text-center shadow-xl">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4" />
      <p className="text-slate-500 text-sm">Loading clients…</p>
    </div>
  );
}