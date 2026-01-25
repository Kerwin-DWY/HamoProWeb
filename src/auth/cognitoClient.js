import {CognitoIdentityProviderClient,} from "@aws-sdk/client-cognito-identity-provider";

export const cognitoClient = new CognitoIdentityProviderClient({
    region: "ap-east-1",
});

export const CLIENT_ID = "j6ajfbnjhr6oji1j8jbtou4k7";
