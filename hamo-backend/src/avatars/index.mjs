import crypto from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";


const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
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
        // GET /avatars
        // ========================
        if (method === "GET" && path === "/avatars") {
            const result = await ddb.send(
                new QueryCommand({
                    TableName: TABLE_NAME,
                    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
                    ExpressionAttributeValues: {
                        ":pk": `USER#${userId}`,
                        ":sk": "AVATAR#",
                    },
                })
            );

            return response(200, result.Items ?? []);
        }

        // ========================
        // POST /avatars
        // ========================
        if (method === "POST" && path === "/avatars") {
            const body = JSON.parse(event.body || "{}");

            if (!body.name) {
                return response(400, { message: "Avatar name is required" });
            }

            const avatarId = crypto.randomUUID();

            const avatar = {
                pk: `USER#${userId}`,
                sk: `AVATAR#${avatarId}`,
                avatarId,
                name: body.name,
                theory: body.theory ?? "",
                methodology: body.methodology ?? "",
                principles: body.principles ?? "",
                createdAt: new Date().toISOString(),
            };

            await ddb.send(
                new PutCommand({
                    TableName: TABLE_NAME,
                    Item: avatar,
                })
            );

            return response(201, avatar);
        }

        // ========================
        // DELETE /avatars/{avatarId}
        // ========================
        if (method === "DELETE" && path.startsWith("/avatars/")) {
            const [, , avatarId] = path.split("/");

            if (!avatarId) {
                return response(400, { message: "avatarId is required" });
            }

            await ddb.send(
                new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        pk: `USER#${userId}`,
                        sk: `AVATAR#${avatarId}`,
                    },
                })
            );

            return response(200, { message: "Avatar deleted", avatarId });
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
