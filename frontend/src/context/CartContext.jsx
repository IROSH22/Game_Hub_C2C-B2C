import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('gamehub_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Ensure each item has selected initialized (default true)
      return parsed.map((item) => ({
        ...item,
        selected: item.selected !== false,
      }));
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('gamehub_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const addToCart = (game, quantity = 1) => {
    setCart((prev) => {
      const targetId = game._id || game.listingId;
      const existing = prev.find((item) => item.listingId === targetId);
      if (existing) {
        return prev.map((item) =>
          item.listingId === targetId
            ? {
                ...item,
                quantity: Math.min(game.stock || 99, item.quantity + quantity),
                selected: true,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          listingId: targetId,
          sellerId: game.sellerId?._id || game.sellerId,
          title: game.title,
          price: game.price,
          platform: game.platform,
          imageUrl: game.imageUrl,
          condition: game.condition,
          stock: game.stock || 1,
          quantity: Math.min(game.stock || 1, quantity),
          selected: true,
        },
      ];
    });
  };

  const removeFromCart = (listingId) => {
    setCart((prev) => prev.filter((item) => item.listingId !== listingId));
  };

  const updateQuantity = (listingId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(listingId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.listingId === listingId) {
          const validQty = Math.min(item.stock || 99, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const toggleSelectItem = (listingId) => {
    setCart((prev) =>
      prev.map((item) =>
        item.listingId === listingId
          ? { ...item, selected: item.selected === false }
          : item
      )
    );
  };

  const selectAllItems = (selectAll = true) => {
    setCart((prev) => prev.map((item) => ({ ...item, selected: selectAll })));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon('');
    setCouponDiscount(0);
  };

  // Remove only the items that were checked/selected for purchase
  const removePurchasedItems = () => {
    setCart((prev) => {
      const remaining = prev.filter((item) => item.selected === false);
      if (remaining.length === 0) {
        setCoupon('');
        setCouponDiscount(0);
      }
      return remaining;
    });
  };

  const applyCoupon = (code) => {
    if (code.trim().toUpperCase() === 'GAMER10') {
      setCoupon('GAMER10');
      setCouponDiscount(0.1); // 10%
      return { success: true, message: '🎉 Coupon GAMER10 applied! 10% discount added.' };
    }
    return { success: false, message: 'Invalid promo code. Try "GAMER10"!' };
  };

  const removeCoupon = () => {
    setCoupon('');
    setCouponDiscount(0);
  };

  // Selected items calculations
  const selectedItems = cart.filter((item) => item.selected !== false);
  const selectedItemsCount = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  const allSelected = cart.length > 0 && selectedItems.length === cart.length;
  const hasSelected = selectedItems.length > 0;

  // Financial totals calculated strictly on SELECTED items
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = subtotal * couponDiscount;
  const shippingFee = subtotal > 60 || selectedItems.length === 0 ? 0 : 4.99;
  const totalAmount = Math.max(0, subtotal - discountAmount + (selectedItems.length > 0 ? shippingFee : 0));
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        selectedItems,
        selectedItemsCount,
        allSelected,
        hasSelected,
        toggleSelectItem,
        selectAllItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        removePurchasedItems,
        applyCoupon,
        removeCoupon,
        coupon,
        couponDiscount,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

