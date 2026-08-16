import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Home } from "./pages/Home";
import { DelivererHome } from "./pages/DelivererHome";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Catalog } from "./pages/Catalog";
import { Deposit } from "./pages/Deposit";
import { History } from "./pages/History";
import { Library } from "./pages/Library";
import { MyDeposits } from "./pages/MyDeposits";
import { MyOrders } from "./pages/MyOrders";
import { WalletPage } from "./pages/WalletPage";
import { Deliveries } from "./pages/Deliveries";
import { isDelivererOnly } from "./utils/roles";
function StudentRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (isDelivererOnly(user)) return <Navigate to="/deliverer" replace />;
  return <>{children}</>;
}

/** Pages réservées aux livreurs */
function DelivererRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isDelivererOnly(user) && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function HomeRouter() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (isDelivererOnly(user)) return <Navigate to="/deliverer" replace />;
  return <Home />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRouter />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Espace livreur */}
      <Route path="/deliverer" element={<DelivererRoute><DelivererHome /></DelivererRoute>} />
      <Route path="/deliveries" element={<DelivererRoute><Deliveries /></DelivererRoute>} />

      {/* Espace élèves / parents */}
      <Route path="/catalog" element={<StudentRoute><Catalog /></StudentRoute>} />
      <Route path="/deposit" element={<StudentRoute><Deposit /></StudentRoute>} />
      <Route path="/history" element={<StudentRoute><History /></StudentRoute>} />
      <Route path="/library" element={<StudentRoute><Library /></StudentRoute>} />
      <Route path="/my-deposits" element={<StudentRoute><MyDeposits /></StudentRoute>} />
      <Route path="/my-orders" element={<StudentRoute><MyOrders /></StudentRoute>} />
      <Route path="/wallet" element={<StudentRoute><WalletPage /></StudentRoute>} />
    </Routes>
  );
}

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={4000} />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
