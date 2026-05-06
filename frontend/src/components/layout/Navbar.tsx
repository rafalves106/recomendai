import { useState } from "react";
import {
  BarChart2,
  ChevronRight,
  Grid2X2,
  Menu,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useStore from "../../store";
import { trackSearch } from "../../services/events";

export function Navbar() {
  const navigate = useNavigate();
  const totalItems = useStore((state) => state.getTotalItems());
  const cartItems = useStore((state) => state.items);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = async () => {
    if (searchValue.trim()) {
      await trackSearch(searchValue.trim());
      navigate(`/produtos?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch();
    setIsMobileSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-1 text-lg font-bold">
            <span className="text-white">Recomenda</span>
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-cyan-400">.AI</span>
          </Link>

          <form
            onSubmit={handleSubmit}
            className="hidden w-full max-w-md flex-1 items-center gap-2 md:flex"
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar produtos..."
                className="w-full rounded-full border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-full border border-slate-700 bg-slate-800 p-3 text-slate-100 hover:border-indigo-500 transition"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="hidden items-center gap-4 md:flex">
            <NavLink
              to="/produtos"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 text-sm font-medium transition ${
                  isActive ? "text-white" : "text-slate-300 hover:text-white"
                }`
              }
            >
              <Grid2X2 className="h-4 w-4" />
              Produtos
            </NavLink>

            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 text-sm font-medium transition ${
                  isActive ? "text-white" : "text-slate-300 hover:text-white"
                }`
              }
            >
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <BarChart2 className="h-4 w-4" />
              Dashboard
            </NavLink>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center rounded-full border border-slate-700 bg-slate-800 p-3 text-slate-100 transition hover:border-indigo-500"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-indigo-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {totalItems}
                </span>
              ) : null}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((open) => !open)}
              className="rounded-full border border-slate-700 bg-slate-800 p-3 text-slate-100"
              aria-label="Abrir busca"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full border border-slate-700 bg-slate-800 p-3 text-slate-100"
              aria-label="Abrir carrinho"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-indigo-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {totalItems}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="rounded-full border border-slate-700 bg-slate-800 p-3 text-slate-100"
              aria-label="Abrir dashboard"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isMobileSearchOpen ? (
          <div className="border-t border-slate-800 px-4 py-4 md:hidden">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar produtos..."
                  className="w-full rounded-full border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchValue("");
                  setIsMobileSearchOpen(false);
                }}
                className="rounded-full border border-slate-700 bg-slate-800 p-3 text-slate-100"
                aria-label="Fechar busca"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : null}
      </header>

      {isCartOpen ? (
        <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/70">
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0"
            aria-label="Fechar carrinho"
          />
          <aside className="relative flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                  Carrinho
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Itens selecionados
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-full border border-slate-700 bg-slate-800 p-2 text-slate-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {item.product.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-cyan-400">
                        R${" "}
                        {(item.product.price * item.quantity)
                          .toFixed(2)
                          .replace(".", ",")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-6 text-sm text-slate-400">
                  Seu carrinho está vazio.
                </div>
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="mt-6 space-y-3 border-t border-slate-800 pt-6">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total</span>
                  <span className="font-bold text-white">
                    R${" "}
                    {cartItems
                      .reduce(
                        (acc, item) => acc + item.product.price * item.quantity,
                        0,
                      )
                      .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Botão: Ver carrinho completo */}
                <Link
                  to="/carrinho"
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Ver Carrinho Completo
                </Link>

                {/* Botão: Finalizar compra direto */}
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Finalizar Compra
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
