import crypto from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// AWS injects region automatically
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

// Table name from environment
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
    const method = event.requestContext.http.method;
    const path = event.rawPath;

    // Cognito user id
    const userId = event.requestContext.authorizer?.jwt?.claims?.sub;

    if (!userId) {
        return response(401, { message: "Unauthorized" });
    }

    try {
        // ========================
        // GET /clients
        // ========================
        if (method === "GET" && path === "/clients") {
            const result = await ddb.send(
                new QueryCommand({
                    TableName: TABLE_NAME,
                    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
                    ExpressionAttributeValues: {
                        ":pk": `USER#${userId}`,
                        ":sk": "CLIENT#",
                    },
                })
            );

            return response(200, result.Items ?? []);
        }

        // ========================
        // POST /clients
        // ========================
        if (method === "POST" && path === "/clients") {
            const body = JSON.parse(event.body || "{}");

            if (!body.name) {
                return response(400, {
                    message: "Client name is required",
                });
            }

            const clientId = crypto.randomUUID();

            const clientItem = {
                pk: `USER#${userId}`,
                sk: `CLIENT#${clientId}`,
                clientId,

                name: body.name,
                sex: body.sex ?? "",
                age: body.age ?? "",

                avatars: body.avatars ?? [],
                selectedAvatarId: body.selectedAvatarId ?? "",

                emotionPattern: body.emotionPattern ?? "",
                personality: body.personality ?? "",
                cognition: body.cognition ?? "",
                goals: body.goals ?? "",
                principles: body.principles ?? "",

                createdAt: new Date().toISOString(),
            };

            await ddb.send(
                new PutCommand({
                    TableName: TABLE_NAME,
                    Item: clientItem,
                })
            );

            return response(201, clientItem);
        }

        // ========================
        // DELETE /clients/{clientId}
        // ========================
        if (method === "DELETE" && path.startsWith("/clients/")) {
            const [, , clientId] = path.split("/");

            if (!clientId) {
                return response(400, { message: "clientId is required" });
            }

            await ddb.send(
                new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        pk: `USER#${userId}`,
                        sk: `CLIENT#${clientId}`,
                    },
                })
            );

            return response(200, {
                message: "Client deleted",
                clientId,
            });
        }

        return response(404, { message: "Not Found" });

    } catch (err) {
        console.error("Lambda error:", err);
        return response(500, { message: "Internal Server Error" });
    }
};

// ========================
// Response helper
// ========================
const response = (statusCode, body) => ({
    statusCode,
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
});
