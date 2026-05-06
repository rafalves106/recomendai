import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import useStore from "../store";
import { trackRemoveFromCart } from "../services/events";

export function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    getTotalItems,
    getTotalPrice,
    updateQuantity,
    removeFromCart,
  } = useStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const formatPrice = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  const handleRemove = (productId: string) => {
    trackRemoveFromCart(productId);
    removeFromCart(productId);
  };

  // ── Estado vazio ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-24 px-4">
        <ShoppingCart className="mb-6 h-24 w-24 text-slate-600" />
        <h1 className="mb-2 text-3xl font-bold text-white">
          Seu carrinho está vazio
        </h1>
        <p className="mb-8 text-slate-400">
          Comece a adicionar produtos para sua compra!
        </p>
        <Link
          to="/produtos"
          className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-500"
        >
          Explorar Produtos
        </Link>
      </div>
    );
  }

  // ── Carrinho com itens ────────────────────────────────────────────────────
  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-white">
          Carrinho ({totalItems} {totalItems === 1 ? "item" : "itens"})
        </h1>

        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* ── Coluna esquerda: itens ─────────────────────────────────── */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 rounded-2xl bg-slate-800 p-4"
              >
                {/* Imagem */}
                <Link to={`/produto/${item.product.id}`} className="shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div>
                    <Link
                      to={`/produto/${item.product.id}`}
                      className="font-semibold text-white transition hover:text-indigo-300"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-400">
                      R$ {formatPrice(item.product.price)} cada
                    </p>
                  </div>

                  {/* Controles de quantidade */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="w-6 text-center font-bold text-white">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-white transition hover:bg-slate-600"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-white">
                        R$ {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.product.id)}
                        className="text-red-400 transition hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/produtos"
              className="inline-flex items-center gap-2 pt-4 text-slate-400 transition hover:text-indigo-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Continuar Comprando
            </Link>
          </div>

          {/* ── Coluna direita: resumo ─────────────────────────────────── */}
          <div className="self-start lg:sticky lg:top-24">
            <div className="rounded-2xl bg-slate-800 p-6">
              <h2 className="mb-6 text-xl font-bold text-white">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className="font-semibold text-emerald-400">Grátis</span>
                </div>
              </div>

              <div className="my-4 border-t border-slate-700" />

              <div className="mb-6 flex justify-between">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-xl font-bold text-white">
                  R$ {formatPrice(totalPrice)}
                </span>
              </div>

              {/* ✅ BOTÃO FINALIZAR COMPRA */}
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-semibold text-white transition hover:bg-indigo-500"
              >
                Finalizar Compra
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-4 space-y-1 text-xs text-slate-500">
                <p>🔒 Compra segura</p>
                <p>✓ Dados protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
