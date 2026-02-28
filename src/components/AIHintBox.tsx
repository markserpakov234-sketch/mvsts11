import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAIResponse } from '../lib/fakeAI';
import { Bot, AlertTriangle, Lightbulb } from 'lucide-react';

export default function AIHintBox() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse(null);

    const res = await getAIResponse(question);

    setTimeout(() => {
      setResponse(res);
      setLoading(false);
    }, 600);
  };

  const getStyleByType = () => {
    if (!response) return '';
    if (response.type === 'crisis') return 'border-red-500 bg-red-500/10';
    if (response.type === 'idea') return 'border-lime-400 bg-lime-400/10';
    return 'border-violet-400 bg-violet-400/10';
  };

  const getIcon = () => {
    if (!response) return Bot;
    if (response.type === 'crisis') return AlertTriangle;
    if (response.type === 'idea') return Lightbulb;
    return Bot;
  };

  const Icon = getIcon();

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-white/80">
        <Bot size={18} />
        <span className="font-medium">Оперативный ассистент</span>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Опиши ситуацию..."
          className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 focus:border-lime-400 outline-none"
        />

        <button
          onClick={handleAsk}
          className="px-5 py-3 rounded-xl bg-lime-400 text-black font-semibold hover:bg-lime-300 transition"
        >
          {loading ? 'Анализ...' : 'Запрос'}
        </button>
      </div>

      {/* Response */}
      {response && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-5 rounded-2xl border ${getStyleByType()} backdrop-blur-xl`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Icon size={18} />
            <span className="text-sm uppercase tracking-wide opacity-70">
              {response.type}
            </span>
          </div>

          <div className="whitespace-pre-line text-sm opacity-90">
            {response.text}
          </div>

          {response.actions?.length > 0 && (
            <div className="mt-4 flex gap-3">
              {response.actions.map((action: any, i: number) => (
                <button
                  key={i}
                  onClick={() => action.route && navigate(action.route)}
                  className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 transition text-sm"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
