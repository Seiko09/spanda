import React, { useState } from 'react';
import './i18n';
import { useTranslation } from 'react-i18next';
import './index.css';

function App() {
  const [view, setView] = useState('landing');
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-[#0A3A6B] text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">KICB Spanda E-Queue</h1>
        <select onChange={(e) => i18n.changeLanguage(e.target.value)} className="bg-[#0A3A6B] border border-white/30 rounded p-1">
          <option value="ru">RU</option>
          <option value="ky">KY</option>
          <option value="en">EN</option>
        </select>
      </header>
      <main className="p-6 flex flex-wrap gap-6 justify-center mt-10">
        {['Terminal', 'Operator', 'TV Display', 'Admin'].map(title => (
          <div key={title} onClick={() => setView(title.toLowerCase())} className="bg-white p-10 rounded-xl shadow-lg border-b-4 border-[#00A859] cursor-pointer hover:scale-105 transition-transform">
            <h2 className="text-xl font-bold text-[#0A3A6B]">{title}</h2>
          </div>
        ))}
      </main>
    </div>
  );
}
export default App;
