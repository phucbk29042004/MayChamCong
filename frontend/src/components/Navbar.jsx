import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="sticky top-0 z-50 bg-canvas border-b border-hairline h-14 flex items-center justify-between px-6 select-none">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('attendance')}>
        <span className="text-2xl">🦙</span>
        <span className="font-display font-semibold text-lg text-ink tracking-tight">Ollama HR</span>
      </div>

      <div className="flex items-center space-x-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab('employees')}
          className={`transition-colors duration-150 py-1 ${
            activeTab === 'employees'
              ? 'text-ink font-semibold border-b-2 border-primary'
              : 'text-body hover:text-ink'
          }`}
        >
          Nhân viên
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`transition-colors duration-150 py-1 ${
            activeTab === 'attendance'
              ? 'text-ink font-semibold border-b-2 border-primary'
              : 'text-body hover:text-ink'
          }`}
        >
          Chấm công
        </button>
        <button
          onClick={() => setActiveTab('salary')}
          className={`transition-colors duration-150 py-1 ${
            activeTab === 'salary'
              ? 'text-ink font-semibold border-b-2 border-primary'
              : 'text-body hover:text-ink'
          }`}
        >
          Bảng lương
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-xs text-mute font-mono">v1.0.0</span>
        <div className="bg-surface-soft px-3 py-1.5 rounded-full border border-hairline text-xs font-mono text-charcoal">
          System OK
        </div>
      </div>
    </nav>
  );
}
