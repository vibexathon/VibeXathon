/**
 * Receipt Generation Service for Vibexathon 1.0
 * Generates PDF payment receipts and manages receipt data
 */

import jsPDF from 'jspdf';
import { TeamMember } from './types';

export interface Receipt {
  receiptNumber: string;
  transactionId: string;
  utrNumber?: string;
  teamName: string;
  leaderName: string;
  email: string;
  contact: string;
  amount: number;
  tier: 'IEEE' | 'General';
  ieeeNumber?: string;
  teamSize: number;
  members?: TeamMember[];
  paymentDate: number;
  timestamp: number;
}

/**
 * Generate a unique receipt number
 * Format: VBX-YYYYMMDD-XXXXX
 */
export const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  
  return `VBX-${year}${month}${day}-${random}`;
};

/**
 * Create receipt data from payment information
 */
export const createReceipt = (data: {
  transactionId: string;
  utrNumber?: string;
  teamName: string;
  leaderName: string;
  email: string;
  contact: string;
  amount: number;
  isIeeeMember: boolean;
  ieeeNumber?: string;
  teamSize: number;
  members?: TeamMember[];
}): Receipt => {
  return {
    receiptNumber: generateReceiptNumber(),
    transactionId: data.transactionId,
    utrNumber: data.utrNumber,
    teamName: data.teamName,
    leaderName: data.leaderName,
    email: data.email,
    contact: data.contact,
    amount: data.amount,
    tier: data.isIeeeMember ? 'IEEE' : 'General',
    ieeeNumber: data.ieeeNumber,
    teamSize: data.teamSize,
    members: data.members,
    paymentDate: Date.now(),
    timestamp: Date.now()
  };
};

/**
 * Generate PDF receipt
 */
export const generateReceiptPDF = (receipt: Receipt): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const date = new Date(receipt.paymentDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const time = new Date(receipt.paymentDate).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Colors (defined as tuples for TypeScript)
  const primaryColor: [number, number, number] = [102, 126, 234]; // #667eea
  const successColor: [number, number, number] = [16, 185, 129]; // #10b981
  const darkColor: [number, number, number] = [15, 23, 42]; // #0f172a
  const grayColor: [number, number, number] = [100, 116, 139]; // #64748b
  
  let yPos = 20;

  // Header with gradient effect (simulated with rectangles)
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('VIBEXATHON 1.0', 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PAYMENT RECEIPT', 105, 32, { align: 'center' });
  
  // Receipt Number Badge
  doc.setFillColor(255, 255, 255, 0.2);
  doc.roundedRect(65, 38, 80, 8, 4, 4, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(receipt.receiptNumber, 105, 43, { align: 'center' });
  
  yPos = 60;

  // Success Badge
  doc.setFillColor(16, 185, 129, 0.1);
  doc.roundedRect(15, yPos, 60, 10, 5, 5, 'F');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ PAYMENT SUCCESSFUL', 45, yPos + 6.5, { align: 'center' });
  
  yPos += 20;

  // Team Details Section
  doc.setTextColor(...darkColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TEAM DETAILS', 15, yPos);
  
  yPos += 2;
  doc.setDrawColor(102, 126, 234);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, 195, yPos);
  
  yPos += 8;

  // Team Info Grid with text wrapping
  const addField = (label: string, value: string, xPos: number, maxWidth: number = 85) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text(label.toUpperCase(), xPos, yPos);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    // Use splitTextToSize to handle long text
    const lines = doc.splitTextToSize(value, maxWidth);
    doc.text(lines[0] || value, xPos, yPos + 5);
  };

  addField('Team Name', receipt.teamName, 15, 85);
  addField('Team Leader', receipt.leaderName, 110, 85);
  yPos += 12;
  
  addField('Email Address', receipt.email, 15, 85);
  addField('Contact Number', `+91 ${receipt.contact}`, 110, 85);
  yPos += 12;
  
  addField('Payment Date', `${date} at ${time}`, 15, 85);
  addField('Team Size', `${receipt.teamSize} Members`, 110, 85);
  yPos += 12;

  addField('Registration Tier', `${receipt.tier} Category`, 15, 85);
  if (receipt.ieeeNumber) {
    addField('IEEE Member ID', receipt.ieeeNumber, 110, 85);
  }
  yPos += 15;

  // Team Members Section
  if (receipt.members && receipt.members.length > 0) {
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TEAM MEMBERS', 15, yPos);
    
    yPos += 2;
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(15, yPos, 195, yPos);
    
    yPos += 8;

    receipt.members.forEach((member, index) => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`Member ${index + 1}${index === 0 ? ' (Leader)' : ''}`, 15, yPos);
      
      yPos += 5;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkColor);
      const memberLines = doc.splitTextToSize(`${member.name} | ${member.email} | +91 ${member.contact}`, 175);
      doc.text(memberLines, 15, yPos);
      
      yPos += 5 * memberLines.length + 3;
    });

    yPos += 5;
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(15, yPos, 195, yPos);
  yPos += 10;

  // Payment Details Section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, yPos, 180, 30, 8, 8, 'F');
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT PAID', 105, yPos + 8, { align: 'center' });
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text(receipt.amount.toString(), 105, yPos + 22, { align: 'center' });
  
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INR', 105, yPos + 28, { align: 'center' });
  
  yPos += 40;

  // Transaction ID
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('TRANSACTION ID', 15, yPos);
  
  yPos += 5;
  doc.setFillColor(241, 245, 249);
  const txnIdHeight = 10;
  doc.roundedRect(15, yPos, 180, txnIdHeight, 4, 4, 'F');
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.setTextColor(...darkColor);
  // Split transaction ID if too long
  const txnLines = doc.splitTextToSize(receipt.transactionId, 170);
  doc.text(txnLines, 105, yPos + 6.5, { align: 'center' });
  
  yPos += 15;

  // UTR Number (if available)
  if (receipt.utrNumber) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text('UTR NUMBER', 15, yPos);
    
    yPos += 5;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, yPos, 180, 10, 4, 4, 'F');
    doc.setFontSize(10);
    doc.setFont('courier', 'bold');
    doc.setTextColor(...darkColor);
    doc.text(receipt.utrNumber, 105, yPos + 6.5, { align: 'center' });
    
    yPos += 15;
  } else {
    yPos += 5;
  }

  // Footer Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, yPos, 180, 30, 8, 8, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  
  // Multi-line text with proper spacing
  let footerY = yPos + 8;
  doc.text('This is an official payment receipt for Vibexathon 1.0 registration.', 105, footerY, { align: 'center', maxWidth: 170 });
  
  footerY += 5;
  doc.text('Your registration is pending admin approval. You will receive portal', 105, footerY, { align: 'center', maxWidth: 170 });
  
  footerY += 4;
  doc.text('access once verified by our team.', 105, footerY, { align: 'center', maxWidth: 170 });
  
  footerY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('Payment successful - Keep this receipt safe.', 105, footerY, { align: 'center' });
  
  yPos += 37;

  // Bottom Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('© 2026 Vibexathon 1.0 | Designed & Developed by Samrak Production', 105, yPos, { align: 'center' });

  return doc;
};

/**
 * Download receipt as PDF file
 */
export const downloadReceipt = (receipt: Receipt): void => {
  const doc = generateReceiptPDF(receipt);
  doc.save(`Vibexathon_Receipt_${receipt.receiptNumber}.pdf`);
};

/**
 * Print receipt
 */
export const printReceipt = (receipt: Receipt): void => {
  const doc = generateReceiptPDF(receipt);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};
