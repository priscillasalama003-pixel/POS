/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Download, 
  Share2, 
  CreditCard, 
  Banknote, 
  Smartphone,
  CheckCircle2,
  Menu,
  ChevronRight
} from 'lucide-react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

import { PRODUCTS } from './constants';
import { Product, CartItem, Receipt } from './types';
import { cn, formatCurrency } from './lib/utils';
import { ReceiptView } from './components/ReceiptView';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<Receipt['paymentMethod']>('Cash');
  const [customerName, setCustomerName] = useState('');

  const receiptRef = useRef<HTMLDivElement>(null);

  const categories = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const receipt: Receipt = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      date: new Date(),
      items: [...cart],
      total,
      paymentMethod,
      customerName: customerName || 'Valued Customer'
    };

    setActiveReceipt(receipt);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#000000', '#ffffff', '#cccccc']
    });
    setCart([]);
    setCustomerName('');
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await toPng(receiptRef.current, { quality: 1, backgroundColor: '#fff' });
      const link = document.createElement('a');
      link.download = `salama-receipt-${activeReceipt?.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download receipt', err);
    }
  };

  const shareToWhatsapp = () => {
    if (!activeReceipt) return;
    const itemsList = activeReceipt.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
    const text = `*SALAMA SPORTS & TALENT HOUSE*\n\nReceipt: #${activeReceipt.id}\nDate: ${new Date(activeReceipt.date).toLocaleDateString()}\nItems: ${itemsList}\nTotal: KES ${activeReceipt.total}\n\nThank you for shopping with us!`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_400px] bg-brand-gray overflow-hidden">
      {/* Main Content */}
      <main className="h-screen overflow-y-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-black flex items-center justify-center text-brand-white">
              <Trophy size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">SALAMA SPORTS</h1>
              <p className="text-[10px] text-brand-black/40 font-mono tracking-widest mt-1 uppercase italic">Talent House & Professional Gear</p>
            </div>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/40 group-focus-within:text-brand-black transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search equipment, jerseys..."
              className="w-full bg-white border-b-2 border-brand-black/10 focus:border-brand-black outline-none px-12 py-4 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2 text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                selectedCategory === cat ? "bg-brand-black text-brand-white border-brand-black" : "bg-white text-brand-black border-brand-black/10 hover:border-brand-black"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                key={product.id}
                className="group relative bg-white border-2 border-brand-black/5 hover:border-brand-black transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-brand-black/40 uppercase tracking-tighter italic">#{product.id} / {product.category}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-10 h-10 bg-brand-black text-brand-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-2 leading-none">{product.name}</h3>
                  <p className="text-sm text-brand-black/60 font-light mb-6 line-clamp-2">{product.description}</p>
                </div>
                <div className="text-2xl font-black font-mono border-t pt-4 border-brand-black/5">
                  {formatCurrency(product.price)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Cart Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-40 w-full md:w-[400px] lg:static bg-white border-l-2 border-brand-black flex flex-col transform transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none",
        isCartOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-8 border-b-2 border-brand-black flex justify-between items-center bg-brand-black text-brand-white">
          <div className="flex items-center gap-3">
            <ShoppingCart size={24} />
            <h2 className="text-xl font-black uppercase tracking-tight">Checkout Counter</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="lg:hidden">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-black/30 text-center gap-4">
              <div className="w-16 h-16 border-2 border-dashed border-brand-black/20 rounded-full flex items-center justify-center opacity-50">
                <Menu size={32} />
              </div>
              <p className="text-sm font-medium italic">Your cart is currently empty.<br/>Start adding premium gear.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="group relative pr-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold uppercase text-sm tracking-tight">{item.name}</h4>
                  <button onClick={() => removeFromCart(item.id)} className="text-brand-black/20 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center bg-brand-gray px-2 py-1 gap-4">
                    <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-brand-black transition-colors"><Minus size={14}/></button>
                    <span className="font-mono font-bold text-xs w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-brand-black transition-colors"><Plus size={14}/></button>
                  </div>
                  <span className="font-mono font-bold text-sm tracking-tighter">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 space-y-6 border-t-2 border-brand-black bg-brand-gray/50">
          <div className="space-y-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-black/40">Customer Details</label>
            <input 
              type="text" 
              placeholder="Full Name / Mobile"
              className="w-full bg-white border border-brand-black/10 px-4 py-3 text-xs uppercase tracking-tight focus:border-brand-black outline-none"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-brand-black/40">Payment Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', icon: Banknote },
                { id: 'Card', icon: CreditCard },
                { id: 'MPESA', icon: Smartphone }
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 border-2 transition-all gap-1",
                    paymentMethod === method.id ? "bg-brand-black border-brand-black text-brand-white" : "bg-white border-brand-black/10 text-brand-black"
                  )}
                >
                  <method.icon size={18} />
                  <span className="text-[10px] uppercase font-bold">{method.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-brand-black/10 h-px w-full" />

          <div className="space-y-2">
            <div className="flex justify-between text-brand-black/60 text-xs font-mono uppercase tracking-tighter">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-2xl font-black tracking-tighter italic">
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-brand-black text-brand-white py-6 font-black uppercase text-lg tracking-widest hover:bg-brand-black/90 transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:cursor-not-allowed group"
          >
            Confirm & Print
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </aside>

      {/* Mobile Cart Trigger */}
      {!isCartOpen && cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-brand-black text-brand-white rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-white text-brand-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
        </button>
      )}

      {/* Receipt Modal */}
      <AnimatePresence>
        {activeReceipt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-brand-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:grid md:grid-cols-[1fr_350px]"
            >
              {/* Receipt Area */}
              <div className="flex-1 bg-brand-gray p-8 overflow-y-auto flex items-center justify-center">
                <ReceiptView ref={receiptRef} receipt={activeReceipt} />
              </div>

              {/* Action Area */}
              <div className="p-8 bg-white border-l-2 border-brand-black flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircle2 size={24} />
                    <span className="font-black uppercase tracking-tighter">Transaction Successful</span>
                  </div>
                  <h3 className="text-3xl font-black mb-2 leading-none uppercase italic underline decoration-4 underline-offset-4">Success!</h3>
                  <p className="text-sm text-brand-black/60 mb-8">
                    Sale of <span className="font-bold text-brand-black">{formatCurrency(activeReceipt.total)}</span> completed. 
                    Receipt generated for <span className="font-bold text-brand-black">{activeReceipt.customerName}</span>.
                  </p>

                  <div className="grid gap-3">
                    <button 
                      onClick={downloadReceipt}
                      className="w-full btn-primary flex items-center justify-center gap-3"
                    >
                      <Download size={18} />
                      Download Receipt
                    </button>
                    <button 
                      onClick={shareToWhatsapp}
                      className="w-full btn-secondary flex items-center justify-center gap-3 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5"
                    >
                      <Share2 size={18} />
                      Share to WhatsApp
                    </button>
                  </div>
                </div>

                <div className="pt-8 md:pt-0">
                  <p className="text-[10px] font-mono text-brand-black/30 uppercase tracking-widest text-center mb-6">Salama Talent House POS System v1.0</p>
                  <button 
                    onClick={() => setActiveReceipt(null)}
                    className="w-full bg-brand-gray py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-black hover:text-brand-white transition-all"
                  >
                    Back to Terminal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
