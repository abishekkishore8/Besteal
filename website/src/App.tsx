import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './pages/CustomerPortal';
import { RequirementDetailPage } from './pages/RequirementDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { SellerPortal } from './pages/SellerPortal';
import { AdminPortal } from './pages/AdminPortal';

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Buyer / Customer Endpoints */}
          <Route path="/" element={<CustomerPortal />} />
          <Route path="/requirements/:id" element={<RequirementDetailPage />} />
          <Route path="/checkout/:quoteId" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<OrderTrackingPage />} />

          {/* Seller Portal Endpoint */}
          <Route path="/seller" element={<SellerPortal />} />

          {/* Enterprise Admin Endpoint */}
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </ToastProvider>
  );
}
