import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  });

  const sync = (next) => {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const addOrUpdateItem = (product, quantity) => {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return;
    }

    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      sync(
        items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + qty } : i
        )
      );
      return;
    }

    sync([
      ...items,
      {
        productId: product.id,
        name: product.name,
        sizeDescription: product.sizeDescription,
        imageUrl: product.imageUrl,
        quantity: qty
      }
    ]);
  };

  const removeItem = (productId) => {
    sync(items.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    sync([]);
  };

  const value = useMemo(
    () => ({ items, addOrUpdateItem, removeItem, clearCart }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
