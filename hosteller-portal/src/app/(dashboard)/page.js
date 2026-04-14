'use client';
import { useState, useEffect } from 'react';
import { Camera, MapPin, Activity, Check } from 'lucide-react';
import { simulateScan } from '../../lib/api';

export default function MobileDashboard() {
  const [hostellerId, setHostellerId] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  // Load hostellerId from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem('hostellerId');
    if (storedId) setHostellerId(storedId);
  }, []);

  const handleScan = async (type) => {
    if (!hostellerId) {
      alert('No hosteller ID found. Please log in again.');
      return;
    }
    setIsSimulating(true);
    try {
      const res = await simulateScan({ 
        hosteller_id: hostellerId, 
        type,
        timestamp: new Date().toISOString(),
        camera_id: 'SIM-MOBILE-01'
      });
      setLastScan(res.data.scanEvent);
      setTimeout(() => setIsSimulating(false), 800);
    } catch (err) {
      console.error(err);
      setIsSimulating(false);
      alert("Scan failed");
    }
  };

  return (
    <div className="p-6 pb-20 flex flex-col gap-6">
      <div className="mt-4">
        <p className="text-[var(--color-campus-muted)] flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4" /> Campus View
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-campus-text)]">Good Morning, Hosteller</h1>
      </div>

      <div className="campus-card bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white overflow-hidden relative shadow-lg shadow-indigo-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Activity className="w-24 h-24" />
        </div>
        
        <div className="relative z-10">
          <p className="text-indigo-100 font-medium mb-1">Current Status</p>
          <div className="flex items-center gap-3 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-2xl font-bold tracking-tight">Active In Campus</span>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/20">
            <p className="text-sm text-indigo-100 mb-2">Simulate ID Card Scan</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleScan('entry')}
                className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-2.5 font-medium transition-colors flex items-center justify-center gap-2"
                disabled={isSimulating}
              >
                Entry
              </button>
              <button 
                onClick={() => handleScan('exit')}
                className="flex-1 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-xl py-2.5 font-medium transition-colors flex items-center justify-center gap-2"
                disabled={isSimulating}
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSimulating && (
        <div className="campus-card flex flex-col items-center justify-center py-10 animate-pulse">
          <Camera className="w-10 h-10 text-[var(--color-campus-accent)] animate-bounce mb-4" />
          <p className="font-medium text-[var(--color-campus-text)]">Scanning ID...</p>
        </div>
      )}

      {!isSimulating && lastScan && (
        <div className="campus-card bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 flex items-start gap-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-2 bg-emerald-500 rounded-full text-white mt-1">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-400">Scan Successful</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-500/80 mt-1">
              Recorded {lastScan.type} scan at {new Date(lastScan.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
