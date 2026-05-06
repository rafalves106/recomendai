import { Bot, LayoutDashboard, Package, Sparkles, Users } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Recomendações", to: "/admin/recomendacoes", icon: Sparkles },
  { label: "Produtos", to: "/admin/produtos", icon: Package },
  { label: "Usuários", to: "/admin/usuarios", icon: Users },
  { label: "Simulação", to: "/admin/simulacao", icon: Bot },
];

const titleMap: Record<string, string> = {
  "/admin": "Visão Geral",
  "/admin/recomendacoes": "Recomendações",
  "/admin/produtos": "Produtos",
  "/admin/usuarios": "Usuários",
  "/admin/simulacao": "Simulação",
};

export function AdminLayout() {
  const location = useLocation();
  const pageTitle = titleMap[location.pathname] ?? "Visão Geral";

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-[240px] flex-col border-r border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-6 py-6">
          <Link to="/" className="flex items-center gap-1 text-lg font-bold">
            <span className="text-white">Recomenda</span>
            <span className="text-cyan-400">.AI</span>
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">
            Dashboard Admin
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-glow"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 px-4 py-4">
          <p className="text-xs text-slate-600">Recomenda.AI v1.0</p>
          <p className="text-xs text-slate-600">Motor Híbrido de IA</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-slate-950">
        <header className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Painel Administrativo
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white">{pageTitle}</h1>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            IA Ativa
          </span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
