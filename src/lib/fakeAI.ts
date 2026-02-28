export type AIResponse = {
  type: 'crisis' | 'advice' | 'idea';
  text: string;
  actions?: {
    label: string;
    route?: string;
  }[];
};

export async function getAIResponse(question: string): Promise<AIResponse> {
  const lower = question.toLowerCase();

  // 🚨 Кризисная ситуация
  if (
    lower.includes('травм') ||
    lower.includes('удар') ||
    lower.includes('кров') ||
    lower.includes('плохо')
  ) {
    return {
      type: 'crisis',
      text:
        'Обнаружена возможная травма.\n\n' +
        '1. Оцените состояние ребёнка.\n' +
        '2. Обратитесь к медработнику.\n' +
        '3. Уведомите родителей.\n' +
        '4. Зафиксируйте случай в журнале.',
      actions: [
        { label: 'Открыть кризисный чек-лист', route: '/support/checklists' },
      ],
    };
  }

  // 🎲 Игровая активность
  if (
    lower.includes('игр') ||
    lower.includes('скуч') ||
    lower.includes('актив')
  ) {
    return {
      type: 'idea',
      text:
        'Предлагаю активность на 15–20 минут:\n\n' +
        '🎯 «Быстрое знакомство»\n' +
        '• Работа в парах\n' +
        '• 3 раунда по 5 минут\n' +
        '• Финальное общее обсуждение',
      actions: [{ label: 'Перейти в игротеку', route: '/support/games' }],
    };
  }

  // 🎓 Обучение
  if (
    lower.includes('обуч') ||
    lower.includes('курс') ||
    lower.includes('инструктаж')
  ) {
    return {
      type: 'advice',
      text:
        'Рекомендуется пройти обязательный модуль по безопасности и алгоритмам действий.\n\n' +
        'Это снижает риски в кризисных ситуациях.',
      actions: [{ label: 'Открыть обучение', route: '/support/training' }],
    };
  }

  // 🗺 Территория
  if (
    lower.includes('где') ||
    lower.includes('территор') ||
    lower.includes('карта')
  ) {
    return {
      type: 'advice',
      text:
        'Для ориентации по территории используйте интерактивную карту лагеря.\n\n' +
        'Там отмечены ключевые зоны и точки безопасности.',
      actions: [{ label: 'Открыть карту', route: '/support/map' }],
    };
  }

  // 💡 Универсальный ответ
  return {
    type: 'advice',
    text:
      'Проанализируйте ситуацию и выберите соответствующий раздел методической базы.\n\n' +
      'Если ситуация нестандартная — уточните детали.',
    actions: [],
  };
}
