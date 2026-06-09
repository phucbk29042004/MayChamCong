import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar.jsx';
import Employees from './pages/Employees.jsx';
import Attendance from './pages/Attendance.jsx';
import Salary from './pages/Salary.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [month, setMonth] = useState(5);
  const [year, setYear] = useState(2026);

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <Employees />;
      case 'attendance':
        return (
          <Attendance
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
          />
        );
      case 'salary':
        return (
          <Salary
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
          />
        );
      default:
        return (
          <Attendance
            month={month}
            setMonth={setMonth}
            year={year}
            setYear={setYear}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-canvas">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1">
          {renderContent()}
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#171717',
              color: '#ffffff',
              borderRadius: '9999px',
              fontSize: '14px',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}
