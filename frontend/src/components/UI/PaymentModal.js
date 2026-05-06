import React, { useState, useEffect } from 'react';
import {
  X, CreditCard, Truck, Smartphone, Building2, Wallet,
  Lock, ChevronRight, AlertCircle, Eye, EyeOff, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────────────────── */
const formatCardNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (v) => {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const detectCardType = (number) => {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6/.test(n)) return 'rupay';
  return 'generic';
};

const CARD_COLORS = {
  visa: 'from-blue-600 to-blue-800',
  mastercard: 'from-red-500 to-orange-600',
  amex: 'from-green-600 to-teal-700',
  rupay: 'from-orange-500 to-red-600',
  generic: 'from-gray-700 to-gray-900',
};

const CARD_LOGOS = {
  visa: '𝗩𝗜𝗦𝗔',
  mastercard: '●● MC',
  amex: 'AMEX',
  rupay: 'RuPay',
  generic: '',
};

const BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
  'Canara Bank', 'Union Bank of India', 'IDBI Bank',
];

const WALLETS = [
  { id: 'phonepe', label: 'PhonePe', color: '#5f259f', emoji: '📱' },
  { id: 'gpay', label: 'Google Pay', color: '#1a73e8', emoji: '💳' },
  { id: 'paytm', label: 'Paytm', color: '#002970', emoji: '💙' },
  { id: 'amazon', label: 'Amazon Pay', color: '#ff9900', emoji: '🛒' },
  { id: 'mobikwik', label: 'MobiKwik', color: '#18A0DC', emoji: '💜' },
];

const METHODS = [
  { id: 'cod', label: 'Cash on Delivery', Icon: Truck, desc: 'Pay when item arrives' },
  { id: 'card', label: 'Credit / Debit Card', Icon: CreditCard, desc: 'Visa, Mastercard, RuPay, Amex' },
  { id: 'upi', label: 'UPI', Icon: Smartphone, desc: 'GPay, PhonePe, BHIM & more' },
  { id: 'netbanking', label: 'Net Banking', Icon: Building2, desc: 'All major Indian banks' },
  { id: 'wallet', label: 'Wallets', Icon: Wallet, desc: 'PhonePe, Paytm, MobiKwik' },
];

/* ─── PaymentModal ──────────────────────────────────────────────── */
export default function PaymentModal({ isOpen, onClose, onSuccess, item, totalPrice, deposit, rentalDays }) {
  const [method, setMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);

  // UPI state
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('');

  // Wallet state
  const [selectedWallet, setSelectedWallet] = useState('');

  // Card derived
  const cardType = detectCardType(cardNumber);
  const cardGradient = CARD_COLORS[cardType];
  const cardLogo = CARD_LOGOS[cardType];

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const grandTotal = (totalPrice + deposit).toFixed(2);

  const validateAndPay = async () => {
    if (method === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) return toast.error('Enter a valid 16-digit card number');
      if (!cardName.trim()) return toast.error('Enter cardholder name');
      if (expiry.length < 5) return toast.error('Enter a valid expiry date (MM/YY)');
      if (cvv.length < 3) return toast.error('Enter a valid CVV');
    }
    if (method === 'upi') {
      if (!/^[\w.]+@[\w]+$/.test(upiId)) { setUpiError('Enter a valid UPI ID (e.g. name@upi)'); return; }
      setUpiError('');
    }
    if (method === 'netbanking' && !selectedBank) return toast.error('Please select a bank to proceed');
    if (method === 'wallet' && !selectedWallet) return toast.error('Please select a wallet to proceed');

    setIsProcessing(true);
    // Simulate processing delay (replace with real API call)
    await new Promise(r => setTimeout(r, 1800));
    setIsProcessing(false);
    onSuccess({ paymentMethod: method });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto relative"
        style={{ animation: 'modalSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-2xl px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base leading-tight">Secure Checkout</h2>
              <p className="text-xs text-gray-400">256-bit SSL encrypted</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="mx-6 mt-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 p-4">
          <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest mb-2">Order Summary</p>
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>{item?.title?.length > 28 ? item.title.slice(0, 28) + '…' : item?.title}</span>
            <span className="font-medium">× {rentalDays} days</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Rental charges</span><span>₹{totalPrice?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Security deposit</span><span>₹{deposit?.toFixed(2)}</span>
          </div>
          <div className="border-t border-violet-200 pt-2 flex justify-between font-bold text-gray-900">
            <span>Total Payable</span>
            <span className="text-violet-700 text-lg">₹{grandTotal}</span>
          </div>
        </div>

        {/* Payment method selector */}
        <div className="px-6 mt-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>
          <div className="space-y-2">
            {METHODS.map(({ id, label, Icon, desc }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  method === id
                    ? 'border-violet-500 bg-violet-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  method === id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${method === id ? 'text-violet-800' : 'text-gray-800'}`}>{label}</p>
                  <p className="text-xs text-gray-400 truncate">{desc}</p>
                </div>
                {method === id && <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Method-specific forms */}
        <div className="px-6 mt-5">

          {/* ── COD ── */}
          {method === 'cod' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
              <Truck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Cash on Delivery</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Keep ₹{grandTotal} ready when the item is delivered. The delivery partner will collect the payment.
                  Security deposit of ₹{deposit?.toFixed(2)} is fully refundable on return.
                </p>
              </div>
            </div>
          )}

          {/* ── CARD ── */}
          {method === 'card' && (
            <div className="space-y-4">
              {/* Card preview */}
              <div
                className={`relative w-full h-44 rounded-2xl bg-gradient-to-br ${cardGradient} text-white p-5 shadow-xl cursor-pointer select-none overflow-hidden`}
                style={{ perspective: '800px', transition: 'transform 0.4s' }}
                onClick={() => setCardFlipped(f => !f)}
              >
                {/* Background circles */}
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white opacity-5" />
                <div className="absolute -right-2 top-12 w-24 h-24 rounded-full bg-white opacity-5" />
                {!cardFlipped ? (
                  <>
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-7 rounded bg-yellow-300 opacity-80" style={{ background: 'linear-gradient(135deg,#f6d365,#fda085)' }} />
                      <span className="text-xs font-bold tracking-widest opacity-75">{cardLogo}</span>
                    </div>
                    <p className="mt-4 text-lg font-mono tracking-widest">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex justify-between mt-3">
                      <div>
                        <p className="text-xs opacity-60 uppercase">Card Holder</p>
                        <p className="text-sm font-medium tracking-wide">{cardName || 'Your Name'}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-60 uppercase">Expires</p>
                        <p className="text-sm font-medium">{expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col justify-center h-full">
                    <div className="w-full h-8 bg-black opacity-50 rounded mb-3" />
                    <div className="flex justify-end items-center space-x-2">
                      <div className="flex-1 h-8 bg-white bg-opacity-20 rounded" />
                      <div className="bg-white rounded px-3 py-1 text-gray-800 font-mono text-sm min-w-[50px] text-center">
                        {cvv || 'CVV'}
                      </div>
                    </div>
                    <p className="text-xs opacity-60 mt-2 text-right">Tap to flip back</p>
                  </div>
                )}
              </div>

              {/* Card inputs */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={e => setCardName(e.target.value.toUpperCase())}
                  placeholder="NAME AS ON CARD"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm uppercase font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">CVV</label>
                  <div className="relative">
                    <input
                      type={showCvv ? 'text' : 'password'}
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onFocus={() => setCardFlipped(true)}
                      onBlur={() => setCardFlipped(false)}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button type="button" onClick={() => setShowCvv(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
                <Lock className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>Your card details are encrypted and never stored on our servers.</span>
              </div>
            </div>
          )}

          {/* ── UPI ── */}
          {method === 'upi' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Your UPI ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                    placeholder="yourname@upi"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${upiError ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">@upi</span>
                </div>
                {upiError && <p className="text-xs text-red-500 mt-1 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>{upiError}</span></p>}
              </div>
              <p className="text-xs text-gray-500 text-center">– or pay with –</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Google Pay', color: '#1a73e8', emoji: '💳' },
                  { label: 'PhonePe', color: '#5f259f', emoji: '📱' },
                  { label: 'BHIM', color: '#00529b', emoji: '🏦' },
                ].map(app => (
                  <button
                    key={app.label}
                    type="button"
                    onClick={() => setUpiId(`user@${app.label.toLowerCase().replace(/\s/g, '')}`)}
                    className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-all"
                  >
                    <span className="text-2xl mb-1">{app.emoji}</span>
                    <span className="text-xs font-medium text-gray-700">{app.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Net Banking ── */}
          {method === 'netbanking' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Select Your Bank</p>
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {BANKS.map(bank => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-sm text-left transition-all ${
                      selectedBank === bank
                        ? 'border-violet-500 bg-violet-50 text-violet-800 font-medium'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{bank}</span>
                    {selectedBank === bank && <Check className="w-4 h-4 text-violet-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Wallets ── */}
          {method === 'wallet' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Choose a Wallet</p>
              <div className="grid grid-cols-2 gap-2">
                {WALLETS.map(w => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWallet(w.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedWallet === w.id
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl">{w.emoji}</span>
                    <span className={`text-sm font-medium ${selectedWallet === w.id ? 'text-violet-800' : 'text-gray-700'}`}>{w.label}</span>
                    {selectedWallet === w.id && <Check className="w-3.5 h-3.5 text-violet-600 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pay button */}
        <div className="px-6 pt-5 pb-6 mt-2">
          <button
            onClick={validateAndPay}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl font-bold text-white text-base relative overflow-hidden transition-all"
            style={{ background: isProcessing ? '#a78bfa' : 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', boxShadow: isProcessing ? 'none' : '0 8px 24px rgba(124,58,237,0.4)' }}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>Processing Payment…</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>
                  {method === 'cod' ? `Confirm Order — ₹${grandTotal}` : `Pay ₹${grandTotal} Securely`}
                </span>
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>Secured by 256-bit SSL encryption · PCI DSS Compliant</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
