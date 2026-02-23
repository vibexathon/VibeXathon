import React from 'react';
import { useStore } from '../store';
import { Wifi, WifiOff, Database, AlertCircle } from 'lucide-react';

export const DatabaseStatus = () => {
  const { isSyncing, lastSync, error } = useStore();

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-900/90 border border-red-700 rounded-lg p-3 max-w-xs z-50">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-200 font-medium text-sm">Database Error</p>
            <p className="text-red-400 text-xs mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-slate-900/90 border border-slate-700 rounded-lg p-3 max-w-xs z-50">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Database className="w-5 h-5 text-indigo-400" />
          {isSyncing ? (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          ) : (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
          )}
        </div>
        <div>
          <p className="text-slate-200 font-medium text-sm">Database Connected</p>
          {lastSync && (
            <p className="text-slate-400 text-xs">
              Last sync: {lastSync.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};