import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const addToCart = (gymPackage) => {
    setCart((prevCart) => {
      // For products with variants
      if (gymPackage.selectedVariant && !gymPackage.gymId) {
        const cartItemId = `${gymPackage.id}-${gymPackage.selectedVariant.id}`;
        
        // Check if same product with same variant exists
        const existingItemIndex = prevCart.findIndex(
          (item) =>
            item.id === gymPackage.id &&
            item.selectedVariant?.id === gymPackage.selectedVariant.id
        );

        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          const updatedCart = [...prevCart];
          const newQuantity = updatedCart[existingItemIndex].quantity + (gymPackage.quantity || 1);
          const maxQuantity = gymPackage.selectedVariant.quantity;
          
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: Math.min(newQuantity, maxQuantity),
          };
          return updatedCart;
        }

        // Add new product item to cart
        const newCartItem = {
          ...gymPackage,
          cartItemId,
          quantity: gymPackage.quantity || 1,
          dateAdded: new Date().toISOString(),
        };

        return [...prevCart, newCartItem];
      }

      // For gym/PT packages (legacy support)
      const cartItemId =
        gymPackage.type === "WithPt" && gymPackage.pt
          ? `${gymPackage.gymId}-${gymPackage.id}-${gymPackage.pt.id}`
          : `${gymPackage.gymId}-${gymPackage.id}`;

      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex((item) => {
        if (gymPackage.type === "WithPt" && gymPackage.pt) {
          return (
            item.gymId === gymPackage.gymId &&
            item.id === gymPackage.id &&
            item.pt?.id === gymPackage.pt.id
          );
        } else {
          return item.gymId === gymPackage.gymId && item.id === gymPackage.id;
        }
      });

      if (existingItemIndex !== -1) {
        // Item already exists, you might want to show a message or update quantity
        return prevCart;
      }

      // Add new item to cart
      const newCartItem = {
        ...gymPackage,
        cartItemId,
        quantity: 1, // You can add quantity management if needed
        dateAdded: new Date().toISOString(),
      };

      return [...prevCart, newCartItem];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.cartItemId !== cartItemId)
    );
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedVoucher(null); // Clear voucher when clearing cart
  };

  const getCartCount = () => {
    return cart.length;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      // For products with variants, use selectedVariant price
      const itemPrice = item.selectedVariant?.salePrice || item.price || item.salePrice;
      return total + itemPrice * (item.quantity || 1);
    }, 0);
  };

  // Check if a specific package is in cart
  const isPackageInCart = (gymId, packageId, ptId = null) => {
    return cart.some((item) => {
      if (ptId) {
        return (
          item.gymId === gymId && item.id === packageId && item.pt?.id === ptId
        );
      }
      return item.gymId === gymId && item.id === packageId;
    });
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getTotalPrice,
    isPackageInCart,
    selectedVoucher,
    setSelectedVoucher,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
