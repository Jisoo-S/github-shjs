function saveNotes(notes) {
  localStorage.setItem('calendar_notes', JSON.stringify(notes));
}

function getNotes() {
  return JSON.parse(localStorage.getItem('calendar_notes') || '[]');
}

function addNote() {
  const noteInput = document.getElementById('note-input');
  const text = noteInput.value.trim();
  const categorySelect = document.getElementById('note-category');
  const category = categorySelect.value;
  
  if (!text) return;

  const notes = getNotes();
  const newNote = {
    id: Date.now(),
    text: text,
    category: category,
    completed: false,
    date: new Date().toISOString()
  };

  notes.push(newNote);
  saveNotes(notes);
  renderNotes();
  noteInput.value = '';
}

function toggleNoteComplete(id) {
  const notes = getNotes();
  const note = notes.find(n => n.id === id);
  if (note) {
    note.completed = !note.completed;
    saveNotes(notes);
    renderNotes();
  }
}

function deleteNote(id) {
  const notes = getNotes();
  const filteredNotes = notes.filter(n => n.id !== id);
  saveNotes(filteredNotes);
  renderNotes();
}

function renderNotes() {
  const noteList = document.getElementById('note-list');
  const notes = getNotes();
  const selectedCategory = document.getElementById('note-filter').value;
  
  // 필터링
  let filteredNotes = notes;
  if (selectedCategory) {
    filteredNotes = filteredNotes.filter(note => note.category === selectedCategory);
  }

  // 정렬: 날짜 > 완료여부
  filteredNotes.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.date) - new Date(a.date);
  });

  noteList.innerHTML = '';
  
  filteredNotes.forEach(note => {
    const li = document.createElement('li');
    li.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
      ${note.completed ? 'opacity: 0.7;' : ''}
    `;

    // 체크박스
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = note.completed;
    checkbox.style.cssText = `
      margin-right: 12px;
      width: 18px;
      height: 18px;
      cursor: pointer;
    `;
    checkbox.addEventListener('change', () => toggleNoteComplete(note.id));
    li.appendChild(checkbox);

    // 메모 내용
    const content = document.createElement('div');
    content.style.cssText = `
      flex-grow: 1;
      margin-right: 12px;
    `;
    
    const text = document.createElement('div');
    text.style.cssText = `
      ${note.completed ? 'text-decoration: line-through;' : ''}
      margin-bottom: 4px;
    `;
    text.textContent = note.text;
    content.appendChild(text);

    // 카테고리와 날짜 정보
    const meta = document.createElement('div');
    meta.style.cssText = `
      font-size: 12px;
      color: #666;
      display: flex;
      gap: 8px;
    `;
    
    const categorySpan = document.createElement('span');
    categorySpan.textContent = note.category;
    categorySpan.style.cssText = `
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
    `;
    meta.appendChild(categorySpan);

    const dateSpan = document.createElement('span');
    dateSpan.textContent = new Date(note.date).toLocaleDateString();
    meta.appendChild(dateSpan);

    content.appendChild(meta);
    li.appendChild(content);

    // 삭제 버튼
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      opacity: 0.5;
      transition: opacity 0.2s;
    `;
    deleteBtn.addEventListener('mouseover', () => deleteBtn.style.opacity = '1');
    deleteBtn.addEventListener('mouseout', () => deleteBtn.style.opacity = '0.5');
    deleteBtn.addEventListener('click', () => deleteNote(note.id));
    li.appendChild(deleteBtn);

    noteList.appendChild(li);
  });
}

// Notes 패널 초기화
function initializeNotesPanel() {
  const notePanel = document.getElementById('note-panel');
  notePanel.innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="display: flex; gap: 8px;">
        <select id="note-category" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
          <option value="📝 일반">📝 일반</option>
          <option value="📚 공부">📚 공부</option>
          <option value="🏃 운동">🏃 운동</option>
          <option value="🛒 쇼핑">🛒 쇼핑</option>
          <option value="💼 업무">💼 업무</option>
        </select>
      </div>
    </div>
    <div style="margin-bottom: 20px;">
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <input type="text" id="note-input" placeholder="새 메모..." 
          style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
        <button onclick="addNote()" 
          style="padding: 8px 16px; background: #ffcc70; color: white; border: none; border-radius: 8px; cursor: pointer;">
          추가
        </button>
      </div>
    </div>
    <div style="margin-bottom: 10px;">
      <select id="note-filter" onchange="renderNotes()" 
        style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
        <option value="">모든 카테고리</option>
        <option value="📝 일반">📝 일반</option>
        <option value="📚 공부">📚 공부</option>
        <option value="🏃 운동">🏃 운동</option>
        <option value="🛒 쇼핑">🛒 쇼핑</option>
        <option value="💼 업무">💼 업무</option>
      </select>
    </div>
    <ul id="note-list" style="list-style: none; padding: 0; margin: 0; max-height: 400px; overflow-y: auto;"></ul>
  `;

  // 엔터 키로 메모 추가
  document.getElementById('note-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addNote();
    }
  });

  // 초기 렌더링
  renderNotes();
} 