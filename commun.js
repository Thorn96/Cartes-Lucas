// Partagé par le tirage (index.html) et la page des decks (decks.html).
const REPO = 'Thorn96/Cartes-Lucas', BRANCH = 'main';
const IMG = /\.(png|jpe?g|webp|gif)$/i;
const DECKS_KEY = 'bq-decks';

// Les cartes = les images du dossier "cartes" du dépôt ; leur sous-dossier (bonus/ ou malus/) donne leur type.
// ponytail: API GitHub sans jeton = 60 lectures/heure par connexion, largement assez pour un jeu entre amis.
async function loadCards() {
  const r = await fetch(`https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`, { cache: 'no-store' });
  if (!r.ok) throw new Error('GitHub ' + r.status);
  const { tree } = await r.json();
  return tree
    .filter(f => f.type === 'blob' && f.path.startsWith('cartes/') && IMG.test(f.path))
    .map(f => {
      const parts = f.path.split('/'), type = parts.length > 2 ? parts[1].toLowerCase() : '';
      return {
        key: f.path,
        type: type === 'bonus' || type === 'malus' ? type : '',
        name: parts.at(-1).replace(IMG, ''),
        src: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${parts.map(encodeURIComponent).join('/')}`,
      };
    });
}

// Decks : { decks: [{ id, name, cards: [chemins des cartes] }], current: id du deck choisi ('' = toutes les cartes) }.
// Gardés dans le navigateur de chacun.
function loadDecks() {
  try {
    const d = JSON.parse(localStorage.getItem(DECKS_KEY));
    if (d && Array.isArray(d.decks)) return d;
  } catch {}
  return { decks: [], current: '' };
}
function saveDecks(state) {
  try { localStorage.setItem(DECKS_KEY, JSON.stringify(state)); return true; } catch { return false; }
}

function typeSummary(types) {
  const n = t => types.filter(x => x === t).length;
  const other = types.length - n('bonus') - n('malus');
  return `${n('bonus')} bonus · ${n('malus')} malus` + (other ? ` · ${other} sans type` : '');
}
