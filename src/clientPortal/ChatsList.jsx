import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function ChatsList() {
    const { chats } = useUser();
    const navigate = useNavigate();

    if (chats.length === 0) {
        return (
            <div className="text-slate-500 text-lg">
                No chats yet. Enter an invitation code to connect.
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl space-y-4">
            {chats.map((chat) => (
                <button
                    key={`${chat.clientId}-${chat.avatarId}`}
                    onClick={() =>
                        navigate(`/chat/${chat.clientId}/${chat.avatarId}`, {
                            state: { client: chat },
                        })
                    }
                    className="w-full bg-white border rounded-2xl p-4 text-left hover:shadow"
                >
                    <h3 className="font-semibold text-slate-900">
                        {chat.avatarName}
                    </h3>

                    <p className="text-sm text-slate-500">
                        Client: {chat.clientName}
                    </p>
                </button>
            ))}
        </div>
    );
}
