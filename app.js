import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import { TrendingUp } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Stock AI Trader</h1>
            <p className="text-sm text-gray-400">AI-Powered Trading Intelligence</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Dashboard />
      </main>
    </div>
  );
}
