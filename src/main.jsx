import './index.css';
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthCallback from "./auth/AuthCallback";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-east-1.amazonaws.com/ap-east-1_schnkEBdb",
  client_id: "3ml5mut2nqeqdbfk86eeifnjrg",
  //redirect_uri: "https://qualemind.com/callback",
  redirect_uri: "http://localhost:5174/callback",
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
      <Routes>
        <Route path="/callback" element={<AuthCallback />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);