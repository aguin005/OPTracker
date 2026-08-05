import React, { useState, useEffect } from "react";
import { getCurrentUser, logout } from "./api";
import LoginScreen from "./components/LoginScreen";
import OnePieceTracker from "./components/OnePieceTracker";

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.id ? data : null))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  async function handleLogout() {
    await logout().catch((err) => console.error("Logout failed", err));
    setUser(null);
  }

  if (checkingSession) {
    // Same background as both screens so this doesn't flash white on load.
    return <div className="min-h-screen bg-[#0F3652]" />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <OnePieceTracker user={user} onLogout={handleLogout} />;
}