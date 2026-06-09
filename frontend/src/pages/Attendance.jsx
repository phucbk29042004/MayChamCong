import React from 'react';
import AttendanceGrid from '../components/AttendanceGrid.jsx';

export default function Attendance({ month, setMonth, year, setYear }) {
  return (
    <div className="container mx-auto px-6 py-8">
      <AttendanceGrid
        month={month}
        setMonth={setMonth}
        year={year}
        setYear={setYear}
      />
    </div>
  );
}
