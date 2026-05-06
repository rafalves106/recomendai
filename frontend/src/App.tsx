import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { StoreLayout } from "./layouts/StoreLayout";
import { Loader2 } from "lucide-react";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const AdminOverviewPage = lazy(() => import("./pages/AdminOverviewPage"));
const AdminRecommendationsPage = lazy(
  () => import("./pages/AdminRecommendationsPage"),
);
const AdminProductsPage = lazy(() => import("./pages/AdminProductsPage"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));
const AdminSimulationPage = lazy(() => import("./pages/AdminSimulationPage"));

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4 text-center text-slate-200">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          Carregando Recomenda.AI
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/produto/:id" element={<ProductDetailPage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmacao" element={<ConfirmationPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route
            path="/admin/recomendacoes"
            element={<AdminRecommendationsPage />}
          />
          <Route path="/admin/produtos" element={<AdminProductsPage />} />
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
          <Route path="/admin/simulacao" element={<AdminSimulationPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
