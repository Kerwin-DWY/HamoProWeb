import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";

// AWS injects region automatically
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        // ==============================
        // Extract user from Cognito
        // ==============================
        const claims = event.requestContext?.authorizer?.jwt?.claims;
        const userId = claims?.sub;

        if (!userId) {
            return response(401, { error: "Unauthorized" });
        }

        // ==============================
        // Parse request body (safe)
        // ==============================
        const body = event.body ? JSON.parse(event.body) : {};
        const roleHint = body.roleHint;

        // ==============================
        // Check if profile exists
        // ==============================
        const getRes = await ddb.send(
            new GetCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    pk: `USER#${userId}`,
                    sk: "PROFILE",
                },
            })
        );

        // If profile exists, return it directly
        if (getRes.Item) {
            return response(200, getRes.Item);
        }

        // ==============================
        // Create profile (FIRST LOGIN ONLY)
        // ==============================
        const role =
            roleHint === "THERAPIST"
                ? "THERAPIST"
                : "CLIENT";

        const profile = {
            pk: `USER#${userId}`,
            sk: "PROFILE",
            role,
            createdAt: new Date().toISOString(),
        };

        await ddb.send(
            new PutCommand({
                TableName: process.env.TABLE_NAME,
                Item: profile,
                // Prevent overwrite even in race conditions
                ConditionExpression: "attribute_not_exists(pk)",
            })
        );

        return response(200, profile);

    } catch (err) {
        console.error("❌ user init error:", err);

        return response(500, {
            error: "Internal Server Error",
            message: err.message,
        });
    }
};

// ==============================
// Helper
// ==============================
function response(statusCode, body) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(body),
    };
}
