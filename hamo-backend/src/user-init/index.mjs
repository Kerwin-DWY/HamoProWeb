import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

// AWS injects region automatically
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const method = event.requestContext.http.method;
    const path = event.rawPath;

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
        // PUT /user/profile - Update nickname
        // ==============================
        if (method === "PUT" && path === "/user/profile") {
            const body = event.body ? JSON.parse(event.body) : {};
            const { nickname } = body;

            if (!nickname || nickname.trim().length === 0) {
                return response(400, { error: "Nickname is required" });
            }

            const result = await ddb.send(
                new UpdateCommand({
                    TableName: process.env.TABLE_NAME,
                    Key: {
                        pk: `USER#${userId}`,
                        sk: "PROFILE",
                    },
                    UpdateExpression: "SET nickname = :nickname, updatedAt = :now",
                    ExpressionAttributeValues: {
                        ":nickname": nickname.trim(),
                        ":now": new Date().toISOString(),
                    },
                    ReturnValues: "ALL_NEW",
                })
            );

            return response(200, result.Attributes);
        }

        // ==============================
        // POST /user/init - Initialize or get profile
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
            nickname: "", // Empty nickname by default
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
