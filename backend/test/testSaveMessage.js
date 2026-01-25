import { saveMessage } from "../chatRepository.js";

async function test() {
    try {
        await saveMessage({
            userId: "test-user-123",
            clientId: "test-client-456",
            sender: "user",
            text: "Hello DynamoDB 👋",
        });

        console.log("✅ Message saved successfully!");
    } catch (err) {
        console.error("❌ Error saving message:", err);
    }
}

test();
