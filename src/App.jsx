import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import GameRoom from "./pages/GameRoom";
import Game from "./pages/Game";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* 🔥 DEFAULT PAGE */}
      <Route path="/" element={<Login />} />

      {/* (optional) keep /login too */}
      <Route path="/login" element={<Login />} />

      {/* 🔐 PROTECTED */}
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
    </Routes>
  );
}