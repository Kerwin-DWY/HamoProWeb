import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
export const ddb = DynamoDBDocumentClient.from(client);

/**
 * Save a single chat message
 */
export async function saveMessage({userId, clientId, clientName, avatarId, avatarName, sender, text,}) {
    const timestamp = Date.now();

    await ddb.send(
        new PutCommand({
            TableName: "ChatMessages",
            Item: {
                pk: `USER#${userId}`,
                sk: `CHAT#CLIENT#${clientId}#AVATAR#${avatarId}#${timestamp}`,

                userId,
                clientId,
                clientName,

                avatarId,
                avatarName,

                sender,
                message: text,
                createdAt: timestamp,
            },
        })
    );
}


/**
 * Load chat history for a user + client
 */
export async function loadChatMessages({userId, clientId, avatarId, limit = 50,}) {
    const result = await ddb.send(
        new QueryCommand({
            TableName: "ChatMessages",
            KeyConditionExpression:
                "pk = :pk AND begins_with(sk, :skPrefix)",
            ExpressionAttributeValues: {
                ":pk": `USER#${userId}`,
                ":skPrefix": `CHAT#CLIENT#${clientId}#AVATAR#${avatarId}#`,
            },
            ScanIndexForward: true,
            Limit: limit,
        })
    );

    return result.Items ?? [];
}

