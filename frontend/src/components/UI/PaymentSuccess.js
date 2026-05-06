import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Calendar, CreditCard, Truck, Smartphone, Building2, Wallet, Download, ArrowRight } from 'lucide-react';

const METHOD_LABELS = {
  cod: { label: 'Cash on Delivery', Icon: Truck, color: '#f59e0b' },
  card: { label: 'Credit / Debit Card', Icon: CreditCard, color: '#6d28d9' },
  upi: { label: 'UPI Payment', Icon: Smartphone, color: '#0ea5e9' },
  netbanking: { label: 'Net Banking', Icon: Building2, color: '#10b981' },
  wallet: { label: 'Wallet Payment', Icon: Wallet, color: '#f97316' },
};

function generateBookingId() {
  return 'RW-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function PaymentSuccess({ isOpen, paymentMethod, item, totalPrice, deposit, rentalDays, onClose }) {
  const navigate = useNavigate();
  const bookingRef = useRef(generateBookingId());
  const canvasRef = useRef(null);

  // Confetti
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      r: Math.random() * Math.PI * 2,
      dr: (Math.random() - 0.5) * 0.2,
      dy: Math.random() * 4 + 2,
      dx: (Math.random() - 0.5) * 2,
      color: ['#7c3aed','#4f46e5','#10b981','#f59e0b','#ec4899','#06b6d4','#f97316'][Math.floor(Math.random()*7)],
      opacity: 1,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.rotate(p.r);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.x += p.dx;
        p.y += p.dy;
        p.r += p.dr;
        p.opacity -= 0.008;
      });
      if (pieces.some(p => p.opacity > 0)) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const info = METHOD_LABELS[paymentMethod] || METHOD_LABELS.cod;
  const MethodIcon = info.Icon;
  const grandTotal = (totalPrice + deposit).toFixed(2);
  const startDate = new Date();
  const endDate = new Date(); endDate.setDate(startDate.getDate() + rentalDays);
  const fmt = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.65)' }}>
      {/* Confetti canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Top gradient bar */}
        <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #06b6d4, #10b981)' }} />

        {/* Success icon area */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6"
             style={{ background: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)' }}>
          {/* Animated ring + check */}
          <div className="relative mb-4" style={{ animation: 'bounceIn 0.6s 0.1s both' }}>
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 0 12px rgba(124,58,237,0.12), 0 0 0 24px rgba(124,58,237,0.06)' }}>
              <svg viewBox="0 0 52 52" className="w-12 h-12">
                <circle cx="26" cy="26" r="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                <path
                  fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                  d="M14 27l8 8 16-16"
                  style={{ strokeDasharray: 40, strokeDashoffset: 0, animation: 'drawCheck 0.5s 0.3s ease both' }}
                />
              </svg>
            </div>
            {/* Sparkles */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div key={i} className="absolute w-2 h-2 rounded-full"
                   style={{ background: ['#7c3aed','#10b981','#f59e0b','#ec4899','#06b6d4','#f97316'][i],
                            top: '50%', left: '50%',
                            transform: `rotate(${deg}deg) translateX(50px) translateY(-50%)`,
                            animation: `sparkle 0.6s ${0.2 + i * 0.05}s both` }} />
            ))}
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 text-center" style={{ animation: 'fadeUp 0.4s 0.3s both' }}>
            {paymentMethod === 'cod' ? 'Order Confirmed!' : 'Payment Successful!'}
          </h2>
          <p className="text-gray-500 text-sm text-center mt-1" style={{ animation: 'fadeUp 0.4s 0.4s both' }}>
            {paymentMethod === 'cod'
              ? 'Your rental request is confirmed. Pay cash on delivery.'
              : 'Your payment has been processed. Enjoy your rental!'}
          </p>
        </div>

        {/* Booking ID */}
        <div className="mx-6 mb-4" style={{ animation: 'fadeUp 0.4s 0.45s both' }}>
          <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50 px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-violet-400 uppercase font-semibold tracking-widest">Booking Reference</p>
              <p className="text-violet-800 font-mono font-bold text-sm mt-0.5">{bookingRef.current}</p>
            </div>
            <button className="text-violet-400 hover:text-violet-600 transition-colors" title="Download receipt">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Details card */}
        <div className="mx-6 mb-5 rounded-2xl border border-gray-100 overflow-hidden shadow-sm" style={{ animation: 'fadeUp 0.4s 0.5s both' }}>
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rental Details</p>
          </div>

          <div className="divide-y divide-gray-100">
            <Row icon={<ShoppingBag className="w-4 h-4 text-violet-500" />} label="Item">
              <span className="font-medium text-gray-900 text-sm">{item?.title?.length > 30 ? item.title.slice(0,30)+'…' : item?.title}</span>
            </Row>
            <Row icon={<Calendar className="w-4 h-4 text-blue-500" />} label="Rental Period">
              <span className="font-medium text-gray-900 text-sm">{fmt(startDate)} → {fmt(endDate)}</span>
              <span className="text-xs text-gray-400 ml-1">({rentalDays} day{rentalDays !== 1 ? 's' : ''})</span>
            </Row>
            <Row icon={<MethodIcon className="w-4 h-4" style={{ color: info.color }} />} label="Payment">
              <span className="font-medium text-sm" style={{ color: info.color }}>{info.label}</span>
            </Row>
            <Row icon={null} label="Rental Charges">
              <span className="text-gray-800 text-sm">₹{totalPrice?.toFixed(2)}</span>
            </Row>
            <Row icon={null} label="Security Deposit">
              <span className="text-gray-800 text-sm">₹{deposit?.toFixed(2)} <span className="text-green-600 text-xs">(refundable)</span></span>
            </Row>
          </div>

          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 flex justify-between items-center">
            <span className="text-white font-bold text-sm">
              {paymentMethod === 'cod' ? 'Amount Due on Delivery' : 'Total Paid'}
            </span>
            <span className="text-white font-extrabold text-lg">₹{grandTotal}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-7 space-y-3" style={{ animation: 'fadeUp 0.4s 0.6s both' }}>
          <button
            onClick={() => { onClose(); navigate('/my-rentals'); }}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-100"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}
          >
            <span>View My Rentals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { onClose(); navigate('/clothing'); }}
            className="w-full py-3 rounded-xl font-semibold text-gray-600 text-sm border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <style>{`
        @keyframes successPop {
          from { opacity: 0; transform: scale(0.8) translateY(30px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        @keyframes bounceIn {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes sparkle {
          from { opacity: 0; transform: rotate(var(--r,0deg)) translateX(30px) translateY(-50%) scale(0); }
          50%  { opacity: 1; }
          to   { opacity: 0; transform: rotate(var(--r,0deg)) translateX(60px) translateY(-50%) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Row({ icon, label, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <div className="flex items-center space-x-2 text-gray-500 text-xs min-w-[110px]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center justify-end text-right">{children}</div>
    </div>
  );
}
