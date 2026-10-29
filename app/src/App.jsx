import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSales } from "./store/SalesContext.jsx";
import { Shell, BottomNav, Skeleton } from "./components/ui.jsx";
import Login from "./screens/Login.jsx";
import Home from "./screens/Home.jsx";

const Leads = lazy(() => import("./screens/Leads.jsx"));
const NewLead = lazy(() => import("./screens/NewLead.jsx"));
const LeadDetail = lazy(() => import("./screens/LeadDetail.jsx"));
const Orders = lazy(() => import("./screens/Orders.jsx"));
const Catalog = lazy(() => import("./screens/Catalog.jsx"));
const MyWork = lazy(() => import("./screens/MyWork.jsx"));

const Loading = () => <div className="p-4"><Skeleton className="h-24 w-full rounded-2xl" /></div>;

// A bottom-tab screen: scrolling content above the nav bar.
const Tabbed = ({ children }) => (
  <Shell>
    <div className="safe-top flex-1 overflow-y-auto px-4 pb-4">
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
    <BottomNav />
  </Shell>
);
// A full screen with its own header and back button.
const Full = ({ children }) => (
  <Shell><Suspense fallback={<Loading />}>{children}</Suspense></Shell>
);

export default function App() {
  const { user } = useSales();
  if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>;
  return (
    <Routes>
      <Route path="/home" element={<Tabbed><Home /></Tabbed>} />
      <Route path="/leads" element={<Tabbed><Leads /></Tabbed>} />
      <Route path="/orders" element={<Tabbed><Orders /></Tabbed>} />
      <Route path="/catalog" element={<Tabbed><Catalog /></Tabbed>} />
      <Route path="/work" element={<Tabbed><MyWork /></Tabbed>} />
      <Route path="/new" element={<Full><NewLead /></Full>} />
      <Route path="/lead/:id" element={<Full><LeadDetail /></Full>} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
