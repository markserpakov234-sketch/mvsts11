import { useState } from 'react'

const schedule = [
    {
      city: '21,22',
      breakfast: { enterStart: '8:40', enterEnd: '8:45', exitEnd: '8:55' },
      lunch: { enterStart: '12:40', enterEnd: '12:45', exitEnd: '12:55' },
      snack: { enterStart: '15:45', enterEnd: '15:45', exitEnd: '15:45' },
      dinner: { enterStart: '18:25', enterEnd: '18:35', exitEnd: '18:45' },
    },
    {
      city: '31,32',
      breakfast: { enterStart: '8:45', enterEnd: '8:50', exitEnd: '9:00' },
      lunch: { enterStart: '12:45', enterEnd: '12:50', exitEnd: '13:00' },
      snack: { enterStart: '15:45', enterEnd: '15:45', exitEnd: '15:45' },
      dinner: { enterStart: '18:35', enterEnd: '18:40', exitEnd: '18:50' },
    },
    {
      city: '12,43',
      breakfast: { enterStart: '8:50', enterEnd: '8:55', exitEnd: '9:05' },
      lunch: { enterStart: '12:50', enterEnd: '12:55', exitEnd: '13:05' },
      snack: { enterStart: '15:45', enterEnd: '15:45', exitEnd: '15:45' },
      dinner: { enterStart: '18:40', enterEnd: '18:45', exitEnd: '18:55' },
    },
    {
      city: '23,24',
      breakfast: { enterStart: '8:55', enterEnd: '9:00', exitEnd: '9:10' },
      lunch: { enterStart: '12:55', enterEnd: '13:00', exitEnd: '13:10' },
      snack: { enterStart: '15:45', enterEnd: '15:45', exitEnd: '15:45' },
      dinner: { enterStart: '18:45', enterEnd: '18:50', exitEnd: '19:00' },
    },
    {
      city: '13,11',
      breakfast: { enterStart: '8:40', enterEnd: '8:45', exitEnd: '8:55' },
      lunch: { enterStart: '12:40', enterEnd: '12:45', exitEnd: '12:55' },
      snack: { enterStart: '16:00', enterEnd: '16:00', exitEnd: '16:00' },
      dinner: { enterStart: '18:50', enterEnd: '18:55', exitEnd: '19:05' },
    },
    {
      city: '25,41',
      breakfast: { enterStart: '8:45', enterEnd: '8:50', exitEnd: '9:00' },
      lunch: { enterStart: '12:45', enterEnd: '12:50', exitEnd: '13:00' },
      snack: { enterStart: '16:00', enterEnd: '16:00', exitEnd: '16:00' },
      dinner: { enterStart: '18:45', enterEnd: '18:50', exitEnd: '19:00' },
    },
    {
      city: '42,33',
      breakfast: { enterStart: '9:15', enterEnd: '9:20', exitEnd: '9:30' },
      lunch: { enterStart: '12:45', enterEnd: '12:50', exitEnd: '13:00' },
      snack: { enterStart: '16:00', enterEnd: '16:00', exitEnd: '16:00' },
      dinner: { enterStart: '18:45', enterEnd: '18:50', exitEnd: '19:00' },
    },
    {
      city: '26,36',
      breakfast: { enterStart: '9:20', enterEnd: '9:25', exitEnd: '9:35' },
      lunch: { enterStart: '13:20', enterEnd: '13:25', exitEnd: '13:35' },
      snack: { enterStart: '16:15', enterEnd: '16:15', exitEnd: '16:15' },
      dinner: { enterStart: '19:10', enterEnd: '19:15', exitEnd: '19:25' },
    },
    {
      city: '34,44,35',
      breakfast: { enterStart: '9:25', enterEnd: '9:30', exitEnd: '9:40' },
      lunch: { enterStart: '13:25', enterEnd: '13:30', exitEnd: '13:40' },
      snack: { enterStart: '16:15', enterEnd: '16:15', exitEnd: '16:15' },
      dinner: { enterStart: '19:15', enterEnd: '19:20', exitEnd: '19:30' },
    },
  ]

export default function CanteenPage() {
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [seating, setSeating] = useState<1 | 2>(1) // 🔥 добавлено

  return (
    <div className="p-4 pb-24 text-white">

      <h1 className="text-2xl font-bold mb-4">Столовая</h1>

      <div className="mb-6 text-sm opacity-70">
        Расписание входов и рассадка.
      </div>

      {/* РАССАДКА */}
      <div className="mb-6 rounded-3xl p-4 backdrop-blur-xl border border-white/10 bg-white/5">
        <h2 className="text-lg font-semibold mb-3">Рассадка</h2>

        {/* ПЕРЕКЛЮЧАТЕЛЬ */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSeating(1)}
            className={`flex-1 py-2 rounded-xl text-sm transition ${
              seating === 1
                ? 'bg-lime-400 text-black'
                : 'bg-black/40 border border-white/10'
            }`}
          >
            1 посадка
          </button>

          <button
            onClick={() => setSeating(2)}
            className={`flex-1 py-2 rounded-xl text-sm transition ${
              seating === 2
                ? 'bg-orange-400 text-black'
                : 'bg-black/40 border border-white/10'
            }`}
          >
            2 посадка
          </button>
        </div>

        {/* КАРТИНКА */}
        <img
          src={seating === 1 ? '/images/canteen-1.jpg' : '/images/canteen-2.jpg'}
          alt="Схема рассадки"
          className="rounded-2xl object-cover w-full h-48 cursor-pointer"
          onClick={() =>
            setActiveImage(
              seating === 1 ? '/images/canteen-1.jpg' : '/images/canteen-2.jpg'
            )
          }
        />

        <div className="text-xs mt-3 opacity-60">
          Активная схема: {seating === 1 ? '1 посадка' : '2 посадка'}
        </div>
      </div>

      {/* ПРАВИЛА */}
      <div className="mb-6 rounded-3xl p-4 backdrop-blur-xl border border-white/10 bg-white/5">
        <h2 className="text-lg font-semibold mb-4">Правила столовой</h2>

        <div className="space-y-3 text-sm">

          <div className="rounded-2xl p-3 bg-black/40 border border-white/10">
            Вход строго по времени своего города
          </div>

          <div className="rounded-2xl p-3 bg-black/40 border border-white/10">
            Без вожатого вход запрещён
          </div>

          <div className="rounded-2xl p-3 bg-black/40 border border-white/10">
            Рассадка только по своей смене
          </div>

          <div className="rounded-2xl p-3 bg-black/40 border border-white/10">
            Никакой еды с собой
          </div>

          <div className="rounded-2xl p-3 bg-black/40 border border-white/10">
            Сначала приём пищи — потом разговоры
          </div>

          <div className="rounded-2xl p-3 bg-black/40 border border-white/10 text-orange-400">
            Контроль количества детей обязателен
          </div>

          <div className="rounded-2xl p-3 bg-black/40 border border-white/10 text-lime-400">
            Вожатый отвечает за дисциплину города
          </div>

        </div>
      </div>

      {/* РАСПИСАНИЕ */}
<div className="rounded-3xl p-4 backdrop-blur-xl border border-white/10 bg-white/5">
  <h2 className="text-lg font-semibold mb-4">Расписание</h2>

  <div className="space-y-3">
    {schedule.map((item, index) => (
      <div
        key={index}
        className="rounded-2xl p-3 bg-black/40 border border-white/10"
      >
        <div className="text-sm mb-2 text-lime-400">
          Город {item.city}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            Завтрак: с {item.breakfast.enterStart} до {item.breakfast.enterEnd} (заканчивать до {item.breakfast.exitEnd})
          </div>
          <div>
            Обед: с {item.lunch.enterStart} до {item.lunch.enterEnd} (заканчивать до {item.lunch.exitEnd})
          </div>
          <div>
            Полдник: с {item.snack.enterStart} до {item.snack.enterEnd} (заканчивать до {item.snack.exitEnd})
          </div>
          <div className="text-orange-400">
            Ужин: с {item.dinner.enterStart} до {item.dinner.enterEnd} (заканчивать до {item.dinner.exitEnd})
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* МОДАЛКА С ФОТО */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setActiveImage(null)}
        >
          <img
            src={activeImage}
            alt="preview"
            className="max-w-full max-h-full rounded-2xl"
          />
        </div>
      )}
    </div>
  )
}