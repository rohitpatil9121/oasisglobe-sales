import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Overview from "./pages/Overview.jsx";
import Leads from "./pages/Leads.jsx";
import Orders from "./pages/Orders.jsx";
import Team from "./pages/Team.jsx";

export default function App() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/team" element={<Team />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
