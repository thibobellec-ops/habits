import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Archive, Edit2, Check, RotateCcw } from 'lucide-react';
import { accentColor, accentDark } from '../../lib/stats';

function uid() { return `habit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

const PX = "'Press Start 2P', monospace";

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
    boxShadow: '2px 2px 0 #0001',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Nom */}
      <div>
        <span style={{ fontFamily: PX, fontSize: 6, color: '#9090b0', display: 'block', marginBottom: 8, letterSpacing: '0.06em' }}>
          ✏️ NOM
        </span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          style={inputStyle}
          placeholder="Nom de l'habitude..."
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
                  fontFamily: PX, fontSize: 6,
                  cursor: 'pointer',
                  boxShadow: active ? `2px 2px 0 ${accentDk}` : '2px 2px 0 #0001',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.1s',
                }}
              >
                {active && <Check size={8} strokeWidth={3} />}
                {c.toUpperCase()}
              </button>
            );
          })}
          {!addCat && (
            <button type="button" onClick={() => setAddCat(true)} style={{
              padding: '6px 10px',
              border: `2px dashed ${accent}88`,
              background: 'transparent',
              color: accent, fontFamily: PX, fontSize: 6,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Plus size={8} /> NEW
            </button>
          )}
        </div>
        {addCat && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Nouvelle catégorie..."
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
              }}
            >
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
            { val: 'positive', label: '✅ POSITIF',   col: '#5AC54F', dk: '#2D7B23' },
            { val: 'negative', label: '⚠️ A EVITER',  col: '#FC5252', dk: '#C00000' },
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
          fontFamily: PX, fontSize: 6, cursor: 'pointer',
          boxShadow: '3px 3px 0 #0002',
        }}>
          ✕ ANNULER
        </button>
        <button type="button" onClick={save} style={{
          flex: 1, padding: '10px', border: `2px solid ${accent}`,
          background: accent, color: '#fff',
          fontFamily: PX, fontSize: 6, cursor: 'pointer',
          boxShadow: `3px 3px 0 ${accentDk}`,
        }}>
          {habit ? '✏️ MODIFIER' : '➕ AJOUTER'}
        </button>
      </div>
    </div>
  );
}

function HabitRow({ habit, onEdit, onArchive, accent, accentDk }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px',
      background: '#ffffff',
      border: `2px solid ${habit.archived ? '#e0e0f0' : '#d0d0e0'}`,
      boxShadow: habit.archived ? 'none' : '3px 3px 0 #0001',
      marginBottom: 6,
      opacity: habit.archived ? 0.5 : 1,
      transition: 'all 0.15s',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: PX, fontSize: 7, color: '#1a1a2e',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 5,
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
      <button type="button" onClick={() => onEdit(habit)} style={{
        background: 'none', border: `2px solid #d0d0e0`, cursor: 'pointer',
        color: '#9090b0', padding: '5px', lineHeight: 0,
        transition: 'all 0.1s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#d0d0e0'; e.currentTarget.style.color = '#9090b0'; }}
      >
        <Edit2 size={11} />
      </button>
      <button type="button" onClick={() => onArchive(habit)} style={{
        background: 'none', border: `2px solid #d0d0e0`, cursor: 'pointer',
        color: '#9090b0', padding: '5px', lineHeight: 0,
        transition: 'all 0.1s',
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

export default function ManageModal({ space, onClose }) {
  const { store, dispatch } = useApp();
  const [editing, setEditing] = useState(null);
  const [adding,  setAdding]  = useState(false);

  const accent   = accentColor(space);
  const accentDk = accentDark(space);

  const habits   = store.habits[space];
  const active   = habits.filter(h => !h.archived);
  const archived = habits.filter(h =>  h.archived);
  const cats     = [...new Set(habits.map(h => h.category))];

  function save(habit) {
    dispatch({ type: editing ? 'UPDATE_HABIT' : 'ADD_HABIT', space, habit });
    setEditing(null);
    setAdding(false);
  }

  function archive(habit) {
    dispatch({ type: 'UPDATE_HABIT', space, habit: { ...habit, archived: !habit.archived } });
  }

  function startEdit(h) {
    setAdding(false);
    setEditing(h);
  }

  const spaceLabel = space === 'pro' ? '💼 PRO' : '🏠 PERSO';

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(18,32,176,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div style={{
        background: '#ffffff',
        border: `3px solid ${accent}`,
        boxShadow: `6px 6px 0 ${accentDk}`,
        width: '100%', maxWidth: 520, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px',
          background: '#1220B0',
          borderBottom: `3px solid ${accent}`,
        }}>
          <div>
            <h2 style={{ fontFamily: PX, fontSize: 11, color: accent, marginBottom: 6 }}>
              ⚙️ MES HABITUDES
            </h2>
            <p style={{ fontFamily: PX, fontSize: 6, color: '#4a5aaa' }}>
              {spaceLabel} — {active.length} ACTIVES
            </p>
          </div>
          <button type="button" onClick={onClose} style={{
            background: 'none', border: `2px solid #2a3aaa`, cursor: 'pointer',
            color: '#4a5aaa', padding: 6, lineHeight: 0,
            transition: 'all 0.1s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a3aaa'; e.currentTarget.style.color = '#4a5aaa'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '16px 18px', flex: 1, background: '#f8f8ff' }}>

          {/* Form ajout/édition */}
          {(adding || editing) && (
            <div style={{
              background: '#ffffff',
              border: `3px solid ${accent}`,
              boxShadow: `4px 4px 0 ${accentDk}`,
              padding: '16px 16px 14px', marginBottom: 16,
            }}>
              <p style={{ fontFamily: PX, fontSize: 7, color: accent, marginBottom: 14, letterSpacing: '0.04em' }}>
                {editing ? '✏️ MODIFIER' : '➕ NOUVELLE HABITUDE'}
              </p>
              <HabitForm
                habit={editing}
                categories={cats}
                onSave={save}
                onCancel={() => { setEditing(null); setAdding(false); }}
                accent={accent}
                accentDk={accentDk}
              />
            </div>
          )}

          {/* Bouton ajouter */}
          {!adding && !editing && (
            <button type="button" onClick={() => setAdding(true)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px 14px', marginBottom: 16,
              background: `${accent}11`,
              border: `2px dashed ${accent}`,
              color: accentDk,
              fontFamily: PX, fontSize: 7,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent}22`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${accent}11`; }}
            >
              <Plus size={12} /> AJOUTER UNE HABITUDE
            </button>
          )}

          {/* Actives */}
          <p style={{ fontFamily: PX, fontSize: 6, color: '#9090b0', marginBottom: 10, letterSpacing: '0.08em' }}>
            ✅ ACTIVES ({active.length})
          </p>
          {active.length === 0 && (
            <p style={{ fontFamily: PX, fontSize: 6, color: '#c0c0d8', marginBottom: 12, lineHeight: 2 }}>
              🌱 AUCUNE HABITUDE — AJOUTE-EN UNE !
            </p>
          )}
          {active.map(h => (
            <HabitRow key={h.id} habit={h} onEdit={startEdit} onArchive={archive} accent={accent} accentDk={accentDk} />
          ))}

          {/* Archivées */}
          {archived.length > 0 && (
            <>
              <p style={{ fontFamily: PX, fontSize: 6, color: '#c0c0d8', margin: '18px 0 10px', letterSpacing: '0.08em' }}>
                📦 ARCHIVEES ({archived.length})
              </p>
              {archived.map(h => (
                <HabitRow key={h.id} habit={h} onEdit={startEdit} onArchive={archive} accent={accent} accentDk={accentDk} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
