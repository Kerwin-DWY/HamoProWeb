import { GoogleGenerativeAI } from "@google/generative-ai";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const CHAT_TABLE = process.env.CHAT_TABLE_NAME;

export const handler = async (event) => {
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  // Get authenticated user ID from Cognito JWT
  const userId = event.requestContext.authorizer?.jwt?.claims?.sub;

  if (!userId) {
    return response(401, { message: "Unauthorized" });
  }

  try {
    /* ======================
       POST /chat - Generate AI response
    ====================== */
    if (method === "POST" && path === "/chat") {
      const body = JSON.parse(event.body || "{}");
      const { message, clientId, avatarId } = body;

      if (!message) {
        return response(400, { error: "Message required" });
      }

      // Generate AI response using Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const result = await model.generateContent(message);
      const aiReply = result.response.text();

      return response(200, { reply: aiReply });
    }

    /* ======================
       GET /chat/history - Fetch chat history
    ====================== */
    if (method === "GET" && path === "/chat/history") {
      const qs = event.queryStringParameters || {};
      const { clientId, avatarId } = qs;

      if (!clientId || !avatarId) {
        return response(400, { error: "clientId and avatarId required" });
      }

      const result = await ddb.send(
        new QueryCommand({
          TableName: CHAT_TABLE,
          KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
          ExpressionAttributeValues: {
            ":pk": `CLIENT#${clientId}#AVATAR#${avatarId}`,
            ":sk": "MSG#",
          },
          ScanIndexForward: true,
          Limit: 100,
        })
      );

      return response(200, result.Items || []);
    }

    /* ======================
       POST /chat/message - Save a message
    ====================== */
    if (method === "POST" && path === "/chat/message") {
      const body = JSON.parse(event.body || "{}");
      const { clientId, avatarId, sender, text } = body;

      if (!clientId || !avatarId || !sender || !text) {
        return response(400, { 
          error: "clientId, avatarId, sender, and text are required" 
        });
      }

      const timestamp = Date.now();
      
      await ddb.send(
        new PutCommand({
          TableName: CHAT_TABLE,
          Item: {
            pk: `CLIENT#${clientId}#AVATAR#${avatarId}`,
            sk: `MSG#${timestamp}`,
            userId,
            clientId,
            avatarId,
            sender, // "user" or "ai"
            message: text,
            createdAt: timestamp,
          },
        })
      );

      return response(200, { success: true });
    }

    /* ======================
       GET /chat/conversations - Get all conversations for a therapist
    ====================== */
    if (method === "GET" && path === "/chat/conversations") {
      // Query to get all unique client-avatar pairs for this therapist
      // This requires scanning or using a GSI
      // For now, we'll return a simple implementation
      
      return response(200, { 
        message: "Use client data to build conversation list" 
      });
    }

    return response(404, { error: "Not found" });
  } catch (err) {
    console.error("Chat Lambda error:", err);
    return response(500, { error: "Internal error", details: err.message });
  }
};

/* ======================
   Response Helper
====================== */
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
