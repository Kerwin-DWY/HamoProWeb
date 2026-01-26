import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to construct the user object expected by the app
    const constructUser = useCallback((accessToken, idToken) => {
        if (!accessToken) return null;

        try {
            const decodedId = idToken ? jwtDecode(idToken) : {};
            // We can also decode access token if needed, but ID token usually has the profile info

            return {
                access_token: accessToken,
                id_token: idToken,
                profile: {
                    sub: decodedId.sub,
                    email: decodedId.email,
                    ...decodedId,
                },
            };
        } catch (e) {
            console.error("Failed to decode token", e);
            return null;
        }
    }, []);

    // Initialize auth state from local storage
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const idToken = localStorage.getItem("idToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (accessToken) {
            const userObj = constructUser(accessToken, idToken);
            if (userObj) {
                setUser(userObj);
            } else {
                // Token might be invalid
                signOut();
            }
        }
        setIsLoading(false);
    }, [constructUser]);

    const signIn = useCallback((authResult) => {
        const accessToken = authResult.AuthenticationResult.AccessToken;
        const idToken = authResult.AuthenticationResult.IdToken;
        const refreshToken = authResult.AuthenticationResult.RefreshToken;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("idToken", idToken);
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
        }

        const userObj = constructUser(accessToken, idToken);
        setUser(userObj);
    }, [constructUser]);

    const signOut = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("idToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
    }, []);

    // Check token expiration periodically or on usage could be added here
    // For now, we rely on the initial load and explicit sign in/out

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
