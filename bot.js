import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

/* ===========================
   НАСТРОЙКИ
=========================== */

const BOT_TOKEN = '8554409117:AAGRrLRXHqRKUH9T5rMDxkdzqQrW3KHtiCU';
const SUPABASE_URL = 'https://yswkrrcptkzknhnktdrf.supabase.co';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzd2tycmNwdGt6a25obmt0ZHJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTc4NTg1NSwiZXhwIjoyMDg3MzYxODU1fQ.uW04pySMrxCt-gOX_uyjSqynWZjXkDoWQnONasbQ418';

/* ===========================
   ИНИЦИАЛИЗАЦИЯ
=========================== */

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

let offset = 0;

console.log('🤖 Bot started...');

/* ===========================
   ОСНОВНОЙ POLLING
=========================== */

async function checkUpdates() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}`
    );

    const data = await response.json();

    if (!data.ok) {
      console.log('Telegram error:', data);
      return;
    }

    for (const update of data.result) {
      offset = update.update_id + 1;

      if (!update.message?.text) continue;

      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      console.log('📩 Message:', text);

      /* ===========================
         ОБРАБОТКА /start UUID
      =========================== */

      if (text.startsWith('/start')) {
        const userId = text.replace('/start', '').trim();

        if (!userId) {
          await sendMessage(chatId, '⚠️ Нет ID пользователя.');
          continue;
        }

        console.log('🔎 UUID from Telegram:', userId);

        // Проверяем что пользователь существует
        const { data: existingUser, error: selectError } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        if (selectError || !existingUser) {
          console.log('❌ Пользователь не найден:', userId);
          await sendMessage(chatId, '❌ Пользователь не найден.');
          continue;
        }

        // Обновляем telegram_chat_id
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ telegram_chat_id: chatId })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          console.log('DB update error:', updateError);
          await sendMessage(chatId, '❌ Ошибка подключения.');
          continue;
        }

        console.log('✅ Updated user:', updatedUser);

        await sendMessage(chatId, '✅ Telegram успешно подключён!');
      }
    }
  } catch (err) {
    console.log('Polling error:', err);
  }
}

/* ===========================
   ОТПРАВКА СООБЩЕНИЯ
=========================== */

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });
}

/* ===========================
   ОТПРАВКА ПО USER ID
=========================== */

async function sendNotificationToUser(userId, message) {
  const { data, error } = await supabase
    .from('users')
    .select('telegram_chat_id')
    .eq('id', userId)
    .single();

  if (error) {
    console.log('DB error:', error);
    return;
  }

  if (!data?.telegram_chat_id) {
    console.log('User not connected to Telegram');
    return;
  }

  await sendMessage(data.telegram_chat_id, message);
  console.log('✅ Notification sent');
}

/* ===========================
   ЗАПУСК КАЖДЫЕ 3 СЕК
=========================== */

setInterval(checkUpdates, 3000);
