import './index.css';
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatPage from "./chat/chatPage";
import { UserProvider } from "./context/UserContext";
import LogoutPage from "./auth/LogoutPage";

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <BrowserRouter>
    <AuthProvider>
      <UserProvider>
        <Routes>
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/chat/:clientId/:avatarId" element={<ChatPage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </UserProvider>
    </AuthProvider>
  </BrowserRouter>
);