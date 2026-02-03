/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [cart, setCart] = useState<{ productId: number; quantity: number }[]>(
    [],
  );
  const [isMember, setIsMember] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3001/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- Functions ---

  const addToCart = (productId: number) => {
    setResult(null);
    setCart((prev) => {
      const exist = prev.find((p) => p.productId === productId);
      if (exist) {
        return prev.map((p) =>
          p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p,
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setResult(null);
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (productId: number) => {
    setResult(null);
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setResult(null);
    setIsMember(false);
  };

  const calculate = async () => {
    try {
      const res = await fetch("http://localhost:3001/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, isMember }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      alert(
        "Cannot connect to Backend API. Please check if NestJS is running.",
      );
      console.error("Error:", error);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-blue-600">
            🛒 Food Store
          </h1>
          <p className="text-gray-500">
            Calculator & Checkout System (Live Data)
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Menu Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">📋</span> Menu List
            </h2>

            {/* เช็คสถานะ Loading */}
            {isLoading ? (
              <div className="text-center py-10 text-gray-400 animate-pulse">
                Loading Menu...
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center py-3"
                  >
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-blue-500 text-sm font-medium">
                        {p.price} THB
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(p.id)}
                      className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Section */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-bold">Your Order</h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-400 text-xs hover:text-red-600 transition"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300 italic">Your cart is empty...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-75 overflow-y-auto pr-2">
                    {cart.map((item) => {
                      const product = products.find(
                        (p) => p.id === item.productId,
                      );
                      if (!product) return null;

                      return (
                        <div
                          key={item.productId}
                          className="flex justify-between items-center group"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-bold">{product.name}</p>
                            <p className="text-xs text-gray-400">
                              {product.price * item.quantity} THB
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, -1)
                                }
                                className="px-2 py-1 hover:bg-gray-200"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-bold min-w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, 1)
                                }
                                className="px-2 py-1 hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="text-gray-300 hover:text-red-500 transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t space-y-4">
                    <label className="flex items-center cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isMember}
                          onChange={(e) => {
                            setIsMember(e.target.checked);
                            setResult(null);
                          }}
                        />
                        <div
                          className={`w-10 h-5 rounded-full transition shadow-inner ${isMember ? "bg-green-400" : "bg-gray-300"}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform ${isMember ? "translate-x-5" : ""}`}
                        ></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-gray-900">
                        Member Card (10% Off)
                      </span>
                    </label>

                    <button
                      onClick={calculate}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      Calculate Total
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Result Summary */}
            {result && (
              <div className="bg-green-600 text-white p-6 rounded-2xl shadow-xl animate-[fadeIn_0.3s_ease-out]">
                <h3 className="text-lg font-bold mb-4 border-b border-green-500 pb-2">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between opacity-90">
                    <span>Subtotal:</span>
                    <span>{result.subTotal.toLocaleString()} THB</span>
                  </div>
                  {result.discounts.bulk > 0 && (
                    <div className="flex justify-between text-green-200">
                      <span>Bulk Discount (5%):</span>
                      <span>-{result.discounts.bulk.toLocaleString()} THB</span>
                    </div>
                  )}
                  {result.discounts.member > 0 && (
                    <div className="flex justify-between text-green-200">
                      <span>Member Discount (10%):</span>
                      <span>
                        -{result.discounts.member.toLocaleString()} THB
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-extrabold mt-4 pt-4 border-t border-green-500">
                    <span>Final Price:</span>
                    <span>{result.finalPrice.toLocaleString()} THB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
