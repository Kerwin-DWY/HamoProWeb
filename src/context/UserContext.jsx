import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [chats, setChats] = useState([]);

    return (
        <UserContext.Provider
            value={{
                profile,
                setProfile,
                chats,
                setChats,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
