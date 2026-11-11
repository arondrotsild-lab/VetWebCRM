import { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { useIsMobile } from './lib/format';
import Layout from './components/Layout';
import MobileHome from './components/MobileHome';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FinancePage from './pages/FinancePage';
import UnitPage from './pages/UnitPage';
import MarketingPage from './pages/MarketingPage';
import OrdersPage, { OrderDetailPage } from './pages/OrdersPage';
import ClientsPage, { ClientDetailPage } from './pages/ClientsPage';
import PetsPage from './pages/PetsPage';
import VetsPage, { VetDetailPage } from './pages/VetsPage';
import ServicesPage from './pages/ServicesPage';
import ShopPage from './pages/ShopPage';

function Private({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function Home() {
  // На телефоне главная — плитки разделов, на компьютере — сразу сводка с графиками
  return useIsMobile() ? <MobileHome /> : <DashboardPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Private><Home /></Private>} />
          <Route path="/summary" element={<Private><DashboardPage /></Private>} />
          <Route path="/finance" element={<Private><FinancePage /></Private>} />
          <Route path="/unit" element={<Private><UnitPage /></Private>} />
          <Route path="/marketing" element={<Private><MarketingPage /></Private>} />
          <Route path="/orders" element={<Private><OrdersPage /></Private>} />
          <Route path="/orders/:id" element={<Private><OrderDetailPage /></Private>} />
          <Route path="/clients" element={<Private><ClientsPage /></Private>} />
          <Route path="/clients/:id" element={<Private><ClientDetailPage /></Private>} />
          <Route path="/pets" element={<Private><PetsPage /></Private>} />
          <Route path="/vets" element={<Private><VetsPage /></Private>} />
          <Route path="/vets/:id" element={<Private><VetDetailPage /></Private>} />
          <Route path="/services" element={<Private><ServicesPage /></Private>} />
          <Route path="/shop" element={<Private><ShopPage /></Private>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
