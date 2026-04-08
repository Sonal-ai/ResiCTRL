import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import Leaves from './pages/Leaves';

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentsList />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="*" element={<div className="flex h-full items-center justify-center text-slate-400">Page under construction...</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
