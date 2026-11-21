'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Sparkles, X } from 'lucide-react';
import { ALL_LESSONS } from '@/data/curriculum';
import { GLOSSARY_ITEMS } from '@/data/glossary';

export function SearchModal({
  open,
  onClose,
  onSelectLesson,
  onOpenGlossary,
}: {
  open: boolean;
  onClose: () => void;
  onSelectLesson: (lessonId: string) => void;
  onOpenGlossary: () => void;
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) onClose();
      } else if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const lessons = ALL_LESSONS.filter(
      (l) =>
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q) ||
        l.number.includes(q)
    ).slice(0, 7);

    const terms = GLOSSARY_ITEMS.filter(
      (g) =>
        !q ||
        g.term.toLowerCase().includes(q) ||
        g.definition.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    ).slice(0, 5);

    return { lessons, terms };
  }, [query]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search course">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Search size={18} color="var(--ink-muted)" />
          <input
            autoFocus
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${ALL_LESSONS.length} lessons or 30+ AI/ML concepts (e.g. LoRA, SQL, Attention, XGBoost)...`}
          />
          <button type="button" className="btn btn-sm btn-ghost" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginBottom: 6 }}>
              LESSONS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {results.lessons.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className="lesson-row"
                  onClick={() => {
                    onSelectLesson(l.id);
                    onClose();
                  }}
                >
                  <div className="lesson-row-left">
                    <BookOpen size={15} color="var(--accent)" />
                    <span className="lesson-row-title">
                      {l.number} {l.title}
                    </span>
                  </div>
                  <span className="lesson-row-meta">{l.durationMinutes}m</span>
                </button>
              ))}
              {results.lessons.length === 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>No matching lessons.</span>
              )}
            </div>
          </div>

          <div>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginBottom: 6 }}>
              GLOSSARY CONCEPTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {results.terms.map((t) => (
                <button
                  key={t.term}
                  type="button"
                  className="lesson-row"
                  onClick={() => {
                    onOpenGlossary();
                    onClose();
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={13} color="var(--accent-warm)" /> {t.term}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{t.definition}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
