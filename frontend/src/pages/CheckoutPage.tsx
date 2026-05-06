import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { FormEvent } from "react";
import { useStore } from "../store";
import { trackPurchase } from "../services/events";
import { Lock, ShoppingBag, Loader2 } from "lucide-react";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart, getTotalPrice } = useStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  // Redirect if cart is empty
  if (items.length === 0 && !isProcessing) {
    navigate("/carrinho");
    return null;
  }

  const totalPrice = getTotalPrice();

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof form> = {};

    if (!form.name || form.name.length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    if (!form.address || form.address.length < 5) {
      newErrors.address = "Endereço inválido";
    }

    if (!form.city || form.city.length < 2) {
      newErrors.city = "Cidade inválida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Track purchase
      await trackPurchase(items.map((item) => item.product.id));

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1800));

      // Copy items before clearing
      const orderedItems = items.slice();

      // Clear cart
      clearCart();

      // Navigate to confirmation
      navigate("/confirmacao", {
        state: {
          orderId: `ORD-${Date.now()}`,
          customerName: form.name,
          items: orderedItems,
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Data */}
              <div className="bg-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Dados Pessoais
                </h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Endereço de Entrega
                </h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Rua, número, complemento"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.address && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.city && (
                      <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Finalizar Compra
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Seu Pedido</h2>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 pb-3 border-b border-slate-700"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.quantity}x R${" "}
                        {item.product.price.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700 pt-4">
                <div className="text-lg font-bold text-white">
                  Total: R${" "}
                  {totalPrice.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </div>

              <p className="text-xs text-slate-500 italic mt-4">
                🔒 Pagamento 100% simulado para fins acadêmicos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
