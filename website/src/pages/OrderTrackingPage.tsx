import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Great service and prompt installation!');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Technician delay');

  useEffect(() => {
    if (!id) return;
    api.getOrderById(id).then(setOrder).catch(console.error);
  }, [id]);

  const handleUpdateStage = async (stageNum: number) => {
    if (!order) return;
    try {
      const updated = await api.updateOrderStage(order.id, stageNum);
      setOrder(updated);
      showToast('info', 'Stage Updated', `Order moved to Stage ${stageNum}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async () => {
    if (!order) return;
    try {
      const updated = await api.submitOrderReview(order.id, reviewRating, reviewComment);
      setOrder(updated);
      setShowReviewModal(false);
      showToast('success', 'Rating Submitted!', 'Thank you for your review.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRaiseDispute = async () => {
    if (!order) return;
    try {
      await api.raiseOrderDispute(order.id, disputeReason);
      setShowDisputeModal(false);
      showToast('warning', 'Dispute Ticket Created', 'Admin support team notified.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-white">← Back to Marketplace</Link>
        <span>/</span>
        <span className="text-slate-200">Order Tracking #{id}</span>
      </div>

      {order ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-bold">
                LIVE ORDER TRACKING
              </span>
              <h1 className="text-2xl font-extrabold font-display text-white mt-2">{order.reqTitle}</h1>
              <p className="text-xs text-slate-400 font-mono mt-1">Order ID: #{order.id} · Seller: {order.sellerName}</p>
            </div>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold px-4 py-2 rounded-xl border border-slate-700 cursor-pointer"
            >
              🧾 Official PDF Invoice
            </button>
          </div>

          {/* Delivery OTP Badge */}
          <div className="bg-emerald-950/60 border border-emerald-500/30 p-4 rounded-2xl flex justify-between items-center text-xs font-mono">
            <div>
              <div className="text-emerald-400 font-bold">Delivery Security OTP Code</div>
              <div className="text-slate-400 text-[11px]">Give code to seller after receiving item to complete delivery</div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-widest bg-emerald-900/60 px-4 py-1.5 rounded-xl border border-emerald-500/40">
              {order.deliveryOtp || '8492'}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">Delivery Timeline Milestones</div>

            <div className="space-y-4 pl-4 border-l-2 border-slate-800 relative">
              {order.timeline.map((t) => (
                <div key={t.stage} className="flex items-start gap-4 relative">
                  <div className={`w-5 h-5 rounded-full border-2 font-bold text-[10px] flex items-center justify-center -ml-[27px] bg-slate-900 ${t.done ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}`}>
                    {t.done ? '✓' : t.stage}
                  </div>
                  <div>
                    <div className={`text-sm font-bold font-display ${t.done ? 'text-white' : 'text-slate-500'}`}>{t.title}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulate Buttons */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-slate-400">Simulate Order Progress Stage:</div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((stg) => (
                <button
                  key={stg}
                  onClick={() => handleUpdateStage(stg)}
                  className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${order.stage === stg ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                >
                  Stage {stg}
                </button>
              ))}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex justify-between items-center border-t border-slate-800 pt-4 text-xs">
            <button onClick={() => setShowDisputeModal(true)} className="text-red-400 font-bold hover:underline cursor-pointer">
              ⚠ Raise Order Dispute / Issue
            </button>
            {order.stage === 4 && (
              <button onClick={() => setShowReviewModal(true)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl cursor-pointer">
                ⭐ Rate Merchant Review
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 font-mono">Loading order tracking...</div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && order && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg">BESTEAL Tax Invoice</h3>
                <p className="text-xs text-slate-500">Order #{order.id}</p>
              </div>
              <button onClick={() => setShowInvoiceModal(false)}>✕</button>
            </div>
            <div className="text-xs font-mono space-y-2">
              <div className="flex justify-between"><span>Total Order:</span> <span className="font-bold">₹{order.amountTotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-emerald-600 font-bold"><span>10% Escrow Paid:</span> <span>₹{order.advancePaid.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-blue-600 font-bold"><span>Remaining COD:</span> <span>₹{order.balanceDue.toLocaleString('en-IN')}</span></div>
            </div>
            <button
              onClick={() => { setShowInvoiceModal(false); showToast('success', 'PDF Invoice Downloaded'); }}
              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-xs cursor-pointer"
            >
              DOWNLOAD OFFICIAL PDF RECEIPT
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex justify-between font-bold"><h3 className="text-base font-display">Rate Merchant</h3><button onClick={() => setShowReviewModal(false)}>✕</button></div>
            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="w-full border p-3 rounded-xl text-xs" rows={3} />
            <button onClick={handleSubmitReview} className="w-full bg-amber-500 text-white py-3 rounded-2xl font-bold text-xs cursor-pointer">SUBMIT REVIEW</button>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-4">
            <div className="flex justify-between font-bold text-red-600"><h3 className="text-base font-display">Raise Dispute Ticket</h3><button onClick={() => setShowDisputeModal(false)}>✕</button></div>
            <textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} className="w-full border p-3 rounded-xl text-xs" rows={3} />
            <button onClick={handleRaiseDispute} className="w-full bg-red-600 text-white py-3 rounded-2xl font-bold text-xs cursor-pointer">SUBMIT DISPUTE TO ADMIN</button>
          </div>
        </div>
      )}
    </div>
  );
};
