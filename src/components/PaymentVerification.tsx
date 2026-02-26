import React, { useState } from 'react';
import { Team, PaymentStatus } from '../types';
import { verifyPayment, rejectPayment } from '../paymentService';

interface PaymentVerificationProps {
  team: Team;
  onApprove: (teamId: string) => void;
  onReject: (teamId: string, reason: string) => void;
}

const PaymentVerification: React.FC<PaymentVerificationProps> = ({ team, onApprove, onReject }) => {
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const paymentOrder = team.paymentOrder;

  if (!paymentOrder) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">
        No payment information available
      </div>
    );
  }

  const handleApprove = () => {
    if (confirm(`Verify payment for team "${team.teamName}"?\n\nPlease confirm:\n- UTR: ${paymentOrder.utr}\n- Amount: ₹${paymentOrder.amount}\n- Payment received in correct UPI ID`)) {
      onApprove(team.id);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    if (confirm(`Reject payment for team "${team.teamName}"?\n\nReason: ${rejectionReason}`)) {
      onReject(team.id, rejectionReason);
      setShowRejectModal(false);
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black text-white mb-1">{team.teamName}</h3>
          <p className="text-sm text-slate-400">{team.leaderName} • {team.email}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          paymentOrder.status === PaymentStatus.PENDING_VERIFICATION 
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-slate-700 text-slate-400'
        }`}>
          {paymentOrder.status.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Order ID</p>
          <p className="text-sm font-mono font-bold text-white">{paymentOrder.orderId}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Amount</p>
          <p className="text-lg font-black text-green-400">₹{paymentOrder.amount}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">UTR Number</p>
          <p className="text-sm font-mono font-bold text-white">{paymentOrder.utr || 'N/A'}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Submitted</p>
          <p className="text-sm font-bold text-white">
            {new Date(paymentOrder.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {paymentOrder.screenshotUrl && (
        <div className="mb-6">
          <button
            onClick={() => {
              setShowScreenshot(!showScreenshot);
              if (!showScreenshot) {
                // Reset states when opening
                setImageError(false);
                setImageLoading(true);
              }
            }}
            className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl p-4 text-indigo-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {showScreenshot ? 'Hide' : 'View'} Payment Screenshot
          </button>
          {showScreenshot && (
            <div className="mt-4 rounded-2xl overflow-hidden border-2 border-white/10 bg-slate-800/50 p-4">
              {imageError ? (
                <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
                  <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-400 font-bold mb-2">Failed to Load Image</p>
                  <p className="text-sm text-slate-400 mb-4">The payment screenshot could not be displayed</p>
                  <a
                    href={paymentOrder.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-all text-sm"
                  >
                    Open in New Tab
                  </a>
                </div>
              ) : (
                <>
                  {imageLoading && (
                    <div className="w-full h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                  )}
                  <img 
                    src={paymentOrder.screenshotUrl} 
                    alt="Payment Screenshot" 
                    className={`w-full rounded-lg shadow-lg ${imageLoading ? 'hidden' : 'block'}`}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                    onLoad={() => setImageLoading(false)}
                    crossOrigin="anonymous"
                  />
                </>
              )}
              <div className="mt-4 text-center">
                <a
                  href={paymentOrder.screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Full Size in New Tab
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {team.isIeeeMember && (
        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-blue-400 font-bold mb-2">IEEE Member</p>
          <p className="text-sm text-white">ID: {team.ieeeNumber || 'N/A'}</p>
        </div>
      )}

      {paymentOrder.status === PaymentStatus.PENDING_VERIFICATION && (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Verify & Approve
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </button>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}></div>
          <div className="relative bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-black text-white mb-4">Reject Payment</h3>
            <p className="text-slate-400 text-sm mb-4">Provide a reason for rejection:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., UTR not found, incorrect amount, etc."
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white outline-none mb-4 resize-none"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
