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

    const constructUser = useCallback((accessToken, idToken) => {
        if (!accessToken) return null;

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
    }, []);

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

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
