import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "../../types";
import { trackRemoveFromCart } from "../../services/events";

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const handleRemove = async () => {
    await trackRemoveFromCart(item.product.id);
    onRemove(item.product.id);
  };

  const handleMinus = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.product.id, item.quantity - 1);
    }
  };

  const handlePlus = () => {
    onQuantityChange(item.product.id, item.quantity + 1);
  };

  const subtotal = item.product.price * item.quantity;

  return (
    <div className="bg-slate-800 rounded-2xl p-4 flex gap-4 items-start md:items-center">
      {/* Product Image */}
      <Link
        to={`/produto/${item.product.id}`}
        className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden hover:opacity-80 transition-opacity"
      >
        <img
          src={item.product.imageUrl}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/produto/${item.product.id}`}
          className="font-semibold text-white hover:text-indigo-300 transition-colors block truncate"
        >
          {item.product.name}
        </Link>
        <span className="text-xs text-slate-400 px-2 py-1 bg-slate-700 rounded-full inline-block mt-1">
          {item.product.category}
        </span>
        <p className="text-sm text-slate-400 mt-1">
          R${" "}
          {item.product.price.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-1">
        <button
          onClick={handleMinus}
          disabled={item.quantity === 1}
          className="p-1 rounded-full hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-4 h-4 text-white" />
        </button>
        <span className="text-white font-bold w-8 text-center">
          {item.quantity}
        </span>
        <button
          onClick={handlePlus}
          className="p-1 rounded-full hover:bg-slate-600 transition-colors"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-white font-bold text-lg w-24 text-right">
        R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors p-2"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}
