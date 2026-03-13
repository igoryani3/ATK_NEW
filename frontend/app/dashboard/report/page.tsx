'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, reportsAPI } from '@/lib/api';

type PreviewDay = {
  date: string; // YYYY-MM-DD
  label: string; // DD.MM (день недели)
};

type PreviewRow = {
  plate: string;
  dayAmounts: number[];
  weekTotal: number;
  plan: number;
  deviation: number;
  completionPct: number;
  group: string;
  lowDays: number;
  normDays: number;
  highDays: number;
};

type WeeklyPreviewResponse = {
  days: PreviewDay[];
  rows: PreviewRow[];
  totalsByDay: number[];
  truncated: boolean;
  used_end: string;
  skippedTripsCount?: number;
};

const fmtISO = (d: Date) => d.toISOString().slice(0, 10);

export default function ReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return fmtISO(d);
  });
  const [end, setEnd] = useState<string>(() => fmtISO(new Date()));
  const [data, setData] = useState<WeeklyPreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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

  const loadPreview = useCallback(async () => {
    try {
      setError(null);
      const res = await reportsAPI.weeklyPreview({ start, end });
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError('Ошибка загрузки отчета');
      setData(null);
    }
  }, [start, end]);

  useEffect(() => {
    if (!loading) loadPreview();
  }, [loading, loadPreview]);

  const columns = useMemo(() => {
    const dayCols = data?.days?.length ? data.days : [];
    return {
      dayCols,
      fixed: ['№ автобуса', '∑', 'План', 'Отклонение', '%', 'Группа', '<14500', '14500-16000', '>16000'],
    };
  }, [data]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await reportsAPI.weeklyExcel({ start, end });

      const blob = new Blob([res.data], {
        type: res.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const cd = res.headers['content-disposition'] as string | undefined;
      const match = cd?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/);
      const filename = decodeURIComponent(match?.[1] || match?.[2] || `otchet_${start}_${end}.xlsx`);
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Ошибка скачивания Excel');
    } finally {
      setDownloading(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Отчет</h1>
            <p className="text-sm text-gray-600">Недельный отчет по машинам (по доходу)</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 bg-[#ff6c00] hover:bg-[#a64600] disabled:opacity-60 text-white rounded-lg transition-colors"
          >
            {downloading ? 'Скачивание…' : 'Скачать Excel'}
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-4">
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
                  onClick={loadPreview}
                  className="px-4 py-2 bg-[#00675c] hover:bg-[#004d45] text-white rounded-lg transition-colors"
                >
                  Обновить
                </button>
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

            {data?.truncated && (
              <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Диапазон больше 7 дней: использованы только первые 7 дней (до {data.used_end}).
              </div>
            )}

            {typeof data?.skippedTripsCount === 'number' && data.skippedTripsCount > 0 && (
              <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                Пропущено рейсов без машины: {data.skippedTripsCount}
              </div>
            )}

            {error && (
              <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <div className="bg-[#fffef9] rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-auto">
              <table className="min-w-full">
                <thead className="bg-[#faf9f6]">
                  <tr className="text-left text-xs text-gray-700">
                    <th className="px-3 py-3 font-medium sticky left-0 bg-[#faf9f6]">№ автобуса</th>
                    {columns.dayCols.map((d) => (
                      <th key={d.date} className="px-3 py-3 font-medium">{d.label}</th>
                    ))}
                    <th className="px-3 py-3 font-medium">∑</th>
                    <th className="px-3 py-3 font-medium">План</th>
                    <th className="px-3 py-3 font-medium">Откл.</th>
                    <th className="px-3 py-3 font-medium">%</th>
                    <th className="px-3 py-3 font-medium">Группа</th>
                    <th className="px-3 py-3 font-medium">&lt;14500</th>
                    <th className="px-3 py-3 font-medium">14500-16000</th>
                    <th className="px-3 py-3 font-medium">&gt;16000</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.rows?.length ? (
                    data.rows.map((r) => (
                      <tr key={r.plate} className="text-gray-700 text-xs border-t border-gray-100 hover:bg-[#faf9f6] transition-colors">
                        <td className="px-3 py-2 font-medium sticky left-0 bg-[#fffef9]">{r.plate}</td>
                        {columns.dayCols.map((d, i) => (
                          <td key={d.date} className="px-3 py-2">{(r.dayAmounts[i] ?? 0).toFixed(2)}</td>
                        ))}
                        <td className="px-3 py-2 font-medium">{r.weekTotal.toFixed(2)}</td>
                        <td className="px-3 py-2">{r.plan.toFixed(0)}</td>
                        <td className="px-3 py-2">{r.deviation.toFixed(2)}</td>
                        <td className="px-3 py-2">{(r.completionPct * 100).toFixed(1)}%</td>
                        <td className="px-3 py-2">{r.group}</td>
                        <td className="px-3 py-2">{r.lowDays}</td>
                        <td className="px-3 py-2">{r.normDays}</td>
                        <td className="px-3 py-2">{r.highDays}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={1 + columns.dayCols.length + 9} className="px-4 py-10 text-center text-gray-500 text-sm">
                        Нет данных за выбранный период.
                      </td>
                    </tr>
                  )}

                  {data?.rows?.length ? (
                    <tr className="text-gray-900 text-xs border-t border-gray-200 bg-[#faf9f6]">
                      <td className="px-3 py-2 font-semibold sticky left-0 bg-[#faf9f6]">Итого:</td>
                      {columns.dayCols.map((d, i) => (
                        <td key={d.date} className="px-3 py-2 font-semibold">{(data.totalsByDay[i] ?? 0).toFixed(2)}</td>
                      ))}
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2" />
                      <td className="px-3 py-2" />
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
