import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = `${login}@tochka.app`;

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from('users').insert({
            id: data.user.id,
            name,
            role: 'user',
          });
        }
      }

      // 🔥 Intro показывается только один раз
      const introSeen = localStorage.getItem('intro_seen');

      if (!introSeen) {
        navigate('/intro', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0F14]">
      {/* Плавающие пятна */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-45"
        style={{ animation: 'float1 8s ease-in-out infinite' }}
      />
      <div
        className="absolute top-40 -right-32 w-[500px] h-[500px] bg-yellow-400 rounded-full blur-3xl opacity-35"
        style={{ animation: 'float2 10s ease-in-out infinite' }}
      />
      <div
        className="absolute bottom-0 left-20 w-96 h-96 bg-lime-500 rounded-full blur-3xl opacity-35"
        style={{ animation: 'float3 9s ease-in-out infinite' }}
      />

      {/* Карточка */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-[0.25em] text-white uppercase">
            Точка сборки
          </h1>
          <p className="text-sm text-white/60 tracking-[0.3em] uppercase mt-3">
            Детский курорт Вита
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}

          <input
            type="text"
            placeholder="Логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-lime-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-orange-500 via-yellow-400 to-lime-400 hover:brightness-110 transition-all shadow-lg"
          >
            {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/60">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-300 hover:underline"
          >
            {isLogin ? 'Регистрация' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}
