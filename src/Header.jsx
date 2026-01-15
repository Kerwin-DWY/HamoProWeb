import { Brain, LogOut, Trash2, User } from "lucide-react";
import "./header.css";

export default function Header({

}) {
  return (
    <header className="hamo-header">
      <div className="hamo-header__left">
        <div className="hamo-logo">
          <Brain size={40} />
        </div>
        <div>
          <h1 className="hamo-title">Hamo Pro</h1>
          <p className="hamo-subtitle">AI Therapy Avatar Console</p>
        </div>
      </div>
    </header>
  );
}
