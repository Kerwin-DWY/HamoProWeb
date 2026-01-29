import './index.css';
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatPage from "./chat/chatPage";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./auth/AuthProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
// For Develop -> http://localhost:5174/pro and http://localhost:5174/app
root.render(
    <BrowserRouter>
        <UserProvider>
            <Routes>
                <Route
                    path="/app/*"
                    element={
                        <AuthProvider mode="app">
                            <App portal="app" />
                        </AuthProvider>
                    }
                />

                <Route
                    path="/pro/*"
                    element={
                        <AuthProvider mode="pro">
                            <App portal="pro" />
                        </AuthProvider>
                    }
                />

                <Route
                    path="/chat/:clientId/:avatarId"
                    element={
                        <AuthProvider mode="app">
                            <ChatPage />
                        </AuthProvider>
                    }
                />

                <Route
                    path="/pro/chat/:clientId/:avatarId"
                    element={
                        <AuthProvider mode="pro">
                            <ChatPage />
                        </AuthProvider>
                    }
                />

            </Routes>
        </UserProvider>
    </BrowserRouter>
);
