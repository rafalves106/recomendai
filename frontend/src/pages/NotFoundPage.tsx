import { Link } from "react-router-dom";
import { SearchX, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="text-8xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            404
          </div>
        </div>

        <SearchX className="mx-auto mb-8 h-16 w-16 text-slate-600" />

        <h1 className="text-2xl font-bold text-white">Página não encontrada</h1>
        <p className="mt-3 text-slate-400">
          Parece que essa página não existe ou foi movida.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            <Home className="h-4 w-4" />
            Voltar para Home
          </Link>
          <Link
            to="/produtos"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-100 transition hover:border-slate-600 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver Produtos
          </Link>
        </div>
      </div>
    </div>
  );
}
