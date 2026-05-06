import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-1 text-lg font-bold">
            <span className="text-white">Recomenda</span>
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-cyan-400">.AI</span>
          </Link>
          <p className="max-w-sm text-sm leading-6 text-slate-400">
            Sistema de recomendação com IA para e-commerce. Personalização
            inteligente para cada cliente.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Navegação
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>
              <Link to="/" className="transition hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/produtos" className="transition hover:text-white">
                Produtos
              </Link>
            </li>
            <li>
              <Link to="/carrinho" className="transition hover:text-white">
                Carrinho
              </Link>
            </li>
            <li>
              <Link to="/admin" className="transition hover:text-white">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Tecnologia
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>React + TypeScript</li>
            <li>Python + FastAPI</li>
            <li>SQLite</li>
            <li>Motor de IA Híbrido</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2025 Recomenda.AI — Projeto Acadêmico</p>
          <p>Desenvolvido com ❤️ e IA</p>
        </div>
      </div>
    </footer>
  );
}
