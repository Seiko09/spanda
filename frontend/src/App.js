import React, { useState, useEffect } from 'react';
import './i18n';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './index.css';

// Using relative path for API calls to work with unified Docker build
const API_BASE = '/api';

function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-[#0A3A6B] text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#0A3A6B] font-bold">K</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">KICB Spanda E-Queue</h1>
        </div>
        <div className="flex items-center space-x-4">
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-[#0A3A6B] border border-white/30 text-sm rounded p-1"
          >
            <option value="ru">Русский</option>
            <option value="ky">Кыргызча</option>
            <option value="en">English</option>
          </select>
          {user && (
            <button onClick={() => setUser(null)} className="text-sm underline">
              {t('logout', 'Выйти')}
            </button>
          )}
        </div>
      </header>

      <main className="p-6">
        {view === 'landing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-10">
            <ViewCard title="Terminal" icon="🖨️" onClick={() => setView('terminal')} />
            <ViewCard title="Operator" icon="💻" onClick={() => setView('operator')} />
            <ViewCard title="TV Display" icon="📺" onClick={() => setView('tv')} />
            <ViewCard title="Admin" icon="⚙️" onClick={() => setView('admin')} />
          </div>
        )}

        {view === 'terminal' && <TerminalView onBack={() => setView('landing')} />}
        {view === 'operator' && <OperatorView onBack={() => setView('landing')} />}
        {view === 'tv' && <TVView onBack={() => setView('landing')} />}
        {view === 'admin' && <AdminView onBack={() => setView('landing')} />}
      </main>
    </div>
  );
}

const ViewCard = ({ title, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-8 rounded-xl shadow-lg border-b-4 border-[#00A859] hover:transform hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4"
  >
    <span className="text-5xl">{icon}</span>
    <h2 className="text-xl font-bold text-[#0A3A6B]">{title}</h2>
  </div>
);

const TerminalView = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [ticket, setTicket] = useState(null);
  const { i18n } = useTranslation();
  const lang = i18n.language || 'ru';

  useEffect(() => {
    // Fetch real services from API
    axios.get(`${API_BASE}/services`)
      .then(res => setCategories(res.data))
      .catch(err => {
        // Mock fallback if API is not available
        setCategories([
          { id: 1, code: 'A', name: { ru: 'Кредиты', ky: 'Кредиттер', en: 'Loans' }, children: [] }
        ]);
      });
  }, []);

  if (ticket) {
    return (
      <div className="max-w-md mx-auto bg-white p-10 rounded shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-gray-500 mb-4 italic">KICB Bank</h2>
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
        <p className="text-gray-600 mb-2">Ваш номер / Your number</p>
        <h1 className="text-7xl font-black text-[#0A3A6B] my-6">{ticket.number}</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleString()}</p>
        <button
          onClick={() => {setTicket(null); setStep(1);}}
          className="mt-10 bg-[#00A859] text-white px-6 py-2 rounded-full font-bold"
        >
          OK
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-4 text-sm text-gray-500">← Back</button>
      <h2 className="text-3xl font-bold text-[#0A3A6B] mb-8 text-center">
        {step === 1 ? 'Выберите категорию' : 'Выберите услугу'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setTicket({ number: cat.code + '001' })}
            className="p-8 bg-white rounded-lg shadow font-bold text-xl text-[#0A3A6B] border-l-8 border-[#0A3A6B] text-left hover:bg-gray-50"
          >
            {cat.name[lang]}
          </button>
        ))}
      </div>
    </div>
  );
};

const OperatorView = ({ onBack }) => (
  <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
    <button onClick={onBack} className="mb-4 text-sm text-gray-500">← Back</button>
    <div className="flex justify-between items-center mb-10">
      <div>
        <h2 className="text-2xl font-bold text-[#0A3A6B]">Окно №5</h2>
        <p className="text-sm text-gray-500">Оператор: Ибрагим</p>
      </div>
      <div className="bg-gray-100 p-4 rounded text-center">
        <p className="text-xs uppercase text-gray-400">Текущий клиент</p>
        <p className="text-4xl font-black text-[#00A859]">A041</p>
      </div>
    </div>
    <div className="flex space-x-4">
      <button className="flex-1 bg-[#0A3A6B] text-white py-6 rounded-lg font-bold text-xl hover:bg-blue-900 transition-colors">
        ВЫЗВАТЬ СЛЕДУЮЩЕГО
      </button>
    </div>
  </div>
);

const TVView = ({ onBack }) => (
  <div className="max-w-6xl mx-auto h-[80vh] flex flex-col">
    <button onClick={onBack} className="mb-4 text-sm text-gray-500 self-start">← Back</button>
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center justify-center border-t-8 border-[#00A859]">
        <h2 className="text-4xl font-bold text-gray-400 mb-10">СЕЙЧАС ВЫЗЫВАЕТСЯ</h2>
        <h1 className="text-[12rem] font-black text-[#0A3A6B] leading-none">A041</h1>
        <p className="text-6xl font-bold text-[#00A859] mt-10">ОКНО 5</p>
      </div>
      <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6">
        <div className="text-white text-2xl font-bold mb-4">ПОСЛЕДНИЕ ВЫЗОВЫ</div>
        <div className="flex justify-between bg-gray-900 p-6 rounded-xl border-l-8 border-[#00A859]">
          <span className="text-5xl font-bold text-white">B012</span>
          <span className="text-3xl font-bold text-[#00A859]">ОКНО 2</span>
        </div>
      </div>
    </div>
  </div>
);

const AdminView = ({ onBack }) => (
  <div className="max-w-6xl mx-auto">
    <button onClick={onBack} className="mb-4 text-sm text-gray-500">← Back</button>
    <h2 className="text-3xl font-bold text-[#0A3A6B] mb-8">Панель администратора</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
        <p className="text-gray-500 text-sm">Активные филиалы</p>
        <p className="text-3xl font-bold">48 / 50</p>
      </div>
    </div>
  </div>
);

export default App;
