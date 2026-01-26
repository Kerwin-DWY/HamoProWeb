import { SignUpCommand, InitiateAuthCommand, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, CLIENT_ID } from "../auth/cognitoClient.js";

// =====================
// SIGN UP
// =====================
export async function signUp({ email, password }) {
    const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
            { Name: "email", Value: email },
        ],
    });

    return cognitoClient.send(command);
}

// =====================
// CONFIRM SIGN UP
// =====================
export async function confirmSignUp({ email, code }) {
    const command = new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
    });

    return cognitoClient.send(command);
}

// =====================
// SIGN IN
// =====================
export async function signIn({ email, password }) {
    const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },
    });

    return cognitoClient.send(command);
}
