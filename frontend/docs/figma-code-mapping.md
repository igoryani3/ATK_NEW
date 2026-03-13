# Figma → Code Mapping

Этот документ связывает элементы дизайна в Figma с кодом в проекте.

**Figma файл:** https://www.figma.com/design/wQrx3oBYscQFtyvPhRj5Mu

---

## Sidebar (Node 3:3)

**Файл:** `/components/Sidebar.tsx`
**Строки:** 1-61
**Figma URL:** https://www.figma.com/design/wQrx3oBYscQFtyvPhRj5Mu?node-id=3-3

### Структура компонента:

- **Логотип и заголовок** (строки 27-30)
  - Figma nodes: 3:4-3:9
  - Текст "ATK Transit" и "CRM System"

- **Навигационные элементы** (строки 34-50)
  - Figma nodes: 3:12-3:45
  - Элементы меню с иконками и текстом
  - Активное состояние через `pathname === item.href`

- **Логика активного состояния** (строки 17-22)
  - `usePathname()` для определения текущего маршрута
  - Условный рендеринг классов для активного пункта

- **Футер** (строки 52-56)
  - Figma node: 3:47-3:49
  - Copyright текст

### Навигационные пункты:

| Figma Node | Текст | Маршрут | Код (строка) |
|------------|-------|---------|--------------|
| 3:12-3:17 | 📅 Расписание | `/dashboard/schedule` | 35 |
| 3:19-3:24 | 🗺️ Маршруты | `/dashboard/routes` | 36 |
| 3:26-3:31 | 📚 Справочники | `/dashboard/references` | 37 |
| 3:33-3:38 | 🧮 Калькулятор | `/dashboard/calculator` | 38 |
| 3:40-3:45 | 🔄 Синхронизация | `/dashboard/sync` | 39 |

---

## Страница Schedule (Node 3:51)

**Файл:** `/app/dashboard/schedule/page.tsx`
**Строки:** 1-345
**Figma URL:** https://www.figma.com/design/wQrx3oBYscQFtyvPhRj5Mu?node-id=3-51

### Header (Node 3:52)

**Строки:** 183-185
**Figma nodes:** 3:52-3:54

```tsx
<header className="bg-[#1a2332] border-b border-slate-700 px-6 py-4">
    <h1 className="text-2xl font-bold text-white">Календарь рейсов</h1>
</header>
```

---

## Навигация Календаря (Nodes 3:57-3:65)

**Файл:** `/app/dashboard/schedule/page.tsx`
**Строки:** 189-206
**Figma URL:** https://www.figma.com/design/wQrx3oBYscQFtyvPhRj5Mu?node-id=3-57

### Элементы:

- **Кнопка "← Пред."** (Node 3:58)
  - Строка: 191-195
  - Обработчик: `previousMonth()` (строка 143)

- **Название месяца** (Node 3:61)
  - Строка: 197-199
  - Переменная: `monthName` (строка 165)

- **Кнопка "След. →"** (Node 3:64)
  - Строка: 200-205
  - Обработчик: `nextMonth()` (строка 147)

### Логика навигации:

```tsx
// Функции календаря (строки 124-163)
const getDaysInMonth = (date: Date) => { ... }      // строка 124
const getTripsForDate = (date: Date) => { ... }     // строка 135
const previousMonth = () => { ... }                  // строка 143
const nextMonth = () => { ... }                      // строка 147
const isToday = (date: Date) => { ... }             // строка 151
const isSameDay = (date1, date2) => { ... }         // строка 158
```

---

## Календарная Сетка (Nodes 3:67-3:183)

**Файл:** `/app/dashboard/schedule/page.tsx`
**Строки:** 209-252
**Тип:** Inline компонент (рекомендуется вынести в `CalendarGrid.tsx`)
**Figma URL:** https://www.figma.com/design/wQrx3oBYscQFtyvPhRj5Mu?node-id=3-67

### Структура:

- **Заголовки дней недели** (Nodes 3:68-3:88)
  - Строки: 210-217
  - Массив: `['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']`

- **Пустые ячейки** (перед началом месяца)
  - Строки: 220-223
  - Логика: `startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1`

- **Кнопки дней** (Nodes 3:91-3:182)
  - Строки: 226-250
  - Обработчик клика: `setSelectedDate(date)` (строка 236)

### Состояния кнопок дня:

| Состояние | Условие | Классы | Строки |
|-----------|---------|--------|--------|
| Выбранный | `isSameDay(date, selectedDate)` | `bg-blue-600 text-white font-semibold` | 240 |
| Сегодня | `isToday(date)` | `bg-[#1e2a3d] text-white border border-blue-500` | 242 |
| Обычный | default | `bg-[#1e2a3d] text-slate-300 hover:bg-[#253447]` | 243 |

### Данные:

- **Текущий месяц:** `currentMonth` (state, строка 22)
- **Выбранная дата:** `selectedDate` (state, строка 21)
- **Рейсы:** `trips` (state, строка 11)

---

## Таблица Рейсов (Nodes 3:192-3:217)

**Файл:** `/app/dashboard/schedule/page.tsx`
**Строки:** 270-324
**Тип:** Inline компонент (рекомендуется вынести в `TripsTable.tsx`)
**Figma URL:** https://www.figma.com/design/wQrx3oBYscQFtyvPhRj5Mu?node-id=3-192

### Заголовок секции (Node 3:185)

**Строки:** 256-268

- **Заголовок** (Node 3:186): строки 257-259
  - Текст: `Рейсы на {дата} ({количество})`
  - Переменная: `filteredTrips.length`

- **Кнопка "Добавить рейс"** (Node 3:189): строки 260-267
  - Обработчик: `handleAddTrip()` (строка 67)
  - Видимость: только для admin/dispatcher

### Структура таблицы (Node 3:193)

**Заголовок таблицы** (Nodes 3:194-3:212)
Строки: 272-283

| Колонка | Node | Строка |
|---------|------|--------|
| Название | 3:196 | 274 |
| Начало | 3:199 | 275 |
| Конец | 3:202 | 276 |
| Подача | 3:205 | 277 |
| Цена | 3:208 | 278 |
| Действия | 3:211 | 279-281 |

**Тело таблицы** (Nodes 3:214-3:217)
Строки: 284-323

- **Пустое состояние** (Node 3:216): строки 286-290
  - Условие: `filteredTrips.length === 0`
  - Текст: "Нет рейсов в этот день. Добавьте первый рейс."

- **Строки с данными**: строки 292-320
  - Маппинг: `filteredTrips.map((trip) => ...)`
  - Hover эффект: `hover:bg-[#1e2a3d]`

### Действия в строке:

- **Кнопка "Изменить"**: строки 304-308
  - Обработчик: `handleEditTrip(trip)` (строка 72)
  - Цвет: `text-blue-400 hover:text-blue-300`

- **Кнопка "Удалить"**: строки 309-315
  - Обработчик: `handleDeleteTrip(trip.id)` (строка 100)
  - Цвет: `text-red-400 hover:text-red-300`

### Логика фильтрации:

```tsx
// Строки 167-170
const filteredTrips = trips.filter(trip => {
    const tripDate = trip.created_at ? new Date(trip.created_at) : null;
    return tripDate && isSameDay(tripDate, selectedDate);
});
```

---

## TripForm (Modal)

**Файл:** `/components/TripForm.tsx`
**Строки:** 1-340
**Примечание:** Не видна в текущем Figma capture (модальное окно)

### Использование:

- **Вызов из schedule/page.tsx**: строки 329-341
- **Режимы**: `mode="trip"` или `mode="template"`
- **Props**:
  - `template`: данные для редактирования (строка 332)
  - `drivers`, `vehicles`, `clients`, `executors`, `contractProviders`: справочники
  - `onSubmit`: callback при сохранении (строка 338)
  - `onCancel`: callback при отмене (строка 339)

### Обработчики:

- **Открытие формы**: `handleAddTrip()` (строка 67) или `handleEditTrip(trip)` (строка 72)
- **Сохранение**: `handleFormSubmit()` (строка 112)
- **Отмена**: `handleFormCancel()` (строка 118)

---

## Рекомендации по Рефакторингу

### Компоненты для выделения:

1. **CalendarGrid** (приоритет: высокий)
   - Текущее расположение: `schedule/page.tsx:209-252`
   - Размер: 43 строки
   - Переиспользование: календари в других частях приложения

2. **TripsTable** (приоритет: высокий)
   - Текущее расположение: `schedule/page.tsx:270-324`
   - Размер: 54 строки
   - Переиспользование: таблицы данных в других разделах

### Предлагаемая структура после рефакторинга:

```
components/
  ├── Sidebar.tsx              ✅ Уже выделен
  ├── TripForm.tsx             ✅ Уже выделен
  ├── CalendarGrid.tsx         🔄 Рекомендуется создать
  ├── TripsTable.tsx           🔄 Рекомендуется создать
  └── schedule/
      ├── CalendarNavigation.tsx  (опционально)
      └── ScheduleHeader.tsx      (опционально)
```

---

## Цветовая Схема

Для справки при работе с дизайном:

| Элемент | Цвет | Hex |
|---------|------|-----|
| Фон основной | slate-900 | #0f172a |
| Фон карточек | #1a2332 | - |
| Фон элементов | #1e2a3d | - |
| Hover | #253447 | - |
| Границы | slate-700 | #334155 |
| Текст основной | white | #ffffff |
| Текст вторичный | slate-300 | #cbd5e1 |
| Текст неактивный | slate-400 | #94a3b8 |
| Акцент (primary) | blue-600 | #2563eb |
| Акцент hover | blue-700 | #1d4ed8 |
| Опасность | red-400 | #f87171 |

---

## Обновление Документации

При изменении кода обновляйте соответствующие разделы:

1. Если меняются номера строк → обновить ссылки
2. Если добавляются новые компоненты → добавить новый раздел
3. Если рефакторинг → обновить пути к файлам
4. Если меняется структура Figma → обновить node ID

**Последнее обновление:** 2026-03-10
