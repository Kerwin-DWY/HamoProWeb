import { useAuth } from "react-oidc-context";
import { useEffect } from "react";

export default function LogoutPage() {
    const auth = useAuth();

    useEffect(() => {
        // clear local auth state
        auth.removeUser();

        // redirect to Cognito logout endpoint
        const clientId = "3ml5mut2nqeqdbfk86eeifnjrg";

        // The page the browser will be sent to AFTER Cognito finishes logging you out
        const logoutUri = `${window.location.origin}/login`;
        const cognitoDomain = "https://ap-east-1schnkebdb.auth.ap-east-1.amazoncognito.com";

        window.location.replace(
            `${cognitoDomain}/logout` +
            `?client_id=${clientId}` +
            `&logout_uri=${encodeURIComponent(logoutUri)}`
        );
    }, []);

    return null;
}
