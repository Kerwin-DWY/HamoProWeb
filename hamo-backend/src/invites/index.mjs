import crypto from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME;

// AWS injects region automatically
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

// ----------------------------------
// Simple readable invite code
// ----------------------------------
function generateInviteCode() {
    return "HAMO-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

export const handler = async (event) => {
    try {
        // ========================
        // Get userId from Cognito
        // ========================
        const userId = event.requestContext.authorizer?.jwt?.claims?.sub;

        if (!userId) {
            return response(401, { message: "Unauthorized" });
        }

        // ========================
        // Parse request body (safe)
        // ========================
        const body = event.body ? JSON.parse(event.body) : {};
        const { clientId, clientName, avatarId, avatarName } = body;

        if (!clientId || !clientName) {
            return response(400, {
                message: "clientId and clientName are required",
            });
        }

        // ========================
        // Build invite item
        // ========================
        const inviteCode = generateInviteCode();

        const item = {
            // -------- Primary Key --------
            pk: `USER#${userId}`,
            sk: `INVITE#${inviteCode}`,

            // -------- GSI KEYS --------
            InviteCodeIndexPK: `INVITE#${inviteCode}`,
            InviteCodeIndexSK: `STATUS#PENDING`,

            inviteCode,
            clientId,
            clientName,
            avatarId,
            avatarName,

            status: "PENDING",
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
            ).toISOString(),

            createdAt: new Date().toISOString(),
        };

        // ========================
        // Save to DynamoDB
        // ========================
        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: item,
            })
        );

        return response(201, item);

    } catch (err) {
        console.error("Create invite error:", err);
        return response(500, { message: "Internal Server Error" });
    }
};

// ----------------------------------
// Response helper
// ----------------------------------
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
