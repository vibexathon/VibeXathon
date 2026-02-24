import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppState, TeamMember, Team, UserRole } from '../types';
import Logo from '../components/Logo';
import { createReceipt, downloadReceipt, printReceipt, Receipt } from '../receiptService';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc as firestoreDoc, runTransaction, onSnapshot } from 'firebase/firestore';

interface RegisterProps {
  store: {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
    register: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  };
}

const REGISTRATION_DRAFT_KEY = 'VBX_REGISTRATION_DRAFT';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Register: React.FC<RegisterProps> = ({ store }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state from localStorage or defaults
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed.formData, ieeeProof: null }; // File objects can't be persisted
      } catch (e) { console.error('Error parsing saved form data', e); }
    }
    return {
      teamName: '',
      leaderName: '',
      leaderContact: '',
      email: '',
      password: '',
      teamSize: 2,
      isIeeeMember: false,
      ieeeNumber: '',
      ieeeProof: null as File | null
    };
  });

  const [members, setMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.members) return parsed.members;
      } catch (e) { }
    }
    return [
      { name: '', email: '' },
      { name: '', email: '' }
    ];
  });

  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'verification'>(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.step || 'form';
      } catch (e) { }
    }
    return 'form';
  });

  const [paymentData, setPaymentData] = useState<{ id: string; amount: number } | null>(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.paymentData || null;
      } catch (e) { }
    }
    return null;
  });

  const [screenshot, setScreenshot] = useState<string | null>(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.screenshot || null;
      } catch (e) { }
    }
    return null;
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.receipt || null;
      } catch (e) { }
    }
    return null;
  });

  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.generatedOtp || '';
      } catch (e) { }
    }
    return '';
  });

  const [isOtpSent, setIsOtpSent] = useState(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.isOtpSent || false;
      } catch (e) { }
    }
    return false;
  });

  const [isOtpVerified, setIsOtpVerified] = useState(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.isOtpVerified || false;
      } catch (e) { }
    }
    return false;
  });

  const slotsFull = (store.state?.teams ?? []).length >= 25;

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  // Allow pausing email sends via Firestore settings or env var
  const emailEnabled = (store.state?.settings as any)?.isEmailEnabled ?? (import.meta.env.VITE_EMAILJS_ENABLED !== 'false');
  const [isTogglingEmail, setIsTogglingEmail] = useState(false);
  const [teamsCount, setTeamsCount] = useState<number>((store.state?.teams ?? []).length);

  useEffect(() => {
    const counterRef = firestoreDoc(db, 'counters', 'teams');
    const unsub = onSnapshot(counterRef, (snap) => {
      if (snap.exists()) {
        const data: any = snap.data();
        setTeamsCount(typeof data.count === 'number' ? data.count : (store.state?.teams ?? []).length);
      } else {
        setTeamsCount((store.state?.teams ?? []).length);
      }
    }, (err) => {
      console.error('Counter listener error:', err);
    });

    return () => unsub();
  }, []);

  const remainingSlots = Math.max(0, 25 - teamsCount);

  // Persistence logic: Save to localStorage whenever relevant state changes
  useEffect(() => {
    const dataToSave = {
      formData: { ...formData, ieeeProof: null }, // Don't try to save File object
      members,
      step,
      paymentData,
      screenshot: screenshot === 'DONE' ? null : screenshot, // Don't persist DONE state as it should be fresh
      receipt,
      generatedOtp,
      isOtpSent,
      isOtpVerified
    };
    localStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(dataToSave));
  }, [formData, members, step, paymentData, screenshot, receipt, generatedOtp, isOtpSent, isOtpVerified]);

  useEffect(() => {
    if (screenshot === 'DONE') {
      localStorage.removeItem(REGISTRATION_DRAFT_KEY);
    }
  }, [screenshot]);

  const clearDraft = () => {
    if (confirm("This will clear your registration progress. Are you sure?")) {
      localStorage.removeItem(REGISTRATION_DRAFT_KEY);
      window.location.reload();
    }
  };

  useEffect(() => {
    setMembers(prev => {
      const updated = [...prev];
      updated[0] = { name: formData.leaderName, email: formData.email };
      return updated;
    });
  }, [formData.leaderName, formData.email]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const handleTeamSizeChange = (size: number) => {
    setFormData({ ...formData, teamSize: size });
    setMembers(prev => {
      const newMembers = [...prev];
      if (size > prev.length) {
        for (let i = prev.length; i < size; i++) {
          newMembers.push({ name: '', email: '' });
        }
      } else {
        newMembers.splice(size);
      }
      return newMembers;
    });
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const calculateAmount = () => formData.isIeeeMember ? 400 : 500;
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const TRUSTED_DOMAINS = [
    'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
    'zoho.com', 'protonmail.com', 'proton.me', 'mac.com', 'me.com', 'live.com'
  ];

  const isTrustedEmail = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;

    // Check if it's a trusted domain or an educational/organizational domain (.edu, .ac.in, .org)
    if (TRUSTED_DOMAINS.includes(domain)) return true;
    if (domain.endsWith('.edu') || domain.endsWith('.ac.in') || domain.endsWith('.edu.in') || domain.endsWith('.org')) return true;

    return false;
  };

  const sendOtp = async () => {
    if (!emailEnabled) {
      return setError('Email service is temporarily paused. Please try again later.');
    }

    if (!isValidEmail(formData.email)) {
      return setError('Please enter a valid Official Email address first.');
    }
    if (!isTrustedEmail(formData.email)) {
      return setError('Please use a valid  email');
    }
    setIsSendingOtp(true);
    setError('');

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
          template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID',
          user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
          template_params: {
            to_email: formData.email,
            to_name: formData.leaderName || 'Participant',
            reply_to: formData.email,
            otp: newOtp,
            team_name: formData.teamName || 'Participant'
          }
        })
      });

      if (response.ok) {
        setIsOtpSent(true);
        // Show a temporary success message in the error box (styled as success)
        setError(`OTP successfully sent to ${formData.email}`);
        setTimeout(() => {
          // Clear the success message after 5 seconds if it hasn't been replaced by an error
          setError(prev => prev.startsWith('OTP successfully sent') ? '' : prev);
        }, 5000);
      } else {
        const text = await response.text();
        setError('Failed to send OTP. Please check EmailJS configuration.');
        console.error('EmailJS Error:', text);
      }
    } catch (err) {
      setError('Network error while sending OTP.');
      console.error(err);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setIsOtpVerified(true);
      setError('');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Enforce registration cap
    if ((store.state?.teams ?? []).length >= 25) {
      return setError('Registration closed — slots full. Only 25 teams allowed.');
    }

    if (!isOtpVerified) return setError('Please verify your Official Email with OTP before proceeding.');
    if (!isValidEmail(formData.email)) return setError('Leader email is malformed.');
    if (!isTrustedEmail(formData.email)) return setError('Please use a valid  email');
    if (formData.leaderContact.length !== 10) return setError('WhatsApp number must be 10 digits.');
    if (formData.isIeeeMember && !formData.ieeeNumber.trim()) return setError('IEEE Membership ID is required for discounted tier.');
    if (formData.isIeeeMember && !formData.ieeeProof) return setError('IEEE Membership Card/Profile Screenshot is required for discounted tier.');

    for (let i = 0; i < members.length; i++) {
      if (!members[i].name || !members[i].email) return setError(`Incomplete details for member ${i + 1}.`);
    }

    if ((store.state?.teams ?? []).some((t: Team) => t.teamName.toLowerCase() === formData.teamName.toLowerCase())) return setError('This team name is already registered.');

    if (!window.Razorpay) return setError('Razorpay SDK failed to load. Please refresh.');

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey || razorpayKey === 'rzp_test_YOUR_KEY_HERE') {
      return setError('Razorpay is not configured. Please contact the administrator.');
    }

    const amount = calculateAmount();

    const handlePaymentSuccess = (response: any) => {
      // Strict validation - only proceed if payment ID exists
      if (!response || !response.razorpay_payment_id) {
        setError('Payment validation failed. Please contact support.');
        return;
      }

      // Payment successful - capture payment details
      console.log('Payment successful:', response);

      try {
        // Generate receipt ONLY after successful payment
        const generatedReceipt = createReceipt({
          transactionId: response.razorpay_payment_id,
          teamName: formData.teamName,
          leaderName: formData.leaderName,
          email: formData.email,
          contact: formData.leaderContact,
          amount: amount,
          isIeeeMember: formData.isIeeeMember,
          ieeeNumber: formData.ieeeNumber,
          teamSize: formData.teamSize
        });

        setReceipt(generatedReceipt);
        setPaymentData({
          id: response.razorpay_payment_id,
          amount
        });
        setStep('verification');
        setError(''); // Clear any previous errors
      } catch (err) {
        console.error('Receipt generation failed:', err);
        setError('Payment successful but receipt generation failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
      }
    };

    const handlePaymentFailure = (response?: any) => {
      // Payment was cancelled or failed - ensure no receipt is generated
      setReceipt(null);
      setPaymentData(null);
      console.log('Payment failed or cancelled:', response);
      setError('Payment was cancelled or failed. Please try again to complete registration.');
    };

    const options = {
      key: razorpayKey,
      amount: amount * 100, // Razorpay accepts amount in paise
      currency: 'INR',
      name: 'Vibexathon 1.0',
      description: `Registration Fee: ${formData.isIeeeMember ? 'IEEE Tier' : 'General Tier'}`,
      image: '/assets/poster.png', // Optional: Add your logo
      handler: handlePaymentSuccess,
      prefill: {
        name: formData.leaderName,
        email: formData.email,
        contact: formData.leaderContact
      },
      notes: {
        team_name: formData.teamName,
        ieee_member: formData.isIeeeMember ? 'Yes' : 'No',
        team_size: formData.teamSize
      },
      theme: {
        color: '#6366f1',
        backdrop_color: '#000000'
      },
      modal: {
        ondismiss: handlePaymentFailure,
        confirm_close: true,
        escape: true,
        animation: true
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleFinalSubmit = async () => {
    // Enforce registration cap (double-check before finalizing)
    if ((store.state?.teams ?? []).length >= 25) {
      setIsProcessing(false);
      return setError('Registration closed — slots full. Only 25 teams allowed.');
    }
    // Strict validation - ensure payment was successful
    if (!paymentData || !paymentData.id) {
      return setError('Payment verification failed. Please complete payment first.');
    }

    if (!receipt || !receipt.receiptNumber) {
      return setError('Receipt not generated. Please contact support.');
    }

    if (!screenshot) {
      return setError('Payment proof is mandatory.');
    }

    setIsProcessing(true);


    try {
      let ieeeProofUrl = '';
      if (formData.isIeeeMember && formData.ieeeProof) {
        // Upload IEEE proof to Firebase Storage
        const ieeeRef = ref(storage, `ieee_proofs/${formData.teamName}_${Date.now()}_${formData.ieeeProof.name}`);
        await uploadBytes(ieeeRef, formData.ieeeProof);
        ieeeProofUrl = await getDownloadURL(ieeeRef);
      }

      // First, create the team in Firestore (remove undefined fields for Firestore compatibility)
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        teamName: formData.teamName,
        leaderName: formData.leaderName,
        leaderContact: formData.leaderContact,
        email: formData.email,
        password: formData.password,
        members,
        isVerified: false,
        createdAt: Date.now(),
        isIeeeMember: formData.isIeeeMember,
        ...(formData.isIeeeMember && formData.ieeeNumber ? { ieeeNumber: formData.ieeeNumber } : {}),
        ...(formData.isIeeeMember && ieeeProofUrl ? { ieeeProofUrl } : {}),
        paymentId: paymentData?.id,
        amountPaid: paymentData?.amount,
        paymentScreenshot: screenshot,
        // Save receipt data to database (only if receipt exists)
        ...(receipt ? {
          receiptNumber: receipt.receiptNumber,
          receiptData: {
            receiptNumber: receipt.receiptNumber,
            transactionId: receipt.transactionId,
            amount: receipt.amount,
            tier: receipt.tier,
            paymentDate: receipt.paymentDate,
            timestamp: receipt.timestamp
          }
        } : {})
      };

      // Register the user with Firebase Authentication
      const registerResult = await store.register(formData.email, formData.password, {
        role: UserRole.PARTICIPANT,
        teamId: newTeam.id,
        teamName: formData.teamName,
        isVerified: false
      });

      if (registerResult.success) {
        // Atomically create team and increment counter using Firestore transaction
        try {
          const teamDocRef = firestoreDoc(db, 'teams', newTeam.id);
          const counterRef = firestoreDoc(db, 'counters', 'teams');

          await runTransaction(db, async (tx) => {
            const counterSnap: any = await tx.get(counterRef);
            const current = counterSnap.exists() ? (counterSnap.data().count || 0) : 0;
            if (current >= 25) throw new Error('CAP_REACHED');

            // Create team document
            tx.set(teamDocRef, {
              ...newTeam,
              createdAt: Date.now()
            });

            // Increment counter (create if missing)
            tx.set(counterRef, { count: current + 1 }, { merge: true });
          });

          // Update local app state copy
          await store.updateState(prev => ({
            ...prev,
            teams: [...prev.teams, newTeam]
          }));
        } catch (err: any) {
          if (err?.message === 'CAP_REACHED') {
            setIsProcessing(false);
            return setError('Registration closed — slots full. Only 25 teams allowed.');
          }
          console.error('Transaction error:', err);
          setIsProcessing(false);
          return setError('Failed to finalize registration. Please try again.');
        }

        setIsProcessing(false);
        setScreenshot('DONE');

        // Send registration confirmation email (skip if email service paused)
        if (emailEnabled) {
          try {
            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                service_id: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID',
                template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_2 || 'YOUR_TEMPLATE_ID',
                user_id: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY',
                template_params: {
                  to_email: formData.email,
                  to_name: formData.leaderName || 'Participant',
                  reply_to: formData.email,
                  team_name: formData.teamName || 'Participant',
                  password: formData.password,
                  // Add more params as needed
                }
              })
            });
          } catch (err) {
            console.error('Registration email send error:', err);
          }
        } else {
          console.info('Email service paused — skipping registration confirmation email.');
        }
        // Sign out the user immediately so they stay on the success screen
        // instead of being auto-redirected to the dashboard by App.tsx
        try {
          await store.logout();
        } catch (e) {
          console.error("Logout failed during registration success flow", e);
        }
      } else {
        setError(registerResult.error || 'Registration failed');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setIsProcessing(false);
    }
  };

  if (screenshot === 'DONE') {
    return (
      <div className="max-w-xl mx-auto py-12 px-6">
        <div className="glass-card p-12 rounded-[3rem] text-center border-t-4 border-t-indigo-500 glow-indigo">
          <div className="w-24 h-24 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Registration Locked</h2>
          <p className="text-slate-400 mb-10 font-medium">
            Team <b>{formData.teamName}</b> has been successfully submitted for verification.
          </p>

          <div className="mb-10">
            <p className="text-green-400 font-bold text-sm mb-2">For Major Updates Join The Whatsapp Channel</p>
            <a
              href="https://whatsapp.com/channel/0029Vb7eeY2Au3aVmysx1I1e"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-green-500 hover:underline text-sm font-semibold bg-green-500/10 px-4 py-2 rounded-full transition-colors"
            >
              Join WhatsApp Channel
            </a>
          </div>

          {receipt && (
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-left">
                  <p className="text-[9px] font-black text-green-500 uppercase">Payment Receipt</p>
                  <p className="text-sm font-mono text-white font-bold">{receipt.receiptNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadReceipt(receipt)}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => printReceipt(receipt)}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-900/40 rounded-3xl p-8 border border-white/5 text-left mb-10 space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] pb-2 border-b border-white/5">Next Milestones</h3>
            <div className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black">01</div>
              <div>
                <p className="text-sm font-bold text-white">Security Review</p>
                <p className="text-xs text-slate-500">Admins will verify your payment and credentials.</p>
              </div>
            </div>
            <div className="flex space-x-4 opacity-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black">02</div>
              <div>
                <p className="text-sm font-bold text-slate-400">Portal Unlock</p>
                <p className="text-xs text-slate-600">Access granted to project submissions and dashboard.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/login'}
            className="block w-full brand-gradient hover:opacity-90 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02]"
          >
            Return to Dashboard Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 overflow-x-hidden">
      <div className="flex items-center justify-between mb-12">
        <Logo size={40} />
        <Link to="/login" className="text-sm font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">Sign In Instead</Link>
      </div>

      <div className="glass-card p-6 sm:p-10 md:p-14 rounded-2xl sm:rounded-[3rem] shadow-2xl relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Team Registration</h1>
            <p className="text-slate-400 font-medium text-lg">Initialize your VibeXathon 1.0 identity</p>
            <div className="mt-3 flex items-center gap-3">
              <div className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${remainingSlots > 0 ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {remainingSlots > 0 ? `Slots remaining: ${remainingSlots}` : 'Registration Full'}
              </div>

              {/* Email service status indicator (admin toggle moved to Admin Dashboard) */}
            </div>

            {!emailEnabled && (
              <div className="mt-4 mb-4 p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-center font-semibold">
                Website Under Maintenance. Email service is temporarily paused — OTPs and confirmation emails are disabled.
              </div>
            )}
          </div>
          {(formData.teamName || isOtpVerified) && screenshot !== 'DONE' && (
            <button
              onClick={clearDraft}
              className="text-xs font-black text-slate-600 hover:text-red-500 transition-colors uppercase tracking-widest pb-1 border-b border-transparent hover:border-red-500/50"
            >
              
            </button>
          )}
        </div>

        {error && (
          <div className={`mb-10 p-5 border rounded-2xl text-sm font-bold animate-in ${error.startsWith('OTP successfully sent') ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400 shake'}`}>
            {error.startsWith('OTP successfully sent') ? '✅ ' : '⚠️ '} {error}
          </div>
        )}

        {step === 'form' ? (
          <>
            {slotsFull && (
              <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-center">
                Registration closed — slots full. Only 25 teams allowed.
              </div>
            )}

            <form onSubmit={handlePayment} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 ${slotsFull ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Team Designation</label>
                <input
                  type="text" required
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all placeholder:text-slate-700 font-bold"
                  placeholder="The Visionaries"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Leader Name</label>
                  <input type="text" required value={formData.leaderName} onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp No.</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    maxLength={10}
                    title="Enter a 10 digit mobile number"
                    value={formData.leaderContact}
                    onChange={(e) => setFormData({ ...formData, leaderContact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none"
                    placeholder="10 Digits"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                <div className="flex space-x-2">
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setIsOtpSent(false);
                      setIsOtpVerified(false);
                    }}
                    disabled={isOtpVerified}
                    className={`w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none ${isOtpVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="leader@email.com"
                  />
                  {!isOtpVerified && (
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={isSendingOtp || !formData.email || slotsFull || !emailEnabled}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-6 rounded-2xl transition-all whitespace-nowrap"
                    >
                      {!emailEnabled ? 'Email Paused' : (slotsFull ? 'Registration Closed' : (isSendingOtp ? 'Sending...' : (isOtpSent ? 'Resend OTP' : 'Send OTP')))}
                    </button>
                  )}
                </div>
              </div>

              {isOtpSent && !isOtpVerified && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Enter OTP</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-indigo-950/20 border border-indigo-500/30 rounded-2xl px-6 py-4 text-white outline-none tracking-widest font-mono"
                      placeholder="123456"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otp.length < 6}
                      className="bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-6 rounded-2xl transition-all"
                    >
                      Verify
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 ml-1">OTP sent to {formData.email}</p>
                </div>
              )}

              {isOtpVerified && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-400">Email Verified</p>
                    <p className="text-xs text-green-500/70">{formData.email}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none" />
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-white/5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Membership Tier</label>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isIeeeMember: true })}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center group ${formData.isIeeeMember ? 'bg-indigo-600/10 border-indigo-500 text-white glow-indigo' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                  >
                    <span className="font-black text-lg">IEEE</span>
                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">₹400 / Team</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isIeeeMember: false })}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center group ${!formData.isIeeeMember ? 'bg-indigo-600/10 border-indigo-500 text-white glow-indigo' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                  >
                    <span className="font-black text-lg">General</span>
                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">₹500 / Team</span>
                  </button>
                </div>

                {formData.isIeeeMember && (
                  <div className="mb-8 animate-in slide-in-from-top-4">
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 ml-1">IEEE Member ID</label>
                    <input
                      type="text" required
                      value={formData.ieeeNumber}
                      onChange={(e) => setFormData({ ...formData, ieeeNumber: e.target.value })}
                      placeholder="8-digit ID"
                      className="w-full bg-indigo-950/20 border border-indigo-500/30 rounded-xl px-6 py-3 text-white font-bold outline-none"
                    />
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 mt-4 ml-1">Upload IEEE Membership Card / Profile Screenshot</label>
                    <div
                      className="w-full bg-indigo-950/30 border-2 border-dashed border-indigo-500/40 rounded-2xl px-6 py-6 text-white font-bold outline-none flex flex-col items-center justify-center transition-all hover:border-indigo-400 hover:bg-indigo-950/40 cursor-pointer relative group"
                      onClick={() => document.getElementById('ieee-proof-input')?.click()}
                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) setFormData(f => ({ ...f, ieeeProof: file }));
                      }}
                    >
                      <input
                        id="ieee-proof-input"
                        type="file"
                        accept="image/*,application/pdf"
                        required
                        style={{ display: 'none' }}
                        onChange={e => setFormData(f => ({ ...f, ieeeProof: e.target.files?.[0] || null }))}
                      />
                      <div className="flex flex-col items-center justify-center w-full">
                        <svg className="w-8 h-8 mb-2 text-indigo-400 group-hover:text-indigo-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v-4a4 4 0 018 0v4m-4 4v-4m0 0V4m0 8h.01" /></svg>
                        <span className="text-xs text-indigo-300 group-hover:text-indigo-200 mb-1">Drag & drop or click to select</span>
                        <span className="text-[10px] text-slate-400">Accepted: JPG, PNG, PDF &bull; Max 5MB</span>
                        {formData.ieeeProof && (
                          <span className="mt-2 text-[11px] text-green-400 font-mono truncate max-w-[90%]">{formData.ieeeProof.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Roster</label>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                      {[2, 3, 4].map(size => (
                        <button key={size} type="button" onClick={() => handleTeamSizeChange(size)} className={`px-4 py-1.5 text-[10px] rounded-lg font-black transition-all ${formData.teamSize === size ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                          {size}P
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                    {members.map((member, idx) => (
                      <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
                        <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-3">
                          {idx === 0 ? "PRIMARY (LEADER)" : `COLLABORATOR ${idx + 1}`}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Name" required value={member.name} onChange={(e) => updateMember(idx, 'name', e.target.value)} className="bg-transparent border-b border-white/10 text-xs text-white outline-none pb-1" disabled={idx === 0} />
                          <input type="email" placeholder="Email" required value={member.email} onChange={(e) => updateMember(idx, 'email', e.target.value)} className="bg-transparent border-b border-white/10 text-xs text-white outline-none pb-1" disabled={idx === 0} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600/10 p-8 rounded-[2rem] border border-indigo-500/20 glow-indigo">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-300 font-black text-sm uppercase tracking-widest">Total Fees</span>
                  <span className="text-4xl font-black text-white">₹{calculateAmount()}</span>
                </div>
                <button type="submit" disabled={slotsFull} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {slotsFull ? 'Registration Closed' : 'Proceed to Secure Checkout'}
                </button>
              </div>
            </div>
          </form>
          </>
        ) : (
          <div className="max-w-xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-8">
            <div className="text-center mb-10">
              <span className="text-[10px] font-black bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block">Payment Active</span>
              <h2 className="text-3xl font-black text-white mb-2">Final Step</h2>
              <p className="text-slate-400">Please provide the transaction proof</p>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Razorpay ID</p>
                  <p className="text-sm font-mono text-indigo-400 font-bold">{paymentData?.id}</p>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Amount</p>
                  <p className="text-xl font-black text-white">₹{paymentData?.amount}</p>
                </div>
              </div>

              {receipt && (
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[9px] font-black text-green-500 uppercase mb-1">Receipt Generated</p>
                      <p className="text-lg font-mono text-white font-bold">{receipt.receiptNumber}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => downloadReceipt(receipt)}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Receipt
                    </button>
                    <button
                      onClick={() => printReceipt(receipt)}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Receipt
                    </button>
                  </div>
                  <p className="text-xs text-green-400/80 mt-4 text-center">
                    💡 KEEP your receipt for reference and CARRY with you.
                  </p>
                </div>
              )}

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] group ${screenshot ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-indigo-500/40 hover:bg-white/5'}`}
              >
                {screenshot ? (
                  <div className="relative">
                    {screenshot.startsWith('data:application/pdf') ? (
                      <div className="w-full max-w-xs mx-auto bg-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center border border-white/10 shadow-2xl">
                        <svg className="w-16 h-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        <p className="text-white font-bold text-sm">PDF Document Selected</p>
                      </div>
                    ) : (
                      <img src={screenshot} alt="Evidence" className="max-h-64 rounded-2xl shadow-2xl border border-white/10" />
                    )}
                    <div className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-all font-black text-xs text-white">CHANGE FILE</div>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 text-slate-600 group-hover:text-indigo-400 transition-colors">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-slate-300 font-black text-lg">Drop Screenshot Here</p>
                    <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">PDF, PNG or JPG Accepted</p>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
              </div>

              <button
                onClick={handleFinalSubmit}
                disabled={isProcessing || !screenshot}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center space-x-4"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'SUBMIT REGISTRATION'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
