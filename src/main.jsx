import './index.css';
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthCallback from "./auth/AuthCallback";
import ChatPage from "./chat/chatPage";
import {UserProvider} from "./context/UserContext";

const redirect_uri = `${window.location.origin}/callback`;
const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-east-1.amazonaws.com/ap-east-1_schnkEBdb",
  client_id: "3ml5mut2nqeqdbfk86eeifnjrg",
  //redirect_uri: "https://qualemind.com/callback", // production
  //redirect_uri: "http://localhost:5174/callback", // development
  redirect_uri,
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
          <Route path="/chat/:clientId" element={<ChatPage />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </UserProvider>
    </AuthProvider>
  </BrowserRouter>
);