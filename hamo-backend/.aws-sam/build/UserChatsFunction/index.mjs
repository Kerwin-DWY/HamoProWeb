import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME;

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // Get authenticated user ID
  const userId = event.requestContext.authorizer?.jwt?.claims?.sub;

  if (!userId) {
    return response(401, { message: "Unauthorized" });
  }

  try {
    /* ======================
       GET /user/chats - Fetch user's chat sessions
    ====================== */
    if (method === "GET" && path === "/user/chats") {
      const result = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
          ExpressionAttributeValues: {
            ":pk": `USER#${userId}`,
            ":sk": "CHAT#",
          },
        })
      );

      return response(200, result.Items || []);
    }

    /* ======================
       POST /user/chats - Create chat session
    ====================== */
    if (method === "POST" && path === "/user/chats") {
      const body = JSON.parse(event.body || "{}");
      const { clientId, avatarId, clientName, avatarName } = body;

      if (!clientId || !avatarId || !clientName || !avatarName) {
        return response(400, {
          message: "clientId, avatarId, clientName, and avatarName required",
        });
      }

      const chatSession = {
        pk: `USER#${userId}`,
        sk: `CHAT#${clientId}#${avatarId}`,
        userId,
        clientId,
        avatarId,
        clientName,
        avatarName,
        createdAt: new Date().toISOString(),
      };

      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: chatSession,
        })
      );

      return response(201, chatSession);
    }

    /* ======================
       DELETE /user/chats/{clientId}/{avatarId}
    ====================== */
    if (method === "DELETE" && path.startsWith("/user/chats/")) {
      const pathParts = path.split("/");
      const clientId = pathParts[3];
      const avatarId = pathParts[4];

      if (!clientId || !avatarId) {
        return response(400, {
          message: "clientId and avatarId required in path",
        });
      }

      await ddb.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            pk: `USER#${userId}`,
            sk: `CHAT#${clientId}#${avatarId}`,
          },
        })
      );

      return response(200, {
        message: "Chat session deleted",
        clientId,
        avatarId,
      });
    }

    return response(404, { message: "Not Found" });
  } catch (err) {
    console.error("User chats error:", err);
    return response(500, { message: "Internal Server Error" });
  }
};

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(body),
});
