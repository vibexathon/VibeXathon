import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppState, TeamMember, Team, UserRole } from '../types';
import Logo from '../components/Logo';
import { createReceipt, downloadReceipt, printReceipt, Receipt } from '../receiptService';
import { db, storage } from '../firebase';
import { doc as firestoreDoc, runTransaction, onSnapshot } from 'firebase/firestore';
import { createPaymentOrder, submitPaymentProof } from '../paymentService';

interface RegisterProps {
  store: {
    state: AppState;
    updateState: (updater: (prev: AppState) => AppState) => void;
    register: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
  };
}

const REGISTRATION_DRAFT_KEY = 'VBX_REGISTRATION_DRAFT';

const Register: React.FC<RegisterProps> = ({ store }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state from localStorage or defaults
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed.formData, ieeeProof: null };
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
      { name: '', email: '', contact: '' },
      { name: '', email: '', contact: '' }
    ];
  });

  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'payment' | 'verification'>(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.step || 'form';
      } catch (e) { }
    }
    return 'form';
  });

  const [paymentOrder, setPaymentOrder] = useState<any>(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.paymentOrder || null;
      } catch (e) { }
    }
    return null;
  });
  
  const [utrNumber, setUtrNumber] = useState(() => {
    const saved = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.utrNumber || '';
      } catch (e) { }
    }
    return '';
  });
  
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
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

  // OTP verification states
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
  
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [teamsCount, setTeamsCount] = useState<number>((store.state?.teams ?? []).length);

  // Persistence: Save to localStorage whenever relevant state changes
  useEffect(() => {
    const dataToSave = {
      formData: { ...formData, ieeeProof: null }, // Don't save File object
      members,
      step,
      paymentOrder,
      utrNumber,
      receipt,
      generatedOtp,
      isOtpSent,
      isOtpVerified
    };
    localStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(dataToSave));
  }, [formData, members, step, paymentOrder, utrNumber, receipt, generatedOtp, isOtpSent, isOtpVerified]);

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
  const slotsFull = teamsCount >= 25;
  const emailEnabled = (store.state?.settings as any)?.isEmailEnabled ?? (import.meta.env.VITE_EMAILJS_ENABLED !== 'false');

  useEffect(() => {
    setMembers(prev => {
      const updated = [...prev];
      updated[0] = { name: formData.leaderName, email: formData.email, contact: formData.leaderContact };
      return updated;
    });
  }, [formData.leaderName, formData.email, formData.leaderContact]);

  const handleTeamSizeChange = (size: number) => {
    setFormData({ ...formData, teamSize: size });
    setMembers(prev => {
      const newMembers = [...prev];
      if (size > prev.length) {
        for (let i = prev.length; i < size; i++) {
          newMembers.push({ name: '', email: '', contact: '' });
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
    if (TRUSTED_DOMAINS.includes(domain)) return true;
    if (domain.endsWith('.edu') || domain.endsWith('.ac.in') || domain.endsWith('.edu.in') || domain.endsWith('.org')) return true;
    return false;
  };

  const sendOtp = async () => {
    if (!emailEnabled) {
      return setError('Email service is temporarily paused. Please try again later.');
    }

    if (!isValidEmail(formData.email)) {
      return setError('Please enter a valid email address first.');
    }
    if (!isTrustedEmail(formData.email)) {
      return setError('Please use a valid email');
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
        setError(`OTP successfully sent to ${formData.email}`);
        setTimeout(() => {
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (slotsFull) {
      return setError('Registration closed — slots full. Only 25 teams allowed.');
    }

    if (!isOtpVerified) return setError('Please verify your email with OTP before proceeding.');
    if (!isValidEmail(formData.email)) return setError('Leader email is malformed.');
    if (!isTrustedEmail(formData.email)) return setError('Please use a valid email');
    if (formData.leaderContact.length !== 10) return setError('WhatsApp number must be 10 digits.');
    if (formData.isIeeeMember && !formData.ieeeNumber.trim()) return setError('IEEE Membership ID is required for discounted tier.');
    if (formData.isIeeeMember && formData.ieeeNumber.length !== 8) return setError('IEEE Membership ID must be exactly 8 digits.');
    if (formData.isIeeeMember && !formData.ieeeProof) return setError('IEEE Membership Card/Profile Screenshot is required for discounted tier.');

    for (let i = 0; i < members.length; i++) {
      if (!members[i].name || !members[i].email || !members[i].contact) return setError(`Incomplete details for member ${i + 1}.`);
      if (members[i].contact.length !== 10) return setError(`Member ${i + 1} contact must be 10 digits.`);
    }

    if ((store.state?.teams ?? []).some((t: Team) => t.teamName.toLowerCase() === formData.teamName.toLowerCase())) {
      return setError('This team name is already registered.');
    }

    // Generate UPI payment order
    setIsProcessing(true);
    try {
      const amount = calculateAmount();
      const order = await createPaymentOrder(amount);
      
      if (!order.qrCodeDataUrl) {
        throw new Error('QR code generation failed');
      }
      
      setPaymentOrder(order);
      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Failed to generate payment QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Payment proof submit handler triggered');

    if (!utrNumber || !paymentScreenshot) {
      setError('Please provide both UTR number and payment screenshot.');
      return;
    }

    setIsProcessing(true);
    try {
      // Upload image to Supabase Storage
      const { supabase } = await import('../supabaseClient');
      const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || 'payment-proofs';
      const fileName = `payment_proofs/${paymentOrder.orderId}_${Date.now()}.jpg`;
      const { data, error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, paymentScreenshot);
      if (uploadError) {
        setError(uploadError.message + ' Please Contact Here - 9035988820 / 9740789361' );
        setIsProcessing(false);
        return;
      }
      // Get public URL
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      if (!urlData?.publicUrl) {
        setError('Failed to get public image URL from Supabase');
        setIsProcessing(false);
        return;
      }

      // Update payment order with Supabase image URL
      const updatedOrder = submitPaymentProof(paymentOrder, utrNumber, urlData.publicUrl);
      setPaymentOrder(updatedOrder);

      // Generate receipt
      const generatedReceipt = createReceipt({
        transactionId: updatedOrder.orderId,
        utrNumber: utrNumber,
        teamName: formData.teamName,
        leaderName: formData.leaderName,
        email: formData.email,
        contact: formData.leaderContact,
        amount: updatedOrder.amount,
        isIeeeMember: formData.isIeeeMember,
        ieeeNumber: formData.ieeeNumber,
        teamSize: formData.teamSize,
        members: members
      });
      setReceipt(generatedReceipt);

      // Now save to Firebase
      let ieeeProofUrl = '';
      if (formData.isIeeeMember && formData.ieeeProof) {
        // Upload IEEE proof to Supabase
        const ieeeFileName = `ieee_proofs/${formData.teamName}_${Date.now()}_${formData.ieeeProof.name}`;
        const { data: ieeeData, error: ieeeUploadError } = await supabase.storage.from(bucketName).upload(ieeeFileName, formData.ieeeProof);
        if (ieeeUploadError) {
          console.error('IEEE proof upload error:', ieeeUploadError);
          setError('Failed to upload IEEE proof: ' + ieeeUploadError.message);
          setIsProcessing(false);
          return;
        } else {
          const { data: ieeeUrlData } = supabase.storage.from(bucketName).getPublicUrl(ieeeFileName);
          if (ieeeUrlData?.publicUrl) {
            ieeeProofUrl = ieeeUrlData.publicUrl;
          } else {
            setError('Failed to get IEEE proof URL');
            setIsProcessing(false);
            return;
          }
        }
      }

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
        paymentOrder: updatedOrder,
        receiptNumber: generatedReceipt.receiptNumber,
        receiptData: {
          receiptNumber: generatedReceipt.receiptNumber,
          transactionId: generatedReceipt.transactionId,
          amount: generatedReceipt.amount,
          tier: generatedReceipt.tier,
          paymentDate: generatedReceipt.paymentDate,
          timestamp: generatedReceipt.timestamp
        }
      };

      const registerResult = await store.register(formData.email, formData.password, {
        role: UserRole.PARTICIPANT,
        teamId: newTeam.id,
        teamName: formData.teamName,
        isVerified: false
      });

      if (registerResult.success) {
        const teamDocRef = firestoreDoc(db, 'teams', newTeam.id);
        const counterRef = firestoreDoc(db, 'counters', 'teams');

        await runTransaction(db, async (tx) => {
          const counterSnap: any = await tx.get(counterRef);
          const current = counterSnap.exists() ? (counterSnap.data().count || 0) : 0;
          if (current >= 25) throw new Error('CAP_REACHED');

          tx.set(teamDocRef, {
            ...newTeam,
            createdAt: Date.now()
          });

          tx.set(counterRef, { count: current + 1 }, { merge: true });
        });

        await store.updateState(prev => ({
          ...prev,
          teams: [...prev.teams, newTeam]
        }));

        localStorage.removeItem(REGISTRATION_DRAFT_KEY);

        // Send registration confirmation email
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
                }
              })
            });
          } catch (emailErr) {
            console.error('Email send error:', emailErr);
          }
        }

        setStep('verification');
      } else {
        setError(registerResult.error || 'Registration failed');
      }
    } catch (err: any) {
      if (err?.message === 'CAP_REACHED') {
        setError('Registration closed — slots full. Only 25 teams allowed.');
      } else {
        setError(err.message || 'Failed to submit payment proof');
      }
      console.error('Payment proof submit error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (slotsFull) {
      return setError('Registration closed — slots full. Only 25 teams allowed.');
    }

    if (!paymentOrder || !receipt) {
      return setError('Please complete payment proof submission first.');
    }

    setIsProcessing(true);

    try {
      let ieeeProofUrl = '';
      if (formData.isIeeeMember && formData.ieeeProof) {
        // Upload IEEE proof to Supabase
        const { supabase } = await import('../supabaseClient');
        const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || 'payment-proofs';
        const ieeeFileName = `ieee_proofs/${formData.teamName}_${Date.now()}_${formData.ieeeProof.name}`;
        const { data: ieeeData, error: ieeeUploadError } = await supabase.storage.from(bucketName).upload(ieeeFileName, formData.ieeeProof);
        if (ieeeUploadError) {
          console.error('IEEE proof upload error:', ieeeUploadError);
          setIsProcessing(false);
          return setError('Failed to upload IEEE proof: ' + ieeeUploadError.message);
        } else {
          const { data: ieeeUrlData } = supabase.storage.from(bucketName).getPublicUrl(ieeeFileName);
          if (ieeeUrlData?.publicUrl) {
            ieeeProofUrl = ieeeUrlData.publicUrl;
          } else {
            setIsProcessing(false);
            return setError('Failed to get IEEE proof URL');
          }
        }
      }

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
        paymentOrder: paymentOrder,
        receiptNumber: receipt.receiptNumber,
        receiptData: {
          receiptNumber: receipt.receiptNumber,
          transactionId: receipt.transactionId,
          amount: receipt.amount,
          tier: receipt.tier,
          paymentDate: receipt.paymentDate,
          timestamp: receipt.timestamp
        }
      };

      const registerResult = await store.register(formData.email, formData.password, {
        role: UserRole.PARTICIPANT,
        teamId: newTeam.id,
        teamName: formData.teamName,
        isVerified: false
      });

      if (registerResult.success) {
        try {
          const teamDocRef = firestoreDoc(db, 'teams', newTeam.id);
          const counterRef = firestoreDoc(db, 'counters', 'teams');

          await runTransaction(db, async (tx) => {
            const counterSnap: any = await tx.get(counterRef);
            const current = counterSnap.exists() ? (counterSnap.data().count || 0) : 0;
            if (current >= 25) throw new Error('CAP_REACHED');

            tx.set(teamDocRef, {
              ...newTeam,
              createdAt: Date.now()
            });

            tx.set(counterRef, { count: current + 1 }, { merge: true });
          });

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
        localStorage.removeItem(REGISTRATION_DRAFT_KEY);

        // Send registration confirmation email
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
                }
              })
            });
          } catch (err) {
            console.error('Registration email send error:', err);
          }
        }

        try {
          await store.logout();
        } catch (e) {
          console.error("Logout failed during registration success flow", e);
        }

        // Navigate to success page
        navigate('/register-success', { state: { teamName: formData.teamName, receipt } });
      } else {
        setError(registerResult.error || 'Registration failed');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setIsProcessing(false);
    }
  };

  const clearDraft = () => {
    if (confirm("This will clear your registration progress. Are you sure?")) {
      localStorage.removeItem(REGISTRATION_DRAFT_KEY);
      window.location.reload();
    }
  };

  // Success page after registration
  if (step === 'verification' && !isProcessing && receipt) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6">
        <div className="glass-card p-12 rounded-[3rem] text-center border-t-4 border-t-indigo-500 glow-indigo">
          <div className="w-24 h-24 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Registration Submitted</h2>
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
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] pb-2 border-b border-white/5">Next Steps</h3>
            <div className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black">01</div>
              <div>
                <p className="text-sm font-bold text-white">Payment Verification</p>
                <p className="text-xs text-slate-500">Admin will verify your UTR and payment screenshot.</p>
              </div>
            </div>
            <div className="flex space-x-4 opacity-50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black">02</div>
              <div>
                <p className="text-sm font-bold text-slate-400">Portal Access</p>
                <p className="text-xs text-slate-600">Full dashboard and submission features unlocked.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/login'}
            className="block w-full brand-gradient hover:opacity-90 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02]"
          >
            Go to Login
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
            </div>

            {!emailEnabled && (
              <div className="mt-4 mb-4 p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-center font-semibold">
                Website Under Maintenance. Email service is temporarily paused — OTPs and confirmation emails are disabled.
              </div>
            )}
          </div>
          {(formData.teamName || isOtpVerified) && step === 'form' && (
            <button
              onClick={clearDraft}
              className="text-xs font-black text-slate-600 hover:text-red-500 transition-colors uppercase tracking-widest pb-1 border-b border-transparent hover:border-red-500/50"
            >
              Clear Draft
            </button>
          )}
        </div>

        {error && (
          <div className={`mb-10 p-5 border rounded-2xl text-sm font-bold animate-in ${error.startsWith('OTP successfully sent') ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400 shake'}`}>
            {error.startsWith('OTP successfully sent') ? '✅ ' : '⚠️ '} {error}
          </div>
        )}

        {slotsFull && step === 'form' ? (
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-12 rounded-[3rem] text-center border-t-4 border-t-red-500">
              <div className="w-32 h-32 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-4xl font-black text-white mb-4">Registrations Closed</h2>
              <p className="text-slate-400 mb-6 font-medium text-lg">
                All <span className="text-red-400 font-bold">25 team slots</span> have been filled
              </p>
              <p className="text-slate-500 mb-10 leading-relaxed">
                Thank you for your interest in Vibexathon 1.0. Unfortunately, we have reached our maximum capacity. 
                Follow us on social media for updates about future events.
              </p>

              <div className="bg-slate-900/40 rounded-3xl p-8 border border-white/5 mb-10">
                <p className="text-sm font-bold text-indigo-400 mb-4">Stay Connected</p>
                <a
                  href="https://whatsapp.com/channel/0029Vb7eeY2Au3aVmysx1I1e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl transition-all"
                >
                  Join WhatsApp Channel
                </a>
              </div>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all"
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          <>
        {step === 'form' && (
          <>
            {slotsFull && (
              <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/30 text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-red-500 mb-2">Registrations Closed</h3>
                <p className="text-red-400 font-bold text-lg mb-1">All 25 team slots have been filled</p>
                <p className="text-slate-400 text-sm">Thank you for your interest in Vibexathon 1.0</p>
              </div>
            )}

            <form onSubmit={handlePayment} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 ${slotsFull ? 'pointer-events-none opacity-60' : ''}`}>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Team Name</label>
                  <input
                    type="text" required
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all placeholder:text-slate-700 font-bold"
                    placeholder="Enter team name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Leader Name</label>
                    <input
                      type="text" required
                      value={formData.leaderName}
                      onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp (10 digits)</label>
                    <input
                      type="tel" required
                      value={formData.leaderContact}
                      onChange={(e) => setFormData({ ...formData, leaderContact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none font-bold"
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isOtpVerified}
                    className={`w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none font-bold ${isOtpVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  {!isOtpVerified && (
                    <div className="flex gap-2 mt-2">
                      {!isOtpSent ? (
                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={isSendingOtp || !formData.email}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                        >
                          {isSendingOtp ? 'Sending...' : 'Send OTP'}
                        </button>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className="flex-1 bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 text-white text-sm"
                            maxLength={6}
                          />
                          <button
                            type="button"
                            onClick={verifyOtp}
                            className="text-xs bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg"
                          >
                            Verify
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {isOtpVerified && (
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 mt-2">
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs text-green-400 font-bold">Email verified - Cannot be changed</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <input
                    type="password" required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={!isOtpVerified}
                    className={`w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none font-bold ${!isOtpVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Team Size</label>
                  <div className="flex gap-3">
                    {[2, 3, 4].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleTeamSizeChange(size)}
                        disabled={!isOtpVerified}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isOtpVerified ? 'opacity-50 cursor-not-allowed' : ''} ${formData.teamSize === size ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Membership Tier</label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* IEEE Card */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isIeeeMember: true })}
                      disabled={!isOtpVerified}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${!isOtpVerified ? 'opacity-50 cursor-not-allowed' : ''} ${
                        formData.isIeeeMember 
                          ? 'border-indigo-500 bg-indigo-500/10' 
                          : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-center">
                        <h3 className="text-2xl font-black text-white mb-2">IEEE</h3>
                        <p className="text-slate-400 text-sm font-bold">₹400 / TEAM</p>
                      </div>
                      {formData.isIeeeMember && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>

                    {/* General Card */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isIeeeMember: false })}
                      disabled={!isOtpVerified}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${!isOtpVerified ? 'opacity-50 cursor-not-allowed' : ''} ${
                        !formData.isIeeeMember 
                          ? 'border-indigo-500 bg-indigo-500/10' 
                          : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-center">
                        <h3 className="text-2xl font-black text-white mb-2">General</h3>
                        <p className="text-slate-400 text-sm font-bold">₹500 / TEAM</p>
                      </div>
                      {!formData.isIeeeMember && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {formData.isIeeeMember && (
                    <div className={`bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 space-y-4 ${!isOtpVerified ? 'opacity-50 pointer-events-none' : ''}`}>
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">IEEE Member Details (8 digits)</p>
                      <input
                        type="text"
                        placeholder="Enter IEEE membership ID"
                        value={formData.ieeeNumber}
                        onChange={(e) => setFormData({ ...formData, ieeeNumber: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-white outline-none font-bold text-sm"
                        maxLength={8}
                        disabled={!isOtpVerified}
                      />
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400">Upload IEEE Membership Proof (Image or PDF)</label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setFormData({ ...formData, ieeeProof: e.target.files?.[0] || null })}
                            className="w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:font-bold hover:file:bg-indigo-500 file:cursor-pointer cursor-pointer"
                            disabled={!isOtpVerified}
                          />
                          {formData.ieeeProof && (
                            <p className="mt-2 text-xs text-green-400 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {formData.ieeeProof.name}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">Upload your IEEE membership card or profile screenshot</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className={`space-y-4 ${!isOtpVerified ? 'opacity-50 pointer-events-none' : ''}`}>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Team Members</label>
                  {members.map((member, idx) => (
                    <div key={idx} className="space-y-3 p-4 bg-slate-900/30 rounded-2xl">
                      <p className="text-xs font-bold text-indigo-400">Member {idx + 1} {idx === 0 && '(Leader)'}</p>
                      <input
                        type="text"
                        placeholder="Enter name"
                        value={member.name}
                        onChange={(e) => updateMember(idx, 'name', e.target.value)}
                        disabled={idx === 0 || !isOtpVerified}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-white outline-none text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Enter email"
                        value={member.email}
                        onChange={(e) => updateMember(idx, 'email', e.target.value)}
                        disabled={idx === 0 || !isOtpVerified}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-white outline-none text-sm"
                      />
                      <input
                        type="tel"
                        placeholder="Enter mobile number"
                        value={member.contact}
                        onChange={(e) => updateMember(idx, 'contact', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        disabled={idx === 0 || !isOtpVerified}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-white outline-none text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className={`bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 ${!isOtpVerified ? 'opacity-50' : ''}`}>
                  <p className="text-sm font-bold text-white mb-2">Registration Fee</p>
                  <p className="text-3xl font-black text-indigo-400">₹{calculateAmount()}</p>
                  <p className="text-xs text-slate-500 mt-1">{formData.isIeeeMember ? 'IEEE Member Rate' : 'General Rate'}</p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || slotsFull || !isOtpVerified}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </form>
          </>
        )}
        </>
        )}

        {step === 'payment' && paymentOrder && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white mb-2">Scan QR Code to Pay</h2>
              <p className="text-slate-400">Use any UPI app to complete the payment</p>
              
              {/* Saved State Indicator */}
              <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-bold text-green-400">Payment details saved - Safe to close page</span>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-3xl p-8 mb-8">
              {/* QR Code is Primary - Most Reliable */}
              <div className="flex justify-center mb-6">
                {paymentOrder.qrCodeDataUrl ? (
                  <div className="text-center">
                    <img 
                      src={paymentOrder.qrCodeDataUrl} 
                      alt="UPI QR Code" 
                      className="w-72 h-72 rounded-2xl border-4 border-indigo-500/30 bg-white p-3 shadow-2xl mx-auto"
                    />
                    <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-3">
                      <p className="text-sm font-bold text-green-400">
                        ✓ Scan with any UPI app to pay
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Works with Google Pay, PhonePe, Paytm, Amazon Pay, BHIM
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-72 h-72 bg-slate-800 rounded-2xl border-4 border-white/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                      <p className="text-slate-400 text-sm">Generating QR Code...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 text-center">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Order ID</p>
                  <p className="text-lg font-mono font-bold text-white">{paymentOrder.orderId}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                  <p className="text-xs text-slate-400 mb-1">Amount to Pay</p>
                  <p className="text-3xl font-black text-green-400">₹{paymentOrder.amount}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handlePaymentProofSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">UTR Number (12 digits)</label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                  placeholder="Enter UTR number"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none font-mono text-lg"
                  maxLength={12}
                />
                <p className="text-xs text-slate-500">Find UTR in your payment confirmation message</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Payment Screenshot</label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => setPaymentScreenshot(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:font-bold hover:file:bg-indigo-500"
                />
                <p className="text-xs text-slate-500">Upload screenshot showing successful payment</p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Submitting...' : 'Submit Payment Proof & Complete Registration'}
              </button>
              {error && (
                <div className="mt-4 text-red-500 font-bold text-center">
                  {error}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
