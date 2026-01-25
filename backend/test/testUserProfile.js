import {
    getUserProfile,
    createUserProfile,
} from "../userRepository.js";

async function run() {
    // Use a REAL test user id
    const userId = "test-user-123";
    const role = "THERAPIST";

    console.log(" Creating user profile...");
    try {
        const created = await createUserProfile({ userId, role });
        console.log("✅ Created:", created);
    } catch (err) {
        if (err.name === "ConditionalCheckFailedException") {
            console.log("ℹ️ User profile already exists");
        } else {
            console.error("❌ Create failed:", err);
            return;
        }
    }

    console.log("\n▶ Fetching user profile...");
    const profile = await getUserProfile(userId);
    console.log("✅ Fetched:", profile);
}

run().catch(console.error);
