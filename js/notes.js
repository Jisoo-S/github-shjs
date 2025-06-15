function saveNotes(notes) {
  localStorage.setItem('calendar_notes', JSON.stringify(notes));
  console.log('Notes saved to localStorage:', notes);
}

function getNotes() {
  const savedNotes = localStorage.getItem('calendar_notes');
  const parsedNotes = JSON.parse(savedNotes || '[]');
  console.log('Notes loaded from localStorage:', parsedNotes);
  return parsedNotes;
}

function addNote() {
  const noteInput = document.getElementById('note-input');
  const text = noteInput.value.trim();
  
  console.log('addNote called. Input text:', text);

  if (!text) {
    console.log('No text entered, returning.');
    return; // 입력값이 없으면 추가하지 않음
  }

  const notes = getNotes();
  const newNote = {
    id: Date.now(), // 고유 ID 생성
    text: text,
    date: new Date().toISOString() // 날짜 정보는 유지
  };

  notes.push(newNote);
  console.log('New note added to array:', newNote);
  saveNotes(notes);
  renderNotes(); // 메모 추가 후 목록 다시 렌더링
  noteInput.value = ''; // 입력 필드 초기화
  console.log('addNote completed. List should be updated.');
}

function deleteNote(id) {
  const notes = getNotes();
  const filteredNotes = notes.filter(n => n.id !== id);
  saveNotes(filteredNotes);
  renderNotes(); // 삭제 후 목록 다시 렌더링
}

function renderNotes() {
  const noteList = document.getElementById('note-list');
  if (!noteList) {
    console.error('Error: #note-list element not found in renderNotes.');
    return;
  }
  console.log('Rendering notes...');

  const notes = getNotes();
  
  // 정렬: 최신 메모가 먼저 오도록 날짜 역순 정렬
  const sortedNotes = notes.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log('Sorted notes:', sortedNotes);

  noteList.innerHTML = ''; // 기존 목록을 비우고 새로 그림
  console.log('noteList cleared. Number of notes to render:', sortedNotes.length);
  
  if (sortedNotes.length === 0) {
    console.log('No notes to display.');
    const noNotesMessage = document.createElement('li');
    noNotesMessage.textContent = '메모가 없습니다.';
    noNotesMessage.style.cssText = 'text-align: center; color: #888; padding: 20px;';
    noteList.appendChild(noNotesMessage);
  }

  sortedNotes.forEach(note => {
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
    `;

    // 메모 내용
    const content = document.createElement('div');
    content.style.cssText = `
      flex-grow: 1;
      margin-right: 12px;
    `;
    
    const text = document.createElement('div');
    text.style.cssText = `
      margin-bottom: 4px;
      white-space: pre-wrap; /* 줄바꿈 유지 */
    `;
    text.textContent = note.text;
    content.appendChild(text);

    // 날짜 정보만 유지 (카테고리 제거)
    const meta = document.createElement('div');
    meta.style.cssText = `
      font-size: 12px;
      color: #666;
      display: flex;
      gap: 8px;
    `;
    
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
    console.log('Appended note:', note.text);
  });
  console.log('Finished rendering notes.');
}

// Notes 패널 초기화 (HTML이 직접 정의하는 경우 이 함수는 UI 구성보다는 이벤트 리스너 연결 및 초기 렌더링에 집중)
function initializeNotesPanel() {
  // HTML에서 직접 정의된 요소에 이벤트 리스너만 연결
  const addNoteButton = document.querySelector('#note-panel button[onclick="addNote()"]');
  if (addNoteButton) {
    addNoteButton.onclick = addNote; // 기존 onclick 속성 제거하고 이벤트 리스너로 연결
  }

  // 엔터 키로 메모 추가 (Ctrl+Enter 줄바꿈)
  const noteInput = document.getElementById('note-input');
  if (noteInput) {
    noteInput.addEventListener('keydown', (e) => { // keydown 이벤트로 변경
      console.log('Key pressed: ', e.key, ' | CtrlKey: ', e.ctrlKey, ' | ShiftKey: ', e.shiftKey, ' | AltKey: ', e.altKey);
      if (e.key === 'Enter') {
        console.log('Enter key detected.');
        if (e.ctrlKey) {
          console.log('Ctrl + Enter detected. Manually inserting newline.');
          e.preventDefault(); // 기본 동작 방지 (수동 줄바꿈 삽입을 위해)

          // 현재 커서 위치에 줄바꿈 문자 삽입
          const start = noteInput.selectionStart;
          const end = noteInput.selectionEnd;
          noteInput.value = noteInput.value.substring(0, start) + "\n" + noteInput.value.substring(end);
          
          // 커서 위치 업데이트
          noteInput.selectionStart = noteInput.selectionEnd = start + 1;
          console.log('After Ctrl+Enter, textarea value:', JSON.stringify(noteInput.value)); // 새 로그

        } else {
          console.log('Plain Enter detected. Preventing default and adding note.');
          // Enter만: 메모 추가
          e.preventDefault(); // 기본 Enter 동작 (폼 제출/줄바꿈) 방지
          addNote();
        }
      }
    });
  }

  // 초기 렌더링
  renderNotes();
  console.log('Notes Panel initialized.');
} 