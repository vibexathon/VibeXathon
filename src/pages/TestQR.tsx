import React, { useState, useEffect } from 'react';
import { createPaymentOrder } from '../paymentService';

const TestQR: React.FC = () => {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const testQRGeneration = async () => {
    setLoading(true);
    setError('');
    setQrCode('');
    
    try {
      console.log('Starting QR generation test...');
      const order = await createPaymentOrder(500);
      console.log('Order created:', order);
      
      setOrderDetails(order);
      setQrCode(order.qrCodeDataUrl || '');
      
      if (!order.qrCodeDataUrl) {
        setError('QR code URL is empty');
      }
    } catch (err: any) {
      console.error('QR generation error:', err);
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testQRGeneration();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">QR Code Generation Test</h1>
        
        <div className="bg-slate-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">UPI ID:</span>
              <span className="text-white font-mono">{import.meta.env.VITE_UPI_ID || 'NOT SET'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">UPI Name:</span>
              <span className="text-white">{import.meta.env.VITE_UPI_NAME || 'NOT SET'}</span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="bg-slate-900 rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Generating QR Code...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-6">
            <p className="text-red-400 font-bold">Error: {error}</p>
          </div>
        )}

        {orderDetails && (
          <div className="bg-slate-900 rounded-2xl p-8 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="text-white font-mono">{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-green-400 font-bold">₹{orderDetails.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-white">{orderDetails.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">QR Code URL Length:</span>
                <span className="text-white">{orderDetails.qrCodeDataUrl?.length || 0} chars</span>
              </div>
            </div>
          </div>
        )}

        {qrCode && (
          <div className="bg-slate-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Generated QR Code</h2>
            <div className="flex justify-center mb-4">
              <img 
                src={qrCode} 
                alt="QR Code" 
                className="w-64 h-64 bg-white p-4 rounded-xl"
                onError={(e) => {
                  console.error('Image failed to load');
                  setError('QR code image failed to load');
                }}
                onLoad={() => console.log('QR code image loaded successfully')}
              />
            </div>
            
            {/* Pay Now Button */}
            {orderDetails && (
              <div className="flex justify-center mb-4">
                <a
                  href={`upi://pay?pa=${import.meta.env.VITE_UPI_ID || 'yourupi@bank'}&pn=${encodeURIComponent(import.meta.env.VITE_UPI_NAME || 'YourName')}&am=${orderDetails.amount}&cu=INR&tn=${orderDetails.orderId}`}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Test Pay Now</span>
                </a>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2">QR Code URL Preview:</p>
              <p className="text-xs text-slate-400 font-mono break-all">{qrCode.substring(0, 100)}...</p>
            </div>
          </div>
        )}

        <button
          onClick={testQRGeneration}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl mt-6"
        >
          Regenerate QR Code
        </button>
      </div>
    </div>
  );
};

export default TestQR;
