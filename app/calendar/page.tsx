'use client';

import { useEffect, useState, useCallback } from 'react';
import AiInsight from '@/components/AiInsight';

interface CalendarEvent {
  id: string; title: string; date: string; endDate?: string;
  type: 'leave' | 'interview' | 'training' | 'expiry';
  status?: string; employee?: string;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TYPE_STYLES: Record<string, { color: string; bg: string; icon: string }> = {
  leave:     { color: '#0ABAB5', bg: 'rgba(10,186,181,0.12)', icon: 'calendar-off' },
  interview: { color: '#6A1B9A', bg: 'rgba(106,27,154,0.12)', icon: 'calendar-event' },
  training:  { color: '#B76E1E', bg: 'rgba(183,110,30,0.12)', icon: 'book' },
  expiry:    { color: '#B71C1C', bg: 'rgba(183,28,28,0.12)', icon: 'alert-triangle' },
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const [lr, ir, tr, dr] = await Promise.allSettled([
        fetch('/api/leave').then(r => r.json()),
        fetch('/api/recruitment/interviews').then(r => r.json()),
        fetch('/api/training').then(r => r.json()),
        fetch('/api/documents').then(r => r.json()),
      ]);

      const list: CalendarEvent[] = [];

      if (lr.status === 'fulfilled' && lr.value.success) {
        for (const l of lr.value.data) {
          const start = l.startDate?.split('T')[0];
          const end = l.endDate?.split('T')[0];
          if (start) {
            list.push({ id: `l-${l.id}`, title: `${l.type} — ${l.employee?.name || ''}`, date: start, endDate: end, type: 'leave', status: l.status, employee: l.employee?.name });
          }
        }
      }

      if (ir.status === 'fulfilled' && ir.value.success) {
        for (const iv of ir.value.data) {
          if (iv.date) {
            list.push({ id: `iv-${iv.id}`, title: `Interview: ${iv.applicant?.name || ''}`, date: iv.date.split('T')[0], type: 'interview', status: iv.status, employee: iv.applicant?.name });
          }
        }
      }

      if (tr.status === 'fulfilled' && tr.value.success) {
        for (const t of tr.value.data) {
          if (t.startDate) {
            list.push({
              id: `t-${t.id}`, title: t.title, date: t.startDate.split('T')[0],
              endDate: t.endDate?.split('T')[0], type: 'training', status: t.status, employee: t.employeeName,
            });
          }
        }
      }

      if (dr.status === 'fulfilled' && dr.value.success) {
        for (const d of dr.value.data) {
          if (d.expiryDate) {
            const diff = Math.ceil((new Date(d.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff <= 90) {
              list.push({ id: `e-${d.id}`, title: `Expires: ${d.title}`, date: d.expiryDate.split('T')[0], type: 'expiry', status: d.status });
            }
          }
        }
      }

      setEvents(list);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      if (e.date === dateStr) return true;
      if (e.endDate && e.date <= dateStr && e.endDate >= dateStr) return true;
      return false;
    });
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); };

  const today = new Date();

  if (loading) return (
    <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spinner" style={{ width: 28, height: 28 }}></span>
    </div>
  );

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
        HR Calendar
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
        {events.length} events this view &middot; Leave &middot; Interviews &middot; Training &middot; Expiries
      </p>

      <div style={{ marginBottom: 16 }}><AiInsight title="Upcoming Events" prompt="Analyse the calendar events - upcoming leaves, interviews, training sessions, document expiries. Identify scheduling patterns." icon="calendar-month" /></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Calendar Grid */}
        <div className="card" style={{ padding: 20 }}>
          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button onClick={prevMonth} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}>
              <i className="ti ti-chevron-left"></i>
            </button>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{MONTHS[month]} {year}</h3>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 11, color: 'var(--muted)' }}>
                Today
              </button>
              <button onClick={nextMonth} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}>
                <i className="ti ti-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--muted)', padding: '6px 0' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: 80, borderRadius: 6, background: 'transparent' }}></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <div key={day} onClick={() => setSelectedDay(isSelected ? null : day)}
                  style={{
                    minHeight: 80, borderRadius: 6, padding: 4, cursor: 'pointer',
                    border: isSelected ? '2px solid var(--tiffany)' : isToday ? '2px solid rgba(10,186,181,0.3)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--tiffany-lt)' : 'var(--surface)',
                    transition: 'all .1s',
                  }}>
                  <div style={{
                    fontSize: 12, fontWeight: isToday ? 700 : 500,
                    color: isToday ? 'var(--tiffany)' : 'var(--text)',
                    marginBottom: 2,
                  }}>
                    {day}
                  </div>
                  {dayEvents.slice(0, 3).map(ev => (
                    <div key={ev.id} style={{
                      fontSize: 9, padding: '1px 4px', borderRadius: 3, marginBottom: 1,
                      background: TYPE_STYLES[ev.type]?.bg || 'var(--gray-50)',
                      color: TYPE_STYLES[ev.type]?.color || 'var(--muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      <i className={`ti ti-${TYPE_STYLES[ev.type]?.icon || 'circle'}`} style={{ fontSize: 8, marginRight: 2 }}></i>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: 9, color: 'var(--muted)', paddingLeft: 4 }}>
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            {Object.entries(TYPE_STYLES).map(([key, s]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }}></div>
                <i className={`ti ti-${s.icon}`} style={{ fontSize: 12, color: s.color }}></i>
                {key.charAt(0).toUpperCase() + key.slice(1)}s
              </div>
            ))}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="card" style={{ padding: 20, minHeight: 300 }}>
          {selectedDay ? (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                {selectedDay} {MONTHS[month]} {year}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
              </p>

              {selectedEvents.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: 24 }}>No events on this day.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedEvents.map(ev => {
                    const s = TYPE_STYLES[ev.type];
                    return (
                      <div key={ev.id} style={{
                        padding: '10px 12px', borderRadius: 8, borderLeft: `3px solid ${s.color}`,
                        background: `${s.bg}` || 'var(--bg)',
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                          <i className={`ti ti-${s.icon}`} style={{ fontSize: 12, marginRight: 4, color: s.color }}></i>
                          {ev.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 8 }}>
                          {ev.employee && <span>{ev.employee}</span>}
                          {ev.status && (
                            <span style={{
                              padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 500,
                              background: ev.status === 'Approved' || ev.status === 'Completed' ? 'rgba(10,186,181,0.1)' : ev.status === 'Pending' ? 'rgba(221,170,68,0.1)' : 'var(--gray-50)',
                              color: ev.status === 'Approved' || ev.status === 'Completed' ? 'var(--tiffany)' : ev.status === 'Pending' ? 'var(--amber)' : 'var(--muted)',
                            }}>{ev.status}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13 }}>
              <i className="ti ti-calendar" style={{ fontSize: 32, display: 'block', marginBottom: 8, opacity: 0.5 }}></i>
              Click a day to view events
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
