import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE = "HamoPro";

export async function getUserProfile(userId) {
    const res = await ddb.send(
        new GetCommand({
            TableName: TABLE,
            Key: {
                pk: `USER#${userId}`,
                sk: "PROFILE",
            },
        })
    );

    return res.Item;
}

export async function createUserProfile({ userId, role }) {
    const item = {
        pk: `USER#${userId}`,
        sk: "PROFILE",
        role,
        createdAt: new Date().toISOString(),
    };

    await ddb.send(
        new PutCommand({
            TableName: TABLE,
            Item: item,
            ConditionExpression: "attribute_not_exists(pk)", // only once
        })
    );

    return item;
}
