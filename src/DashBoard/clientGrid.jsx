import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function ClientGrid({ clients, avatars, onDeleteClick }) {
  const navigate = useNavigate();
  
  const avatarMap = Object.fromEntries(
    avatars.map(a => [a.avatarId, a.name])
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {clients.map((client) => (
        <div
          key={client.clientId}
          className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition"
        >
          {/* Delete button */}
          <button
            onClick={() => onDeleteClick(client)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow"
          >
            <X size={14} />
          </button>

          <h4 className="text-lg font-semibold text-slate-900">{client.name}</h4>
          <p className="text-sm text-slate-500 mt-1">{client.sex}, {client.age}</p>

          <div className="mt-4 text-sm text-slate-600 space-y-1">
            <p><span className="font-medium">Avatar:</span> {avatarMap[client.avatarId] || "Unknown Avatar"}</p>
            <p><span className="font-medium">Emotion Pattern:</span> {client.emotionPattern}</p>
          </div>

          <button
            // CHANGED: Using the dynamic backtick URL
            onClick={() => navigate(`/chat/${client.clientId}`, { state: { client } })}
            className="mt-6 w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition shadow"
          >
            Start Chat
          </button>
        </div>
      ))}
    </div>
  );
}