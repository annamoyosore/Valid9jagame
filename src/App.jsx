import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import GameRoom from "./pages/GameRoom";
import Game from "./pages/Game";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      <Route path="/wallet" element={
        <ProtectedRoute><Wallet /></ProtectedRoute>
      } />

      <Route path="/game-room" element={
        <ProtectedRoute><GameRoom /></ProtectedRoute>
      } />

      <Route path="/game/:id" element={
        <ProtectedRoute><Game /></ProtectedRoute>
      } />
    </Routes>
  );
}