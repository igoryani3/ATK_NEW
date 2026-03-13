'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, syncAPI } from '@/lib/api';

type SyncResult = {
  start: string;
  end: string;
  days_processed: number;
  trips_selected: number;
  rows_appended: number;
  rows_skipped_duplicates: number;
  per_day: Record<string, { appended: number; skipped_duplicates: number }>;
  missingSheets?: string[];
  error?: string;
};

const fmtISO = (d: Date) => d.toISOString().slice(0, 10);

export default function SyncPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return fmtISO(d);
  });
  const [end, setEnd] = useState<string>(() => fmtISO(new Date()));
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await authAPI.checkAuth();
      if (!res.data.authenticated) router.push('/login');
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuth().finally(() => setLoading(false));
  }, [checkAuth]);

  const runSync = async () => {
    try {
      setRunning(true);
      setError(null);
      setResult(null);

      const res = await syncAPI.tripsToSheets({ start, end });
      setResult(res.data);
    } catch (e: any) {
      console.error(e);
      const msg = e?.response?.data?.error || 'Ошибка синхронизации';
      setError(msg);
      setResult(e?.response?.data || null);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-900 text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="bg-[#fffef9] border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Синхронизация</h1>
            <p className="text-sm text-gray-600">Отправка рейсов из системы в Google Sheets (append)</p>
          </div>
          <button
            onClick={runSync}
            disabled={running}
            className="px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] disabled:opacity-60 text-white rounded-lg transition-colors"
          >
            {running ? 'Выполняется…' : 'Отправить в Google Sheets'}
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="bg-[#fffef9] rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Начало</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Конец</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fffef9] border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ff6c00] focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const d = new Date();
                    const s = new Date();
                    s.setDate(d.getDate() - 6);
                    setStart(fmtISO(s));
                    setEnd(fmtISO(d));
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Последние 7 дней
                </button>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-600">
              Требуется настройка env на backend: <code>GOOGLE_SHEETS_SPREADSHEET_ID</code> и <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> (или <code>GOOGLE_SERVICE_ACCOUNT_FILE</code>).
            </div>

            {error && (
              <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          {result && (
            <div className="bg-[#fffef9] rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="text-sm text-gray-900 font-semibold mb-2">Результат</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-700">
                <div>
                  <div className="text-gray-500">Диапазон</div>
                  <div>{result.start} — {result.end}</div>
                </div>
                <div>
                  <div className="text-gray-500">Дней обработано</div>
                  <div>{result.days_processed}</div>
                </div>
                <div>
                  <div className="text-gray-500">Рейсов выбрано</div>
                  <div>{result.trips_selected}</div>
                </div>
                <div>
                  <div className="text-gray-500">Добавлено строк</div>
                  <div>{result.rows_appended}</div>
                </div>
                <div>
                  <div className="text-gray-500">Пропущено дублей</div>
                  <div>{result.rows_skipped_duplicates}</div>
                </div>
              </div>

              {result.missingSheets?.length ? (
                <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Нет листов для дней: {result.missingSheets.join(', ')}
                </div>
              ) : null}

              <div className="mt-4 overflow-auto">
                <table className="min-w-full">
                  <thead className="bg-[#faf9f6]">
                    <tr className="text-left text-xs text-gray-700">
                      <th className="px-3 py-2 font-medium">Лист (день)</th>
                      <th className="px-3 py-2 font-medium">Добавлено</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(result.per_day || {}).map(([day, v]) => (
                      <tr key={day} className="text-gray-700 text-xs border-t border-gray-100">
                        <td className="px-3 py-2">{day}</td>
                        <td className="px-3 py-2">{v.appended}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
