import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Archive, Edit2, Check, RotateCcw, GripVertical } from 'lucide-react';
import { accentColor, accentDark } from '../../lib/stats';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function uid() { return `habit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

const PX = "'Press Start 2P', monospace";

// ── Formulaire ajout / édition ────────────────────────────────────
function HabitForm({ habit, categories, onSave, onCancel, accent, accentDk }) {
  const [name,   setName]   = useState(habit?.name     || '');
  const [cat,    setCat]    = useState(habit?.category || categories[0] || '');
  const [newCat, setNewCat] = useState('');
  const [type,   setType]   = useState(habit?.type     || 'positive');
  const [addCat, setAddCat] = useState(false);

  const finalCat = addCat && newCat.trim() ? newCat.trim() : cat;

  function save() {
    if (!name.trim() || !finalCat.trim()) return;
    onSave({
      ...(habit || {}),
      id: habit?.id || uid(),
      name: name.trim(),
      category: finalCat,
      type,
      archived: habit?.archived || false,
      order: habit?.order || 0,
    });
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: '#f8f8ff', border: `2px solid #d0d0e0`,
    color: '#1a1a2e', fontFamily: PX, fontSize: 8,
    outline: 'none', boxSizing: 'border-box',
    boxShadow: '2px 2px 0 #0001', transition: 'border-color 0.15s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Nom */}
      <div>
        <span style={{ fontFamily: PX, fontSize: 6, color: '#9090b0', display: 'block', marginBottom: 8, letterSpacing: '0.06em' }}>
          ✏️ NOM
        </span>
        <input
          value={name} onChange={e => setName(e.target.value)}
          style={inputStyle} placeholder="Nom de l'habitude..."
          onKeyDown={e => e.key === 'Enter' && save()}
          onFocus={e => e.target.style.borderColor = accent}
          onBlur={e => e.target.style.borderColor = '#d0d0e0'}
        />
      </div>

      {/* Catégorie */}
      <div>
        <span style={{ fontFamily: PX, fontSize: 6, color: '#9090b0', display: 'block', marginBottom: 8, letterSpacing: '0.06em' }}>
          🗂️ CATEGORIE
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {categories.map(c => {
            const active = !addCat && cat === c;
            return (
              <button key={c} type="button"
                onClick={() => { setCat(c); setAddCat(false); setNewCat(''); }}
                style={{
                  padding: '6px 10px',
                  border: `2px solid ${active ? accent : '#d0d0e0'}`,
                  background: active ? `${accent}22` : '#f8f8ff',
                  color: active ? accentDk : '#4a4a6e',
                  fontFamily: PX, fontSize: 6, cursor: 'pointer',
                  boxShadow: active ? `2px 2px 0 ${accentDk}` : '2px 2px 0 #0001',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.1s',
                }}>
                {active && <Check size={8} strokeWidth={3} />}
                {c.toUpperCase()}
              </button>
            );
          })}
          {!addCat && (
            <button type="button" onClick={() => setAddCat(true)} style={{
              padding: '6px 10px',
              border: `2px dashed ${accent}88`, background: 'transparent',
              color: accent, fontFamily: PX, fontSize: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Plus size={8} /> NEW
            </button>
          )}
        </div>
        {addCat && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input autoFocus value={newCat} onChange={e => setNewCat(e.target.value)}
              style={{ ...inputStyle, flex: 1 }} placeholder="Nouvelle catégorie..."
              onKeyDown={e => {
                if (e.key === 'Enter' && newCat.trim()) setAddCat(false);
                if (e.key === 'Escape') { setAddCat(false); setNewCat(''); }
              }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e => e.target.style.borderColor = '#d0d0e0'}
            />
            <button type="button"
              onClick={() => { if (newCat.trim()) setAddCat(false); else { setAddCat(false); setNewCat(''); } }}
              style={{
                padding: '8px 10px', border: `2px solid #d0d0e0`,
                background: '#f8f8ff', color: '#4a4a6e',
                fontFamily: PX, fontSize: 6, cursor: 'pointer',
                boxShadow: '2px 2px 0 #0001', whiteSpace: 'nowrap', flexShrink: 0,
              }}>
              {newCat.trim() ? '✓ OK' : 'ANNUL'}
            </button>
          </div>
        )}
        {addCat && newCat.trim() && (
          <p style={{ fontFamily: PX, fontSize: 5, color: accent, marginTop: 6 }}>
            → «{newCat.trim().toUpperCase()}»
          </p>
        )}
      </div>

      {/* Type */}
      <div>
        <span style={{ fontFamily: PX, fontSize: 6, color: '#9090b0', display: 'block', marginBottom: 8, letterSpacing: '0.06em' }}>
          🎯 TYPE
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { val: 'positive', label: '✅ POSITIF',  col: '#5AC54F', dk: '#2D7B23' },
            { val: 'negative', label: '⚠️ A EVITER', col: '#FC5252', dk: '#C00000' },
          ].map(({ val, label, col, dk }) => (
            <button key={val} type="button" onClick={() => setType(val)} style={{
              flex: 1, padding: '10px 8px', cursor: 'pointer',
              fontFamily: PX, fontSize: 6,
              border: `2px solid ${type === val ? col : '#d0d0e0'}`,
              background: type === val ? `${col}18` : '#f8f8ff',
              color: type === val ? dk : '#9090b0',
              boxShadow: type === val ? `2px 2px 0 ${dk}` : '2px 2px 0 #0001',
              transition: 'all 0.1s',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <button type="button" onClick={onCancel} style={{
          flex: 1, padding: '10px', border: `2px solid #d0d0e0`,
          background: '#f0f0f8', color: '#4a4a6e',
          fontFamily: PX, fontSize: 6, cursor: 'pointer', boxShadow: '3px 3px 0 #0002',
        }}>
          ✕ ANNULER
        </button>
        <button type="button" onClick={save} style={{
          flex: 1, padding: '10px', border: `2px solid ${accent}`,
          background: accent, color: '#fff',
          fontFamily: PX, fontSize: 6, cursor: 'pointer', boxShadow: `3px 3px 0 ${accentDk}`,
        }}>
          {habit ? '✏️ MODIFIER' : '➕ AJOUTER'}
        </button>
      </div>
    </div>
  );
}

// ── Ligne habitude (affichage pur, pas de DnD ici) ────────────────
function HabitCard({ habit, onEdit, onArchive, accent, accentDk, dragHandleProps, isDragging }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px',
      background: isDragging ? `${accent}11` : '#ffffff',
      border: `2px solid ${isDragging ? accent : '#d0d0e0'}`,
      boxShadow: isDragging ? `4px 4px 0 ${accentDk}` : '3px 3px 0 #0001',
      opacity: habit.archived ? 0.5 : 1,
      transition: 'box-shadow 0.1s, border-color 0.1s',
      userSelect: 'none',
    }}>
      {/* Poignée drag — uniquement sur les actifs */}
      {!habit.archived && (
        <div
          {...dragHandleProps}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            color: '#c0c0d8', flexShrink: 0, lineHeight: 0,
            touchAction: 'none',   // ← essentiel pour le touch
            padding: '4px 2px',
          }}
          title="Glisser pour réordonner"
        >
          <GripVertical size={14} />
        </div>
      )}

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: PX, fontSize: 7, color: '#1a1a2e',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5,
        }}>
          {habit.name}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: PX, fontSize: 5, padding: '2px 6px',
            border: `1px solid ${habit.type === 'negative' ? '#FC5252' : '#5AC54F'}`,
            color: habit.type === 'negative' ? '#FC5252' : '#2D7B23',
            background: habit.type === 'negative' ? 'rgba(252,82,82,0.07)' : 'rgba(90,197,79,0.07)',
          }}>
            {habit.type === 'negative' ? '⚠ EVITER' : '✓ POSITIF'}
          </span>
          <span style={{ fontFamily: PX, fontSize: 5, color: '#9090b0', padding: '2px 0' }}>
            {habit.category.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <button type="button" onClick={() => onEdit(habit)} style={{
        background: 'none', border: `2px solid #d0d0e0`, cursor: 'pointer',
        color: '#9090b0', padding: '5px', lineHeight: 0, transition: 'all 0.1s', flexShrink: 0,
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#d0d0e0'; e.currentTarget.style.color = '#9090b0'; }}
      >
        <Edit2 size={11} />
      </button>
      <button type="button" onClick={() => onArchive(habit)} style={{
        background: 'none', border: `2px solid #d0d0e0`, cursor: 'pointer',
        color: '#9090b0', padding: '5px', lineHeight: 0, transition: 'all 0.1s', flexShrink: 0,
      }}
        title={habit.archived ? 'Réactiver' : 'Archiver'}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#FC5252'; e.currentTarget.style.color = '#FC5252'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#d0d0e0'; e.currentTarget.style.color = '#9090b0'; }}
      >
        {habit.archived ? <RotateCcw size={11} /> : <Archive size={11} />}
      </button>
    </div>
  );
}

// ── Wrapper sortable pour chaque ligne ────────────────────────────
function SortableHabitRow({ habit, onEdit, onArchive, accent, accentDk }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: habit.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: 6,
        zIndex: isDragging ? 10 : 'auto',
        position: 'relative',
      }}
    >
      <HabitCard
        habit={habit}
        onEdit={onEdit}
        onArchive={onArchive}
        accent={accent}
        accentDk={accentDk}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

// ── Modal principale ──────────────────────────────────────────────
export default function ManageModal({ space, onClose }) {
  const { store, dispatch } = useApp();
  const [editing, setEditing] = useState(null);
  const [adding,  setAdding]  = useState(false);
  const [activeId, setActiveId] = useState(null);  // pour DragOverlay

  const accent   = accentColor(space);
  const accentDk = accentDark(space);
  const spaceLabel = space === 'pro' ? '💼 PRO' : '🏠 PERSO';

  const habits   = store.habits[space];
  const archived = habits.filter(h => h.archived);
  const cats     = [...new Set(habits.map(h => h.category))];

  // Ordre local des habitudes actives (initialisé + mis à jour depuis le store)
  const [sortedIds, setSortedIds] = useState(() =>
    [...habits.filter(h => !h.archived)]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(h => h.id)
  );

  // Sync quand une habitude est ajoutée ou archivée
  useEffect(() => {
    const activeIds = habits.filter(h => !h.archived).map(h => h.id);
    setSortedIds(prev => {
      const kept = prev.filter(id => activeIds.includes(id));
      const added = activeIds.filter(id => !kept.includes(id));
      return [...kept, ...added];
    });
  }, [habits.filter(h => !h.archived).length]); // eslint-disable-line

  // Liste triée à afficher
  const sortedActive = useMemo(() => {
    const map = Object.fromEntries(habits.filter(h => !h.archived).map(h => [h.id, h]));
    return sortedIds.map(id => map[id]).filter(Boolean);
  }, [sortedIds, habits]);

  // Sensors : souris + touch (avec délai pour éviter conflits scroll)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 180, tolerance: 8 } }),
  );

  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = sortedIds.indexOf(active.id);
    const newIdx = sortedIds.indexOf(over.id);
    const newIds = arrayMove(sortedIds, oldIdx, newIdx);
    setSortedIds(newIds);
    // Persister les nouveaux ordres
    newIds.forEach((id, i) => {
      const h = habits.find(h => h.id === id);
      if (h && h.order !== i) {
        dispatch({ type: 'UPDATE_HABIT', space, habit: { ...h, order: i } });
      }
    });
  }

  function save(habit) {
    dispatch({ type: editing ? 'UPDATE_HABIT' : 'ADD_HABIT', space, habit });
    setEditing(null);
    setAdding(false);
  }

  function archive(habit) {
    dispatch({ type: 'UPDATE_HABIT', space, habit: { ...habit, archived: !habit.archived } });
  }

  function startEdit(h) { setAdding(false); setEditing(h); }

  const draggedHabit = activeId ? habits.find(h => h.id === activeId) : null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(18,32,176,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px',
      }}
    >
      <div style={{
        background: '#ffffff',
        border: `3px solid ${accent}`,
        boxShadow: `6px 6px 0 ${accentDk}`,
        width: '100%', maxWidth: 520,
        /* Responsive : prend toute la hauteur sur mobile */
        maxHeight: 'min(90vh, 700px)',
        height: '100%',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', background: '#1220B0',
          borderBottom: `3px solid ${accent}`, flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: PX, fontSize: 11, color: accent, marginBottom: 6 }}>
              ⚙️ MES HABITUDES
            </h2>
            <p style={{ fontFamily: PX, fontSize: 6, color: '#4a5aaa' }}>
              {spaceLabel} — {sortedActive.length} ACTIVES
            </p>
          </div>
          <button type="button" onClick={onClose} style={{
            background: 'none', border: `2px solid #2a3aaa`, cursor: 'pointer',
            color: '#4a5aaa', padding: 6, lineHeight: 0, transition: 'all 0.1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a3aaa'; e.currentTarget.style.color = '#4a5aaa'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body scrollable */}
        <div style={{ overflowY: 'auto', padding: '16px 18px', flex: 1, background: '#f8f8ff' }}>

          {/* Formulaire ajout / édition */}
          {(adding || editing) && (
            <div style={{
              background: '#ffffff', border: `3px solid ${accent}`,
              boxShadow: `4px 4px 0 ${accentDk}`,
              padding: '16px 16px 14px', marginBottom: 16,
            }}>
              <p style={{ fontFamily: PX, fontSize: 7, color: accent, marginBottom: 14, letterSpacing: '0.04em' }}>
                {editing ? '✏️ MODIFIER' : '➕ NOUVELLE HABITUDE'}
              </p>
              <HabitForm
                habit={editing} categories={cats} onSave={save}
                onCancel={() => { setEditing(null); setAdding(false); }}
                accent={accent} accentDk={accentDk}
              />
            </div>
          )}

          {/* Bouton ajouter */}
          {!adding && !editing && (
            <button type="button" onClick={() => setAdding(true)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px 14px', marginBottom: 16,
              background: `${accent}11`, border: `2px dashed ${accent}`,
              color: accentDk, fontFamily: PX, fontSize: 7, cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = `${accent}22`}
              onMouseLeave={e => e.currentTarget.style.background = `${accent}11`}
            >
              <Plus size={12} /> AJOUTER UNE HABITUDE
            </button>
          )}

          {/* ── Liste active avec drag-and-drop ── */}
          <p style={{ fontFamily: PX, fontSize: 6, color: '#9090b0', marginBottom: 10, letterSpacing: '0.08em' }}>
            ✅ ACTIVES ({sortedActive.length})
          </p>
          {sortedActive.length === 0 && (
            <p style={{ fontFamily: PX, fontSize: 6, color: '#c0c0d8', marginBottom: 12, lineHeight: 2 }}>
              🌱 AUCUNE HABITUDE — AJOUTE-EN UNE !
            </p>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
              {sortedActive.map(h => (
                <SortableHabitRow
                  key={h.id} habit={h}
                  onEdit={startEdit} onArchive={archive}
                  accent={accent} accentDk={accentDk}
                />
              ))}
            </SortableContext>

            {/* Fantôme qui suit le curseur / doigt pendant le drag */}
            <DragOverlay>
              {draggedHabit && (
                <div style={{ opacity: 0.95, transform: 'rotate(1.5deg)' }}>
                  <HabitCard
                    habit={draggedHabit} onEdit={() => {}} onArchive={() => {}}
                    accent={accent} accentDk={accentDk}
                    dragHandleProps={{}} isDragging={true}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {/* Indice glisser (si habitudes présentes) */}
          {sortedActive.length > 1 && !adding && !editing && (
            <p style={{
              fontFamily: PX, fontSize: 5, color: '#c0c0d8',
              textAlign: 'center', marginTop: 4, marginBottom: 12,
            }}>
              ↕ GLISSE LES HABITUDES POUR LES REORDONNER
            </p>
          )}

          {/* ── Archivées ── */}
          {archived.length > 0 && (
            <>
              <p style={{ fontFamily: PX, fontSize: 6, color: '#c0c0d8', margin: '18px 0 10px', letterSpacing: '0.08em' }}>
                📦 ARCHIVEES ({archived.length})
              </p>
              {archived.map(h => (
                <div key={h.id} style={{ marginBottom: 6 }}>
                  <HabitCard
                    habit={h} onEdit={startEdit} onArchive={archive}
                    accent={accent} accentDk={accentDk}
                    dragHandleProps={{}} isDragging={false}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
