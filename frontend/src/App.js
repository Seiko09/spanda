import React, { useState, useEffect } from 'react';
import './i18n';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './index.css';

const API_BASE = '/api';

function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-[#0A3A6B] text-white p-4 flex justify-between items-center shadow-md border-b-4 border-[#00A859]">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
            <span className="text-[#0A3A6B] font-bold text-xl">K</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">KICB Spanda Queue</h1>
        </div>
        <div className="flex items-center space-x-4">
          <select
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="bg-[#0A3A6B] border border-white/30 text-sm rounded p-1 outline-none"
          >
            <option value="ru">Русский</option>
            <option value="ky">Кыргызча</option>
            <option value="en">English</option>
          </select>
          {user && (
            <button onClick={() => setUser(null)} className="bg-red-600 px-3 py-1 rounded text-sm font-bold">
              {t('logout', 'Выход')}
            </button>
          )}
        </div>
      </header>

      <main className="p-6">
        {view === 'landing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16">
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
    className="bg-white p-10 rounded-2xl shadow-xl border-b-8 border-[#00A859] hover:transform hover:-translate-y-2 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4"
  >
    <span className="text-6xl">{icon}</span>
    <h2 className="text-2xl font-black text-[#0A3A6B] uppercase">{title}</h2>
  </div>
);

const TerminalView = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [ticket, setTicket] = useState(null);
  const { i18n } = useTranslation();
  const lang = i18n.language || 'ru';

  useEffect(() => {
    axios.get(`${API_BASE}/services`)
      .then(res => setServices(res.data))
      .catch(() => setServices([{ id: 1, code: 'A', name: { ru: 'Услуги банка', ky: 'Банк кызматтары', en: 'Bank Services' } }]));
  }, []);

  if (ticket) {
    return (
      <div className="max-w-md mx-auto bg-white p-12 rounded-3xl shadow-2xl text-center border-2 border-gray-100">
        <h2 className="text-3xl font-black text-[#0A3A6B] mb-2 tracking-widest">KICB</h2>
        <p className="text-gray-400 text-xs mb-6 uppercase tracking-widest">Electronic Queue System</p>
        <div className="border-t-4 border-dotted border-gray-200 my-6"></div>
        <p className="text-gray-500 font-bold mb-2">ВАШ НОМЕР / YOUR NUMBER</p>
        <h1 className="text-9xl font-black text-[#0A3A6B] my-8 leading-none">{ticket.number}</h1>
        <p className="text-sm text-gray-400 font-mono mt-10">
          {new Date().toLocaleString()}
        </p>
        <button
          onClick={() => {setTicket(null); setStep(1);}}
          className="mt-12 bg-[#00A859] text-white w-full py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-green-700 transition-colors"
        >
          ГОТОВО / DONE
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="mb-6 font-bold text-[#0A3A6B] bg-white px-4 py-2 rounded-xl shadow">← НАЗАД / BACK</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(s => (
          <button
            key={s.id}
            onClick={() => setTicket({ number: s.code + '001' })}
            className="p-12 bg-white rounded-2xl shadow-xl font-black text-2xl text-[#0A3A6B] border-l-[12px] border-[#0A3A6B] text-left hover:bg-blue-50 transition-all flex justify-between items-center"
          >
            {s.name[lang]}
            <span className="text-4xl">➜</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const OperatorView = ({ onBack }) => (
  <div className="max-w-4xl mx-auto bg-white p-12 rounded-3xl shadow-2xl border-t-8 border-[#0A3A6B]">
    <button onClick={onBack} className="mb-8 font-bold text-gray-400">← НАЗАД</button>
    <div className="flex justify-between items-center mb-16">
      <div>
        <h2 className="text-4xl font-black text-[#0A3A6B]">ОКНО №5</h2>
        <p className="text-xl text-gray-400 font-bold mt-2">ОПЕРАТОР: ИБРАГИМ</p>
      </div>
      <div className="bg-blue-50 p-8 rounded-3xl text-center border-2 border-blue-100">
        <p className="text-xs uppercase font-black text-blue-400 tracking-widest mb-2">ТЕКУЩИЙ КЛИЕНТ</p>
        <p className="text-7xl font-black text-[#00A859]">A041</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-6">
      <button className="bg-[#0A3A6B] text-white py-8 rounded-3xl font-black text-2xl shadow-xl hover:bg-blue-900 transition-all">
        СЛЕДУЮЩИЙ
      </button>
      <button className="border-4 border-[#0A3A6B] text-[#0A3A6B] py-8 rounded-3xl font-black text-2xl hover:bg-gray-50 transition-all">
        ПОВТОРИТЬ
      </button>
    </div>
  </div>
);

const TVView = ({ onBack }) => (
  <div className="max-w-[95%] mx-auto h-[85vh] flex flex-col mt-4">
    <button onClick={onBack} className="mb-4 text-sm font-bold text-gray-400 self-start">← BACK</button>
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white rounded-[40px] shadow-2xl p-16 flex flex-col items-center justify-center border-t-[20px] border-[#00A859]">
        <h2 className="text-5xl font-black text-gray-300 mb-16 tracking-[10px]">ВЫЗЫВАЕТСЯ</h2>
        <div className="text-center">
          <h1 className="text-[18rem] font-black text-[#0A3A6B] leading-none mb-10">A041</h1>
          <div className="bg-[#00A859] text-white px-20 py-4 rounded-full inline-block">
            <p className="text-7xl font-black">ОКНО 5</p>
          </div>
        </div>
      </div>
      <div className="bg-[#1A1A1A] rounded-[40px] shadow-2xl overflow-hidden flex flex-col p-10">
        <div className="text-gray-500 text-3xl font-black mb-10 tracking-widest uppercase border-b-2 border-gray-800 pb-4">Последние вызовы</div>
        <div className="space-y-6">
          {[ {n:'B012', w:2}, {n:'A040', w:3}, {n:'C005', w:1} ].map((t, i) => (
            <div key={i} className="flex justify-between items-center bg-black/40 p-8 rounded-3xl border-l-[15px] border-[#00A859]">
              <span className="text-7xl font-black text-white">{t.n}</span>
              <span className="text-4xl font-black text-[#00A859] uppercase">Окно {t.w}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="mt-10 bg-[#0A3A6B] p-6 rounded-3xl text-white text-3xl font-black text-center shadow-2xl">
      <marquee>ДОБРО ПОЖАЛОВАТЬ В KICB БАНК! WELCOME TO KICB BANK! КУШ КЕЛИҢИЗДЕР!</marquee>
    </div>
  </div>
);

const AdminView = ({ onBack }) => (
  <div className="max-w-6xl mx-auto">
    <button onClick={onBack} className="mb-6 font-bold text-gray-400">← НАЗАД</button>
    <h2 className="text-4xl font-black text-[#0A3A6B] mb-12 uppercase tracking-tight">Мониторинг филиалов</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      <StatCard label="АКТИВНЫЕ ФИЛИАЛЫ" value="48 / 50" color="blue" />
      <StatCard label="КЛИЕНТОВ СЕГОДНЯ" value="1,240" color="green" />
      <StatCard label="СРЕДНЕЕ ОЖИДАНИЕ" value="08:15" color="red" />
    </div>
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-gray-50">
      <table className="w-full text-left">
        <thead className="bg-[#0A3A6B] text-white">
          <tr>
            <th className="p-6 font-black uppercase text-sm">Филиал</th>
            <th className="p-6 font-black uppercase text-sm">Статус</th>
            <th className="p-6 font-black uppercase text-sm">Очередь</th>
            <th className="p-6 font-black uppercase text-sm">Действие</th>
          </tr>
        </thead>
        <tbody className="font-bold text-gray-600">
          <tr className="border-b hover:bg-gray-50"><td className="p-6">Центральный</td><td className="p-6 text-green-500">ONLINE</td><td className="p-6">24 чел</td><td className="p-6 text-blue-600 cursor-pointer underline">СМОТРЕТЬ</td></tr>
          <tr className="border-b hover:bg-gray-50"><td className="p-6">Ош - Центр</td><td className="p-6 text-green-500">ONLINE</td><td className="p-6">12 чел</td><td className="p-6 text-blue-600 cursor-pointer underline">СМОТРЕТЬ</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);

const StatCard = ({ label, value, color }) => {
  const colors = { blue: 'border-blue-500', green: 'border-green-500', red: 'border-red-500' };
  return (
    <div className={`bg-white p-8 rounded-3xl shadow-lg border-l-[12px] ${colors[color]}`}>
      <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">{label}</p>
      <p className="text-4xl font-black text-gray-700">{value}</p>
    </div>
  );
};

export default App;
