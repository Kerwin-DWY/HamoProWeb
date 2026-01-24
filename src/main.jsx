import './index.css';
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthCallback from "./auth/AuthCallback";
import ChatPage from "./chat/chatPage";
import {UserProvider} from "./context/UserContext";
import LoginPage from "./auth/LoginPage";
import LogoutPage from "./auth/LogoutPage";

const redirect_uri = `${window.location.origin}/callback`;
const post_logout_redirect_uri = window.location.origin;
const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-east-1.amazonaws.com/ap-east-1_schnkEBdb",
  client_id: "3ml5mut2nqeqdbfk86eeifnjrg",
  redirect_uri,
  post_logout_redirect_uri,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid phone profile",
  automaticSilentRenew: true,
  loadUserInfo: true,
  userStore: new WebStorageStateStore({
    store: window.localStorage,
  }),
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// wrap the application with AuthProvider
root.render(
  <BrowserRouter>
    <AuthProvider {...cognitoAuthConfig}>
      <UserProvider>
        <Routes>
          <Route path="/callback" element={<AuthCallback />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/chat/:clientId/:avatarId" element={<ChatPage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </UserProvider>
    </AuthProvider>
  </BrowserRouter>
);