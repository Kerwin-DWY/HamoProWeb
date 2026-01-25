import { useAuth } from "./AuthProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPage() {
    const auth = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        auth.signOut();
        navigate("/");
    }, [auth, navigate]);

    return null;
}
