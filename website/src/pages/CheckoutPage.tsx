import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Quote, Order } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const CheckoutPage: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('aryan@paytm');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!quoteId) return;
    api.getQuotes('REQ-101').then((qts) => {
      const target = qts.find((q) => q.id === quoteId) || qts[0];
      setQuote(target);
    }).catch(console.error);
  }, [quoteId]);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'BESTEAL10') {
      setPromoApplied(true);
      showToast('success', 'Promo Code Applied!', '₹500 instant discount deducted from advance.');
    } else {
      showToast('warning', 'Invalid Promo', 'Try BESTEAL10 for ₹500 off!');
    }
  };

  const handleConfirmOrder = async () => {
    if (!quote) return;
    try {
      setIsProcessing(true);
      const newOrder = await api.placeOrder(
        quote.id,
        paymentMethod === 'upi' ? `UPI (${upiId})` : 'Credit Card **** 4821'
      );
      setIsProcessing(false);

      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      showToast('success', 'Order Confirmed via Escrow! 🎉', `Order #${newOrder.id} created.`);
      navigate(`/orders/${newOrder.id}`);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      showToast('error', 'Checkout failed');
    }
  };

  const calculateTotal = () => {
    if (!quote) return 0;
    const base = quote.price + (quote.installationIncluded ? 0 : 800);
    return promoApplied ? base - 500 : base;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-white">← Back to Marketplace</Link>
        <span>/</span>
        <span className="text-slate-200">Escrow Checkout</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-bold">
            🛡 100% ESCROW PROTECTION
          </span>
          <h1 className="text-2xl font-extrabold font-display text-white mt-2">Confirm Order & Pay 10% Advance Deposit</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">Pay 10% advance now. Pay remaining 90% directly to seller on item delivery.</p>
        </div>

        {quote ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs font-mono">
              <div className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">Order Items Summary</div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-300">{quote.sellerName} Quote</span>
                <span className="text-white font-bold">₹{quote.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-300">Installation & Delivery</span>
                <span className="text-emerald-400 font-bold">{quote.installationIncluded ? 'FREE' : '₹800'}</span>
              </div>

              {promoApplied && (
                <div className="flex justify-between py-1 text-emerald-400 font-bold">
                  <span>Promo BESTEAL10</span>
                  <span>− ₹500</span>
                </div>
              )}

              <div className="pt-2 flex justify-between text-sm font-bold">
                <span className="text-white">Total Order Value:</span>
                <span className="text-blue-400">₹{calculateTotal().toLocaleString('en-IN')}</span>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl text-orange-300 text-[11px] space-y-1">
                <div>⚡ 10% Escrow Advance: <strong className="text-white font-bold">₹{Math.round(calculateTotal() * 0.1).toLocaleString('en-IN')}</strong></div>
                <div>Remaining COD on Delivery: <strong className="text-white font-bold">₹{Math.round(calculateTotal() * 0.9).toLocaleString('en-IN')}</strong></div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Apply Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="BESTEAL10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                  <button onClick={handleApplyPromo} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold font-display cursor-pointer">
                    Apply
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border font-bold cursor-pointer ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-950/60 text-blue-400' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
                  >
                    ⚡ Instant UPI
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border font-bold cursor-pointer ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-950/60 text-blue-400' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
                  >
                    💳 Credit Card
                  </button>
                </div>

                {paymentMethod === 'upi' && (
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                    placeholder="aryan@paytm"
                  />
                )}
              </div>

              <button
                onClick={handleConfirmOrder}
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold font-display text-sm shadow-xl shadow-emerald-600/25 cursor-pointer transition-all"
              >
                {isProcessing ? 'Processing Escrow Payment...' : `CONFIRM & PAY DEPOSIT ₹${Math.round(calculateTotal() * 0.1).toLocaleString('en-IN')} →`}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 font-mono">Loading quote checkout...</div>
        )}
      </div>
    </div>
  );
};
