import { Outlet } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";

export function StoreLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="min-h-screen bg-slate-950">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
