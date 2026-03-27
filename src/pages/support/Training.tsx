import { useState, useEffect } from 'react';

export default function Training() {
  // Демо контент модулей
  const modules = [
    { title: 'Педагогика', description: 'Основы работы с детьми, методики и подходы.' },
    { title: 'Игры и активности', description: 'Весёлые и развивающие игры для отрядов.' },
    { title: 'Конфликты', description: 'Как справляться с трудными ситуациями.' },
    { title: 'Креатив', description: 'Творческие задания и мастер-классы.' },
    { title: 'Безопасность', description: 'Правила безопасности и первая помощь.' },
    { title: 'Эмоциональный интеллект', description: 'Навыки понимания и управления эмоциями.' },
    { title: 'Командообразование', description: 'Упражнения для сплочения отряда.' },
    { title: 'Лагерные традиции', description: 'Ритуалы, песни, игры для укрепления атмосферы.' },
    { title: 'Организация мероприятий', description: 'Пошаговые инструкции для проведения активностей.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500/10 to-lime-500/10 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Заголовок */}
        <div className="bg-black/50 backdrop-blur-2xl rounded-3xl shadow-lg p-10 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">Раздел «Обучение»</h1>
          <p className="text-lg text-white/80 mb-6">
            Здесь размещены обучающие модули для вожатых: педагогика, игры, конфликты, креатив, безопасность и другие материалы. 
            В будущем здесь появятся интерактивные уроки и дополнительные ресурсы.
          </p>
        </div>

        {/* Демо модули */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-orange-500/20 to-lime-500/20 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 hover:scale-105 transition-transform duration-200"
            >
              <div className="text-xl font-semibold mb-2 text-white">{m.title}</div>
              <div className="text-sm text-white/80">{m.description}</div>
            </div>
          ))}
        </div>

        {/* В разработке */}
        <div className="bg-orange-100/20 border border-orange-200 rounded-2xl p-6 text-center">
          <p className="text-white font-medium text-lg">Раздел находится в разработке</p>
          <p className="text-white/70 mt-2">Скоро появятся интерактивные уроки и дополнительные материалы</p>
        </div>
      </div>
    </div>
  );
}