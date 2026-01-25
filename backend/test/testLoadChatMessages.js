import { loadChatMessages } from "../chatRepository.js";

async function test() {
    const messages = await loadChatMessages({
        userId: "test-user-123",
        clientId: "test-client-456",
    });

    console.log("📜 Chat history:");
    for (const msg of messages) {
        console.log(`[${msg.sender}] ${msg.message}`);
    }
}

test();
