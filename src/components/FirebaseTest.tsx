import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const FirebaseTest = () => {
  const [testStatus, setTestStatus] = useState<string>('Testing...');
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const runTest = async () => {
      try {
        setTestStatus('Connecting to Database...');
        
        // Test 1: Write a test document
        const testDocRef = doc(db, 'tests', 'connection_test');
        await setDoc(testDocRef, {
          timestamp: new Date().toISOString(),
          message: 'Database connection test successful!'
        });
        
        setTestStatus('Reading test document...');
        
        // Test 2: Read the document back
        const docSnap = await getDoc(testDocRef);
        if (docSnap.exists()) {
          setTestResult(`✅ Database connection successful! Read: ${docSnap.data().message}`);
          setTestStatus('Test completed successfully');
        } else {
          setTestResult('❌ Could not read test document');
          setTestStatus('Test failed');
        }
      } catch (error: any) {
        setTestResult(`❌ Database connection failed: ${error.message}`);
        setTestStatus('Test failed');
        console.error('Database test error:', error);
      }
    };

    runTest();
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-slate-900/90 border border-slate-700 rounded-lg p-4 max-w-sm z-50">
      <h3 className="text-slate-200 font-bold text-sm mb-2">Database Connection Test</h3>
      <p className="text-slate-400 text-xs mb-2">{testStatus}</p>
      <p className="text-xs font-mono text-slate-300">{testResult}</p>
    </div>
  );
};