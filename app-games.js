// New module for game posting + genre selection + search (frontend, localStorage)
// Add a <script src="app-games.js"></script> to index.html after app.js

// 1) Configuration - list your allowed genres here
const GENRES = [
  'Action','Adventure','Puzzle','Platformer','Shooter',
  'RPG','Strategy','Simulation','Sports','Racing',
  'Horror','Educational','Casual','Multiplayer','Music'
];

const GAMES_KEY = 'jadehq_games';

function $(id){ return document.getElementById(id); }

// Simple games store in localStorage
function loadGames(){
  try {
    const raw = localStorage.getItem(GAMES_KEY) || '[]';
    return JSON.parse(raw);
  } catch(e) {
    console.error('Failed to parse games from storage', e);
    return [];
  }
}
function saveGames(arr){
  localStorage.setItem(GAMES_KEY, JSON.stringify(arr));
}

// Create genre chips (reusable for post form and search)
function createGenreChips(containerEl, selectedSet){
  containerEl.innerHTML = '';
  GENRES.forEach(genre => {
    const chip = document.createElement('div');
    chip.className = 'genre-chip' + (selectedSet && selectedSet.has(genre) ? ' selected' : '');
    chip.textContent = genre;
    chip.dataset.genre = genre;
    chip.addEventListener('click', () => {
      const s = chip.classList.toggle('selected');
      // toggle in selectedSet if provided
      if (selectedSet){
        if (s) selectedSet.add(genre); else selectedSet.delete(genre);
      }
    });
    containerEl.appendChild(chip);
  });
}

// Validate at least two genres
function validateMinTwoGenres(set){
  return set && set.size >= 2;
}

// Posting flow
(function initPostGame(){
  const postBtn = $('postGameBtn');
  const modal = $('postGameModal');
  const closeModal = $('closePostModal');
  const form = $('postGameForm');
  const genresContainer = $('genresContainer');
  const genresError = $('genresError');
  const titleInput = $('gameTitle');
  const descInput = $('gameDescription');

  const selected = new Set();
  createGenreChips(genresContainer, selected);

  postBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
  closeModal.addEventListener('click', () => { modal.style.display = 'none'; });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    genresError.style.display = 'none';
    if (!validateMinTwoGenres(selected)){
      genresError.style.display = 'block';
      return;
    }
    const games = loadGames();
    const game = {
      id: Date.now().toString(),
      title: titleInput.value.trim() || 'Untitled',
      description: descInput.value.trim() || '',
      genres: Array.from(selected),
      createdAt: new Date().toISOString()
    };
    games.push(game);
    saveGames(games);
    // Reset UI
    titleInput.value = '';
    descInput.value = '';
    selected.clear();
    createGenreChips(genresContainer, selected);
    modal.style.display = 'none';
    alert('Game posted!');
    renderSearchResults(games); // refresh results if visible
  });
})();

// Search flow
(function initSearch(){
  const searchContainer = $('searchGenresContainer');
  const searchBtn = $('searchBtn');
  const resultsEl = $('searchResults');

  const selected = new Set();
  createGenreChips(searchContainer, selected);

  function getSearchMode(){
    const mode = document.querySelector('input[name="genreMode"]:checked');
    return mode ? mode.value : 'AND';
  }

  searchBtn.addEventListener('click', () => {
    const games = loadGames();
    const mode = getSearchMode();
    const results = filterGamesByGenres(games, Array.from(selected), mode);
    renderSearchResults(results, resultsEl);
  });

  // initially render all games
  renderSearchResults(loadGames(), resultsEl);
})();

// Filtering logic: mode 'AND' means game must contain ALL requested genres.
// mode 'OR' means game must contain AT LEAST ONE.
function filterGamesByGenres(games, genres, mode='AND'){
  if (!genres || genres.length === 0) return games.slice();
  if (mode === 'OR'){
    return games.filter(g => g.genres.some(gg => genres.includes(gg)));
  } else {
    // AND
    return games.filter(g => genres.every(req => g.genres.includes(req)));
  }
}

function renderSearchResults(games, container){
  const out = container || $('searchResults');
  out.innerHTML = '';
  if (!games || games.length === 0){
    out.textContent = 'No games found.';
    return;
  }
  games.forEach(g => {
    const div = document.createElement('div');
    div.className = 'game-card';
    const title = document.createElement('div');
    title.style.fontWeight = 600;
    title.textContent = g.title;
    const desc = document.createElement('div');
    desc.style.fontSize = '13px';
    desc.style.marginTop = '6px';
    desc.textContent = g.description || '';
    const meta = document.createElement('div');
    meta.style.marginTop = '8px';
    meta.style.fontSize = '12px';
    meta.style.color = '#444';
    meta.textContent = 'Genres: ' + g.genres.join(', ');
    div.appendChild(title);
    div.appendChild(desc);
    div.appendChild(meta);
    out.appendChild(div);
  });
}
