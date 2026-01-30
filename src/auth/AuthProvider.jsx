import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children, mode }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // portal-aware storage key
    const storageKey = useCallback(
        (key) => `${mode}.${key}`,
        [mode]
    );

    // Check if token is expired (with 60 second buffer)
    const isTokenExpired = useCallback((token) => {
        if (!token) return true;
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime + 60; // 60 second buffer
        } catch {
            return true;
        }
    }, []);

    const constructUser = useCallback((accessToken, idToken) => {
        if (!accessToken) return null;

        // Check if token is expired
        if (isTokenExpired(accessToken)) {
            console.log("Token expired, clearing session");
            return null;
        }

        try {
            const decodedId = idToken ? jwtDecode(idToken) : {};
            return {
                access_token: accessToken,
                id_token: idToken,
                profile: {
                    sub: decodedId.sub,
                    email: decodedId.email,
                    ...decodedId,
                },
            };
        } catch (err) {
            console.error("JWT decode failed", err);
            return null;
        }
    }, [isTokenExpired]);

    // ============================
    // Init from portal storage
    // ============================
    useEffect(() => {
        if (!mode) {
            setIsLoading(false);
            return;
        }

        const accessToken = localStorage.getItem(storageKey("accessToken"));
        const idToken = localStorage.getItem(storageKey("idToken"));

        if (accessToken) {
            const userObj = constructUser(accessToken, idToken);
            if (userObj) {
                setUser(userObj);
            } else {
                signOut();
            }
        }

        setIsLoading(false);
    }, [mode, storageKey, constructUser]);

    // ============================
    // Sign in (portal scoped)
    // ============================
    const signIn = useCallback((authResult) => {
            const { AccessToken, IdToken, RefreshToken } =
                authResult.AuthenticationResult;

            localStorage.setItem(storageKey("accessToken"), AccessToken);
            localStorage.setItem(storageKey("idToken"), IdToken);

            if (RefreshToken) {
                localStorage.setItem(storageKey("refreshToken"), RefreshToken);
            }

            setUser(constructUser(AccessToken, IdToken));
        },
        [storageKey, constructUser]
    );

    // ============================
    // Sign out (portal scoped)
    // ============================
    const signOut = useCallback(() => {
        localStorage.removeItem(storageKey("accessToken"));
        localStorage.removeItem(storageKey("idToken"));
        localStorage.removeItem(storageKey("refreshToken"));
        setUser(null);
    }, [storageKey]);

    // Check token expiration on visibility change (tab becomes active)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                if (isTokenExpired(user.access_token)) {
                    console.log("Session expired while idle, signing out");
                    signOut();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [user, isTokenExpired, signOut]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isTokenExpired,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
