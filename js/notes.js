// Firebase 관련 함수 임포트
import { getCurrentUser, addNoteToFirebase, getNotesFromFirebase, deleteNoteFromFirebase } from './firebase.js';

let notes = []; // 메모 목록을 저장할 배열

// UI를 업데이트하는 함수
function updateNotesUI() {
  renderNotes();
}

// 기존 saveNotes 함수를 Firebase와 연동하도록 수정
async function saveNotes() {
  // 이 함수는 개별 노트 저장에 사용되지 않고, addNote, deleteNote 등에서 직접 Firebase 연동을 수행합니다.
  // 따라서 여기서는 빈 함수로 두거나, 필요에 따라 전체 노트를 한 번에 저장하는 로직을 추가할 수 있습니다.
  // 현재 구현에서는 개별 노트 작업 시 바로 Firebase와 통신하므로 이 함수는 필요 없을 수 있습니다.
  console.log("saveNotes 호출됨 (Firebase 연동)");
  // if (getCurrentUser()) {
  //   // 모든 노트를 한 번에 저장하는 로직이 필요하다면 여기에 구현
  //   // 예: await setDoc(doc(db, "users", user.uid, "generalNotes", "list"), { notes });
  // }
}

// 기존 getNotes 함수를 Firebase와 연동하도록 수정 (loadNotes로 대체)
// 이 함수는 더 이상 사용되지 않을 것입니다. 대신 loadNotes가 사용됩니다.
function getNotes() {
  console.log("getNotes 호출됨 (더 이상 사용되지 않음, loadNotes 사용)");
  return notes; // 현재 로컬 상태 반환
}

async function addNote() {
  const noteInput = document.getElementById('note-input');
  if (!noteInput) {
    console.error('note-input element not found');
    return;
  }

  const text = noteInput.value.trim();
  console.log('addNote called. Input text:', text);

  if (!text) {
    console.log('No text entered, returning.');
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    alert("로그인해야 메모를 추가할 수 있습니다.");
    return;
  }

  const newNote = {
    text: text,
    date: new Date().toISOString()
  };

  try {
    // Firebase에 저장
    const docRef = await addNoteToFirebase(newNote);
    console.log("메모 추가 성공:", docRef.id);
    
    // 로컬 상태 업데이트
    notes.push({ id: docRef.id, ...newNote });
    
    // UI 업데이트
    updateNotesUI();
    
    // 입력 필드 초기화
    noteInput.value = '';
  } catch (error) {
    console.error("메모 추가 실패:", error);
    alert("메모 추가에 실패했습니다: " + error.message);
  }
}

async function deleteNote(id) {
  const user = getCurrentUser();
  if (!user) {
    alert("로그인해야 메모를 삭제할 수 있습니다.");
    return;
  }

  if (!confirm('이 메모를 삭제하시겠습니까?')) {
    return;
  }

  try {
    // Firebase에서 삭제
    await deleteNoteFromFirebase(id);
    console.log("메모 삭제 성공:", id);
    
    // 로컬 상태 업데이트
    notes = notes.filter(n => n.id !== id);
    
    // UI 업데이트
    updateNotesUI();
  } catch (error) {
    console.error("메모 삭제 실패:", error);
    alert("메모 삭제에 실패했습니다: " + error.message);
  }
}

export async function loadNotes() {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log("사용자가 로그인되어 있지 않습니다.");
      return;
    }

    const loadedNotes = await getNotesFromFirebase();
    notes = loadedNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
    updateNotesUI();
  } catch (error) {
    console.error("메모 목록 로드 실패:", error);
  }
}

export function clearNotesUI() {
  const noteList = document.getElementById('note-list');
  if (noteList) {
    noteList.innerHTML = '';
  }
  notes = [];
  console.log("노트 UI 초기화");
  renderNotes();
}

function renderNotes() {
  const noteList = document.getElementById('note-list');
  if (!noteList) {
    console.error('Error: #note-list element not found in renderNotes.');
    return;
  }

  noteList.innerHTML = '';
  
  if (notes.length === 0) {
    const noNotesMessage = document.createElement('li');
    noNotesMessage.textContent = '메모가 없습니다.';
    noNotesMessage.style.cssText = 'text-align: center; color: #888; padding: 20px;';
    noteList.appendChild(noNotesMessage);
    return;
  }

  notes.forEach(note => {
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

    const content = document.createElement('div');
    content.style.cssText = `
      flex-grow: 1;
      margin-right: 12px;
    `;
    
    const text = document.createElement('div');
    text.style.cssText = `
      margin-bottom: 4px;
      white-space: pre-wrap;
    `;
    text.textContent = note.text;
    content.appendChild(text);

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

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      opacity: 0.5;
      transition: opacity 0.2s;
      padding: 4px 8px;
    `;
    deleteBtn.addEventListener('mouseover', () => deleteBtn.style.opacity = '1');
    deleteBtn.addEventListener('mouseout', () => deleteBtn.style.opacity = '0.5');
    deleteBtn.addEventListener('click', () => deleteNote(note.id));
    li.appendChild(deleteBtn);

    noteList.appendChild(li);
  });
}

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
  const addNoteButton = document.querySelector('#note-panel button[onclick="addNote()"]');
  if (addNoteButton) {
    addNoteButton.onclick = addNote;
  }

  const noteInput = document.getElementById('note-input');
  if (noteInput) {
    noteInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.ctrlKey) {
        e.preventDefault();
        addNote();
      }
    });
  }
});

// 전역으로 함수 노출
window.addNote = addNote;
window.deleteNote = deleteNote;
window.loadNotes = loadNotes;
window.clearNotesUI = clearNotesUI; 