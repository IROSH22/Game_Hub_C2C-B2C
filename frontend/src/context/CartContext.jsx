import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('gamehub_cart');
      return saved ? JSON.parse(saved) : [];
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
      const existing = prev.find((item) => item.listingId === (game._id || game.listingId));
      if (existing) {
        return prev.map((item) =>
          item.listingId === (game._id || game.listingId)
            ? { ...item, quantity: Math.min(game.stock || 99, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          listingId: game._id || game.listingId,
          sellerId: game.sellerId?._id || game.sellerId,
          title: game.title,
          price: game.price,
          platform: game.platform,
          imageUrl: game.imageUrl,
          condition: game.condition,
          stock: game.stock || 1,
          quantity: Math.min(game.stock || 1, quantity),
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

  const clearCart = () => {
    setCart([]);
    setCoupon('');
    setCouponDiscount(0);
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

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = subtotal * couponDiscount;
  const shippingFee = subtotal > 60 || cart.length === 0 ? 0 : 4.99;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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
