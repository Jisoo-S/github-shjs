// Firebase 관련 함수 임포트
import { getCurrentUser, getTodosFromFirebase, getCalendarNotesFromFirebase, addCalendarNoteToFirebase } from './firebase.js';

let currentDate = new Date();
let calendarMode = "month";
let todos = []; // 할 일 목록을 저장할 배열
let isFriendCalendarMode = false;

// 캘린더 뷰 초기화 함수
async function initializeCalendar() {
  try {
    // Firebase에서 할 일 목록 로드
    todos = await getTodosFromFirebase();
    showMonthView();
  } catch (error) {
    console.error("캘린더 초기화 중 오류:", error);
  }
}  
 
function showMonthView() {
  calendarMode = "month";

  const now = new Date(currentDate);
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'long' });

  const calendarTitleElement = getCalendarTitleElement();
  calendarTitleElement.textContent = monthName.toUpperCase();

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();

  const grid = getCalendarGridElement();
  grid.style.gridTemplateColumns = "repeat(7, 1fr)";
  grid.innerHTML = "";

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  days.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = day;
    header.style.textAlign = 'center';
    header.style.padding = '10px';
    header.style.fontWeight = 'bold';
    header.style.color = day === '일' ? '#ff6b6b' : day === '토' ? '#4dabf7' : 'inherit';
    grid.appendChild(header);
  });

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    if (i < firstDay) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-cell';
      grid.appendChild(emptyCell);
    } else if (i < firstDay + daysInMonth) {
      const date = new Date(year, monthIndex, i - firstDay + 1);
      const cell = createCalendarCell(date);
      grid.appendChild(cell);
    } else {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-cell';
      grid.appendChild(emptyCell);
    }
  }
}

function showWeekView() {
  calendarMode = "week";

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startWeekNum = getWeekNumberInMonth(startOfWeek);
  const endWeekNum = getWeekNumberInMonth(endOfWeek);

  const startMonth = startOfWeek.getMonth();
  const endMonth = endOfWeek.getMonth();

  let label = startMonth === endMonth ? 
    `${ordinal(startWeekNum)} week` : 
    `${ordinal(startWeekNum)} week / ${ordinal(endWeekNum)} week`;

  const calendarTitleElement = getCalendarTitleElement();
  calendarTitleElement.textContent = label;

  const grid = getCalendarGridElement();
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = "repeat(7, 1fr)";

  const days = ['일', '월', '화', '수', '목', '금', '토'];
  days.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = day;
    header.style.textAlign = 'center';
    header.style.padding = '10px';
    header.style.fontWeight = 'bold';
    header.style.color = day === '일' ? '#ff6b6b' : day === '토' ? '#4dabf7' : 'inherit';
    grid.appendChild(header);
  });

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const cell = createCalendarCell(date);
    grid.appendChild(cell);
  }
}

function showTodayView() {
  calendarMode = "today";

  const today = new Date(currentDate);
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}`;
  const calendarTitleElement = getCalendarTitleElement();
  calendarTitleElement.textContent = dateStr;

  const grid = getCalendarGridElement();
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = "1fr";

  const cell = createCalendarCell(today);
  cell.style.height = "200px";
  grid.appendChild(cell);
}

function goPrev() {
  if (calendarMode === "month") {
    currentDate.setMonth(currentDate.getMonth() - 1);
    showMonthView();
  } else if (calendarMode === "week") {
    currentDate.setDate(currentDate.getDate() - 7);
    showWeekView();
  } else if (calendarMode === "today") {
    currentDate.setDate(currentDate.getDate() - 1);
    showTodayView();
  }
}

function goNext() {
  if (calendarMode === "month") {
    currentDate.setMonth(currentDate.getMonth() + 1);
    showMonthView();
  } else if (calendarMode === "week") {
    currentDate.setDate(currentDate.getDate() + 7);
    showWeekView();
  } else if (calendarMode === "today") {
    currentDate.setDate(currentDate.getDate() + 1);
    showTodayView();
  }
}

function getWeekNumberInMonth(date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDay = (firstDayOfMonth.getDay() + 6) % 7;
  const day = date.getDate();
  return Math.ceil((day + firstDay) / 7);
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDate(date) {
  if (typeof date === 'string') return date;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodosForDate(date) {
  const formattedDate = formatDate(date);
  return todos.filter(todo => todo.date === formattedDate);
}

function getPinnedTodosForDate(date) {
  const formattedDate = formatDate(date);
  return todos.filter(todo => todo.date === formattedDate && todo.pinned);
}

function areAllTodosCompleted(todos) {
  return todos.length > 0 && todos.every(todo => todo.completed);
}

function createCalendarCell(date) {
  const cell = document.createElement("div");
  cell.className = "calendar-cell";
  cell.style.position = "relative";
  cell.style.cursor = "pointer";
  cell.style.userSelect = "none";
  
  const formattedDate = formatDate(date);
  cell.dataset.date = formattedDate;
  
  cell.textContent = date.getDate();
  
  // 메모 표시
  const memos = getMemo(formattedDate);
  if (memos.length > 0) {
    const indicator = document.createElement('div');
    indicator.className = 'memo-indicator';
    indicator.style.cssText = `
      width: 6px;
      height: 6px;
      background-color: #ffcc70;
      border-radius: 50%;
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
    `;
    cell.appendChild(indicator);
  }

  // 투두 표시
  const todos = getTodosForDate(date);
  if (todos.length > 0) {
    const todoIndicator = document.createElement('div');
    todoIndicator.className = 'todo-indicator';
    const isAllCompleted = areAllTodosCompleted(todos);
    todoIndicator.style.cssText = `
      width: 8px;
      height: 8px;
      background-color: ${isAllCompleted ? '#999999' : '#ff4d4d'};
      border-radius: 50%;
      position: absolute;
      top: 4px;
      right: 4px;
    `;
    cell.appendChild(todoIndicator);

    // 툴팁 생성
    const tooltip = document.createElement('div');
    tooltip.className = 'todo-tooltip';
    tooltip.style.cssText = `
      display: none;
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 9999;
      min-width: 200px;
      max-width: 300px;
    `;

    // 툴팁 내용 업데이트 함수
    const updateTooltipContent = () => {
      const currentTodos = getTodosForDate(date);
      if (currentTodos.length > 0) {
        tooltip.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 8px; color: #333;">할일 목록</div>
          ${currentTodos.map(todo => `
            <div style="
              padding: 6px 0;
              border-bottom: 1px solid #eee;
              display: flex;
              align-items: center;
              gap: 8px;
              ${todo.completed ? 'opacity: 0.6;' : ''}
            ">
              <span style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: ${todo.category === '업무' ? '#ff9f9f' : 
                                 todo.category === '개인' ? '#9f9fff' : 
                                 todo.category === '학습' ? '#9fff9f' : '#ffcc70'};
                display: inline-block;
              "></span>
              <span style="
                flex: 1;
                text-decoration: ${todo.completed ? 'line-through' : 'none'};
                color: ${todo.completed ? '#999' : '#333'};
              ">${todo.text}</span>
            </div>
          `).join('')}
        `;
      }
    };

    // 초기 툴팁 내용 설정
    updateTooltipContent();

    // 마우스 이벤트 처리
    cell.addEventListener('mouseenter', (e) => {
      updateTooltipContent();
      document.body.appendChild(tooltip);
      tooltip.style.display = 'block';
      
      // 툴팁 위치 계산 (window 기준)
      const rect = cell.getBoundingClientRect();
      let top = rect.bottom + window.scrollY - 24;
      let left = rect.left + window.scrollX + rect.width / 2 - tooltip.offsetWidth / 2;
      // 화면 경계 체크
      if (left < 0) left = 8;
      if (left + tooltip.offsetWidth > window.innerWidth) left = window.innerWidth - tooltip.offsetWidth - 8;
      if (top + tooltip.offsetHeight > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - tooltip.offsetHeight - 8;
      }
      if (top < 0) top = 8;
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
      tooltip.style.position = 'absolute';
      tooltip.style.zIndex = 9999;
    });

    cell.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
      if (tooltip.parentNode === document.body) {
        document.body.removeChild(tooltip);
      }
    });

    cell.appendChild(tooltip);
  }
  
  cell.addEventListener('click', () => {
    showMemoModal(date, isFriendCalendarMode); // 친구 달력 모드면 읽기전용
  });
  
  return cell;
}

function updateCalendarCell(date) {
  const formattedDate = date.toISOString().split('T')[0];
  const memos = getMemo(formattedDate);
  const cells = document.querySelectorAll('.calendar-cell');
  
  cells.forEach(cell => {
    const cellDate = cell.dataset.date;
    if (cellDate === formattedDate) {
      if (memos.length > 0) {
        if (!cell.querySelector('.memo-indicator')) {
          const indicator = document.createElement('div');
          indicator.className = 'memo-indicator';
          indicator.style.cssText = `
            width: 6px;
            height: 6px;
            background-color: #ffcc70;
            border-radius: 50%;
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
          `;
          cell.appendChild(indicator);
        }
      } else {
        const indicator = cell.querySelector('.memo-indicator');
        if (indicator) {
          indicator.remove();
        }
      }
    }
  });
}

// 캘린더 메모 관련 함수들
function saveMemo(date, memo) {
  const formattedDate = formatDate(date);
  const memos = JSON.parse(localStorage.getItem('calendar_memos') || '{}');
  if (!memos[formattedDate]) {
    memos[formattedDate] = [];
  }
  if (memo) {
    const memoObj = {
      id: Date.now(),
      text: memo,
      date: formattedDate
    };
    memos[formattedDate].push(memoObj);
    // 파이어베이스에도 저장
    addCalendarNoteToFirebase({ text: memo, date: formattedDate });
  }
  localStorage.setItem('calendar_memos', JSON.stringify(memos));
}

function getMemo(date) {
  const formattedDate = formatDate(date);
  if (isFriendCalendarMode) {
    // 친구 달력 모드: todos 배열에서 해당 날짜 메모만 추출
    return todos.filter(todo => todo.date === formattedDate);
  } else {
    // 내 달력: localStorage에서 메모 추출
    const memos = JSON.parse(localStorage.getItem('calendar_memos') || '{}');
    return memos[formattedDate] || [];
  }
}

function deleteMemo(date, memoId) {
  const formattedDate = formatDate(date);
  const memos = JSON.parse(localStorage.getItem('calendar_memos') || '{}');
  if (memos[formattedDate]) {
    memos[formattedDate] = memos[formattedDate].filter(memo => memo.id !== memoId);
    if (memos[formattedDate].length === 0) {
      delete memos[formattedDate];
    }
    localStorage.setItem('calendar_memos', JSON.stringify(memos));
  }
}

function showMemoModal(date, readonly = false) {
  const formattedDate = formatDate(date);
  const memos = getMemo(formattedDate);
  
  const modal = showCustomModal({
    title: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`,
    message: `<div style="font-size: 12px; color: #666; margin-bottom: 15px;">메모 ${memos.length}개</div>`,
    showInput: !readonly,
    inputType: "text",
    inputPlaceholder: "새로운 메모를 입력하세요...",
    confirmText: readonly ? "확인" : "저장",
    cancelText: "닫기",
    onConfirm: (value) => {
      if (readonly) return; // 읽기전용이면 아무 동작 안함
      if (value && value.trim()) {
        saveMemo(formattedDate, value.trim());
        if (calendarMode === 'month') {
          showMonthView();
        } else if (calendarMode === 'week') {
          showWeekView();
        } else if (calendarMode === 'today') {
          showTodayView();
        }
      }
    }
  });

  // ESC 키로 모달 닫기
  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      document.body.removeChild(modal.modal);
      document.removeEventListener('keydown', handleEscKey);
    }
  };
  document.addEventListener('keydown', handleEscKey);

  // 모달 외부 클릭 시 닫기
  modal.modal.addEventListener('click', (e) => {
    if (e.target === modal.modal) {
      document.body.removeChild(modal.modal);
      document.removeEventListener('keydown', handleEscKey);
    }
  });

  // 메모 목록 표시
  const memoList = document.createElement('div');
  memoList.style.maxHeight = '300px';
  memoList.style.overflowY = 'auto';
  memoList.style.marginBottom = '20px';
  memoList.style.padding = '10px';
  memoList.style.backgroundColor = 'white';
  memoList.style.borderRadius = '10px';
  memoList.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';

  // 메모 개수 업데이트 함수
  const updateMemoCount = () => {
    const currentMemos = getMemo(formattedDate);
    const countElement = modal.modal.querySelector('div[style*="font-size: 12px"]');
    if (countElement) {
      countElement.innerHTML = `메모 ${currentMemos.length}개`;
    }
  };

  // 메모 목록 업데이트 함수
  const updateMemoList = () => {
    const currentMemos = getMemo(formattedDate);
    memoList.innerHTML = '';
    
    currentMemos.forEach(memo => {
      const memoItem = document.createElement('div');
      memoItem.style.display = 'flex';
      memoItem.style.justifyContent = 'space-between';
      memoItem.style.alignItems = 'center';
      memoItem.style.padding = '12px';
      memoItem.style.marginBottom = '8px';
      memoItem.style.backgroundColor = '#f8f8f8';
      memoItem.style.borderRadius = '8px';
      memoItem.style.transition = 'background-color 0.2s';

      const memoText = document.createElement('span');
      memoText.textContent = memo.text;
      memoText.style.flex = '1';
      memoText.style.marginRight = '10px';
      memoText.style.fontSize = '14px';
      memoText.style.color = '#333';

      if (!readonly) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.style.border = 'none';
        deleteBtn.style.background = 'none';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.opacity = '0.5';
        deleteBtn.style.transition = 'opacity 0.2s';
        deleteBtn.style.padding = '4px';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.onmouseover = () => {
          deleteBtn.style.opacity = '1';
          deleteBtn.style.backgroundColor = '#ff9f9f';
        };
        deleteBtn.onmouseout = () => {
          deleteBtn.style.opacity = '0.5';
          deleteBtn.style.backgroundColor = 'transparent';
        };
        deleteBtn.onclick = () => {
          deleteMemo(formattedDate, memo.id);
          updateMemoList();
          updateMemoCount();
          if (calendarMode === 'month') {
            showMonthView();
          } else if (calendarMode === 'week') {
            showWeekView();
          } else if (calendarMode === 'today') {
            showTodayView();
          }
        };
        memoItem.appendChild(memoText);
        memoItem.appendChild(deleteBtn);
      } else {
        memoItem.appendChild(memoText);
      }
      memoList.appendChild(memoItem);
    });
  };

  // 초기 메모 목록 표시
  updateMemoList();

  // 모달 컨텐츠에 메모 목록 추가
  const modalContent = modal.modal.querySelector('div');
  modalContent.insertBefore(memoList, modalContent.querySelector('input'));

  // 모달 스타일 수정
  const modalDiv = modal.modal.querySelector('div');
  modalDiv.style.backgroundColor = '#f5f5f5';
  modalDiv.style.padding = '20px';
  modalDiv.style.borderRadius = '16px';
  modalDiv.style.width = '400px';
  modalDiv.style.maxWidth = '90%';

  // 버튼 스타일 수정
  const buttons = modalDiv.querySelectorAll('button');
  buttons.forEach(button => {
    button.style.padding = '8px 16px';
    button.style.border = 'none';
    button.style.borderRadius = '10px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    button.style.transition = 'background-color 0.2s';
    
    if (button.textContent === '저장') {
      button.style.backgroundColor = '#ffe08a';
      button.style.color = '#333';
      // 저장 버튼 클릭 시 모달 닫히지 않도록 수정
      button.onclick = (e) => {
        if (readonly) return;
        e.preventDefault();
        const input = modalDiv.querySelector('input');
        if (input && input.value.trim()) {
          saveMemo(formattedDate, input.value.trim());
          input.value = '';
          updateMemoList();
          updateMemoCount();
          if (calendarMode === 'month') {
            showMonthView();
          } else if (calendarMode === 'week') {
            showWeekView();
          } else if (calendarMode === 'today') {
            showTodayView();
          }
        }
      };
    }
  });

  // 입력 필드 스타일 수정
  const input = modalDiv.querySelector('input');
  if (input) {
    input.style.width = '100%';
    input.style.maxWidth = '100%';
    input.style.padding = '12px';
    input.style.marginBottom = '20px';
    input.style.border = '1px solid #ddd';
    input.style.borderRadius = '10px';
    input.style.backgroundColor = 'white';
    input.style.fontSize = '14px';
    input.style.boxSizing = 'border-box';
    input.style.outline = 'none';
    
    // 엔터키로 저장 (모달은 닫지 않음)
    input.addEventListener('keydown', (e) => {
      if (readonly) return;
      if (e.key === 'Enter') {
        const value = input.value.trim();
        if (value) {
          saveMemo(formattedDate, value);
          input.value = ''; // 입력창만 초기화
          updateMemoList(); // 메모 목록 업데이트
          updateMemoCount(); // 메모 개수 업데이트
          if (calendarMode === 'month') {
            showMonthView();
          } else if (calendarMode === 'week') {
            showWeekView();
          } else if (calendarMode === 'today') {
            showTodayView();
          }
        }
      }
    });
  }
}

// 커스텀 모달 함수
function showCustomModal({ title, message, showInput = false, inputType = "text", inputPlaceholder = "", confirmText = "확인", cancelText = "취소", onConfirm }) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 16px;
    width: 400px;
    max-width: 90%;
  `;

  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  titleElement.style.cssText = `
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #333;
  `;

  const messageElement = document.createElement('div');
  messageElement.innerHTML = message;
  messageElement.style.cssText = `
    margin-bottom: 20px;
    color: #666;
  `;

  modalContent.appendChild(titleElement);
  modalContent.appendChild(messageElement);

  let inputElement;
  if (showInput) {
    inputElement = document.createElement('input');
    inputElement.type = inputType;
    inputElement.placeholder = inputPlaceholder;
    inputElement.style.cssText = `
      width: 100%;
      padding: 8px;
      margin-bottom: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-sizing: border-box;
    `;
    modalContent.appendChild(inputElement);
  }

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  `;

  const confirmButton = document.createElement('button');
  confirmButton.textContent = confirmText;
  confirmButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: #ffe08a;
    color: #333;
    cursor: pointer;
  `;
  confirmButton.onclick = () => {
    if (onConfirm) {
      onConfirm(inputElement ? inputElement.value : null);
    }
    document.body.removeChild(modal);
  };

  const cancelButton = document.createElement('button');
  cancelButton.textContent = cancelText;
  cancelButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: #ff9f9f;
    color: #333;
    cursor: pointer;
  `;
  cancelButton.onclick = () => {
    document.body.removeChild(modal);
  };

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(confirmButton);
  modalContent.appendChild(buttonContainer);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  if (inputElement) {
    inputElement.focus();
  }

  return { modal, input: inputElement };
}

// 이벤트 리스너
document.addEventListener("DOMContentLoaded", () => {
  // 캘린더 버튼 이벤트 리스너
  document.querySelector(".calendar-btn:nth-child(1)").addEventListener("click", () => {
    currentDate = new Date();
    showMonthView();
  });

  document.querySelector(".calendar-btn:nth-child(2)").addEventListener("click", () => {
    currentDate = new Date();
    showWeekView();
  });

  document.querySelector(".calendar-btn:nth-child(3)").addEventListener("click", () => {
    currentDate = new Date();
    showTodayView();
  });

  // 캘린더 아이콘 클릭 시 초기화
  const calendarIcon = document.getElementById("calendar-icon");
  if (calendarIcon) {
    calendarIcon.addEventListener("click", () => {
      setTimeout(initializeCalendar, 0);
    });
  }

  // 초기 달력 표시
  initializeCalendar();
}); 

window.loadFriendCalendar = async function(friendUid) {
  currentDate = new Date(); // 친구 달력 진입 시 현재 날짜로 초기화
  isFriendCalendarMode = true;
  todos = await getCalendarNotesFromFirebase(friendUid);
  if (calendarMode === "month") showMonthView();
  else if (calendarMode === "week") showWeekView();
  else showTodayView();
}; 

window.initializeCalendar = async function() {
  isFriendCalendarMode = false;
  await initializeCalendar();
};

function getCalendarTitleElement() {
  return isFriendCalendarMode
    ? document.getElementById("friend-calendar-title")
    : document.getElementById("calendar-title");
}
function getCalendarGridElement() {
  return isFriendCalendarMode
    ? document.getElementById("friend-calendar-grid")
    : document.getElementById("calendar-grid");
} 

window.goPrev = goPrev;
window.goNext = goNext;
window.showMonthView = showMonthView;
window.showWeekView = showWeekView;
window.showTodayView = showTodayView; 