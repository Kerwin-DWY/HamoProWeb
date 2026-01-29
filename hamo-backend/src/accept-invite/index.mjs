import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME;

// AWS injects region automatically
const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        // ========================
        // Parse request body (safe)
        // ========================
        const body = event.body ? JSON.parse(event.body) : {};
        const { inviteCode } = body;

        if (!inviteCode) {
            return response(400, { message: "inviteCode is required" });
        }

        // ========================
        // Query invite by GSI
        // ========================
        const queryResult = await ddb.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: "InviteCodeIndex",
                KeyConditionExpression:
                    "InviteCodeIndexPK = :pk AND InviteCodeIndexSK = :sk",
                ExpressionAttributeValues: {
                    ":pk": `INVITE#${inviteCode}`,
                    ":sk": "STATUS#PENDING",
                },
                Limit: 1,
            })
        );

        if (!queryResult.Items || queryResult.Items.length === 0) {
            return response(404, {
                message: "Invalid or expired invitation code",
            });
        }

        const invite = queryResult.Items[0];

        // ========================
        // Expiration check
        // ========================
        if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
            return response(400, {
                message: "Invitation code has expired",
            });
        }

        // ========================
        // Update invite status
        // ========================
        await ddb.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: invite.pk,
                    sk: invite.sk,
                },
                UpdateExpression: `
          SET 
            #status = :accepted,
            InviteCodeIndexSK = :newIndexSK,
            acceptedAt = :now
        `,
                ExpressionAttributeNames: {
                    "#status": "status",
                },
                ExpressionAttributeValues: {
                    ":accepted": "ACCEPTED",
                    ":newIndexSK": "STATUS#ACCEPTED",
                    ":now": new Date().toISOString(),
                },
            })
        );

        return response(200, {
            message: "Invitation accepted",
            clientId: invite.clientId,
            avatarId: invite.avatarId,
            avatarName: invite.avatarName,
            clientName: invite.clientName,
        });

    } catch (err) {
        console.error("Accept invite error:", err);
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
