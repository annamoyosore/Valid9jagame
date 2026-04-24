import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import GameRoom from "./pages/GameRoom";
import Game from "./pages/Game";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* 🌐 Landing handles login now */}
      <Route path="/" element={<Landing />} />

      {/* 🔐 PROTECTED ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        }
      />

      <Route
        path="/game-room"
        element={
          <ProtectedRoute>
            <GameRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/game/:id"
        element={
          <ProtectedRoute>
            <Game />
          </ProtectedRoute>
        }
      />

      {/* ✅ fallback */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}