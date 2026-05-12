import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Archive, GripVertical, Edit2, Check } from 'lucide-react';

function uid() { return `habit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

const inp = {
  width: '100%', padding: '9px 12px',
  background: '#F5F2EE', border: '1.5px solid #E5E2DC',
  borderRadius: 6, color: '#1C1917',
  fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, outline: 'none',
};

const label = {
  fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700,
  letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8A29E',
  display: 'block', marginBottom: 7,
};

function HabitForm({ habit, categories, onSave, onCancel }) {
  const [name,   setName]   = useState(habit?.name     || '');
  const [cat,    setCat]    = useState(habit?.category || categories[0] || '');
  const [newCat, setNewCat] = useState('');
  const [type,   setType]   = useState(habit?.type     || 'positive');
  const [addCat, setAddCat] = useState(false);

  // Final category is either the new one (if addCat + typed) or the selected pill
  const finalCat = addCat && newCat.trim() ? newCat.trim() : cat;

  function save() {
    if (!name.trim()) return;
    if (!finalCat.trim()) return;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Nom */}
      <div>
        <span style={label}>Nom</span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          style={inp}
          placeholder="Nom de l'habitude"
          onKeyDown={e => e.key === 'Enter' && save()}
        />
      </div>

      {/* Catégorie */}
      <div>
        <span style={label}>Catégorie</span>

        {/* Pills pour catégories existantes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 8 }}>
          {categories.map(c => {
            const active = !addCat && cat === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => { setCat(c); setAddCat(false); setNewCat(''); }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: active ? '1.5px solid #B45309' : '1.5px solid #E5E2DC',
                  background: active ? 'rgba(180,83,9,0.08)' : '#F5F2EE',
                  color: active ? '#B45309' : '#57534E',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {active && <Check size={11} strokeWidth={3} />}
                {c}
              </button>
            );
          })}

          {/* Bouton nouvelle catégorie */}
          {!addCat && (
            <button
              type="button"
              onClick={() => setAddCat(true)}
              style={{
                padding: '6px 12px', borderRadius: 6,
                border: '1.5px dashed rgba(180,83,9,0.35)',
                background: 'transparent',
                color: '#B45309',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <Plus size={12} /> Nouvelle
            </button>
          )}
        </div>

        {/* Saisie nouvelle catégorie */}
        {addCat && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              style={{ ...inp, flex: 1 }}
              placeholder="Nom de la catégorie"
              onKeyDown={e => {
                if (e.key === 'Enter' && newCat.trim()) setAddCat(false);
                if (e.key === 'Escape') { setAddCat(false); setNewCat(''); }
              }}
            />
            <button
              type="button"
              onClick={() => { if (newCat.trim()) setAddCat(false); else { setAddCat(false); setNewCat(''); } }}
              className="btn-ghost"
              style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {newCat.trim() ? 'Valider' : 'Annuler'}
            </button>
          </div>
        )}

        {/* Affichage de la catégorie choisie si nouvelle */}
        {addCat && newCat.trim() && (
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#B45309', marginTop: 6, fontWeight: 600 }}>
            → Nouvelle catégorie : « {newCat.trim()} »
          </p>
        )}
      </div>

      {/* Type */}
      <div>
        <span style={label}>Type</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {['positive', 'negative'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 6, cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13,
                border: type === t ? '1.5px solid transparent' : '1.5px solid #E5E2DC',
                background: type === t
                  ? (t === 'positive' ? 'rgba(180,83,9,0.09)' : 'rgba(220,38,38,0.07)')
                  : '#F5F2EE',
                color: type === t
                  ? (t === 'positive' ? '#B45309' : '#DC2626')
                  : '#A8A29E',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {type === t && <Check size={12} strokeWidth={3} />}
              {t === 'positive' ? 'Positif' : 'Négatif (à éviter)'}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 2 }}>
        <button type="button" onClick={onCancel} className="btn-ghost" style={{ flex: 1 }}>
          Annuler
        </button>
        <button type="button" onClick={save} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
          {habit ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}

function HabitRow({ habit, onEdit, onArchive }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
      borderRadius: 7, background: '#F5F2EE', marginBottom: 5,
      opacity: habit.archived ? 0.45 : 1,
    }}>
      <GripVertical size={13} color="#C7C3BD" style={{ cursor: 'grab', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 600,
          color: '#1C1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {habit.name}
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 700,
            padding: '1px 5px', borderRadius: 3,
            background: habit.type === 'negative' ? 'rgba(220,38,38,0.07)' : 'rgba(180,83,9,0.08)',
            color: habit.type === 'negative' ? '#DC2626' : '#B45309',
          }}>
            {habit.type === 'negative' ? 'Négatif' : 'Positif'}
          </span>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: '#A8A29E' }}>
            {habit.category}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onEdit(habit)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C7C3BD', padding: 4, lineHeight: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = '#B45309'}
        onMouseLeave={e => e.currentTarget.style.color = '#C7C3BD'}
      >
        <Edit2 size={13} />
      </button>
      <button
        type="button"
        onClick={() => onArchive(habit)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C7C3BD', padding: 4, lineHeight: 0 }}
        title={habit.archived ? 'Réactiver' : 'Archiver'}
        onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
        onMouseLeave={e => e.currentTarget.style.color = '#C7C3BD'}
      >
        <Archive size={13} />
      </button>
    </div>
  );
}

export default function ManageModal({ space, onClose }) {
  const { store, dispatch } = useApp();
  const [editing, setEditing] = useState(null);
  const [adding,  setAdding]  = useState(false);

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

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(28,25,23,0.35)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div style={{
        background: '#FFFFFF', border: '1.5px solid #E5E2DC', borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        width: '100%', maxWidth: 520, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px', borderBottom: '1.5px solid #F0EDE8',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 20,
              color: '#1C1917', letterSpacing: '-0.025em',
            }}>
              Mes habitudes
            </h2>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#A8A29E', marginTop: 2 }}>
              {space === 'pro' ? '💼 Pro' : '🏠 Perso'} — {active.length} actives
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A29E', lineHeight: 0, padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '18px 20px', flex: 1 }}>

          {/* Form */}
          {(adding || editing) && (
            <div style={{
              background: '#FAF8F5', border: '1.5px solid #E5E2DC',
              borderRadius: 10, padding: '16px 16px 14px', marginBottom: 18,
            }}>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#B45309', marginBottom: 16,
              }}>
                {editing ? 'Modifier l\'habitude' : 'Nouvelle habitude'}
              </p>
              <HabitForm
                habit={editing}
                categories={cats}
                onSave={save}
                onCancel={() => { setEditing(null); setAdding(false); }}
              />
            </div>
          )}

          {/* Add button */}
          {!adding && !editing && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '11px 14px', marginBottom: 18,
                background: 'rgba(180,83,9,0.04)', border: '1.5px dashed rgba(180,83,9,0.3)',
                borderRadius: 8, cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13,
                color: '#B45309',
              }}
            >
              <Plus size={14} /> Ajouter une habitude
            </button>
          )}

          {/* Active list */}
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.09em', textTransform: 'uppercase', color: '#A8A29E', marginBottom: 8,
          }}>
            Actives ({active.length})
          </p>
          {active.map(h => (
            <HabitRow key={h.id} habit={h} onEdit={startEdit} onArchive={archive} />
          ))}

          {/* Archived */}
          {archived.length > 0 && (
            <>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.09em', textTransform: 'uppercase',
                color: '#C7C3BD', margin: '18px 0 8px',
              }}>
                Archivées ({archived.length})
              </p>
              {archived.map(h => (
                <HabitRow key={h.id} habit={h} onEdit={startEdit} onArchive={archive} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
