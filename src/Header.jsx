import { Brain, LogOut, Trash2, User } from "lucide-react";
import "./header.css";

export default function Header({ role }) {
  return (
      <header className="hamo-header">
        <div className="hamo-header__left">
          <div className="hamo-logo">
            <Brain size={40} />
          </div>
          <div>
            <h1 className="hamo-title">
              {role === "THERAPIST" ? "Hamo Pro" : "Hamo Client"}
            </h1>
            <p className="hamo-subtitle">
              {role === "THERAPIST"
                  ? "AI Therapy Avatar Console"
                  : "AI Therapy Assistant"}
            </p>
          </div>
        </div>
      </header>
  );
}
