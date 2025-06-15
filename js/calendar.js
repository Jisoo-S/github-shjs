let currentDate = new Date();
let calendarMode = "month";

// 캘린더 뷰 초기화 함수
function initializeCalendar() {
  showMonthView();
}

function showMonthView() {
  calendarMode = "month";

  const now = new Date(currentDate);
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'long' });

  document.getElementById("calendar-title").textContent = monthName.toUpperCase();

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();

  const grid = document.getElementById("calendar-grid");
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

  document.getElementById("calendar-title").textContent = label;

  const grid = document.getElementById("calendar-grid");
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
  document.getElementById("calendar-title").textContent = dateStr;

  const grid = document.getElementById("calendar-grid");
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

function createCalendarCell(date) {
  const cell = document.createElement("div");
  cell.className = "calendar-cell";
  cell.style.position = "relative";
  cell.style.cursor = "pointer";
  cell.style.userSelect = "none";
  
  const formattedDate = date.toISOString().split('T')[0];
  cell.dataset.date = formattedDate;
  
  cell.textContent = date.getDate();
  
  const memo = getMemo(formattedDate);
  if (memo.length > 0) {
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
  
  cell.addEventListener('click', () => {
    showMemoModal(date);
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
  const memos = JSON.parse(localStorage.getItem('calendar_memos') || '{}');
  if (!memos[date]) {
    memos[date] = [];
  }
  if (memo) {
    memos[date].push({
      id: Date.now(),
      text: memo,
      date: new Date().toISOString()
    });
  }
  localStorage.setItem('calendar_memos', JSON.stringify(memos));
}

function getMemo(date) {
  const memos = JSON.parse(localStorage.getItem('calendar_memos') || '{}');
  return memos[date] || [];
}

function deleteMemo(date, memoId) {
  const memos = JSON.parse(localStorage.getItem('calendar_memos') || '{}');
  if (memos[date]) {
    memos[date] = memos[date].filter(memo => memo.id !== memoId);
    if (memos[date].length === 0) {
      delete memos[date];
    }
    localStorage.setItem('calendar_memos', JSON.stringify(memos));
  }
}

function showMemoModal(date) {
  const formattedDate = date.toISOString().split('T')[0];
  const memos = getMemo(formattedDate);
  
  const modal = showCustomModal({
    title: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`,
    message: `<div style="font-size: 12px; color: #666; margin-bottom: 15px;">메모 ${memos.length}개</div>`,
    showInput: true,
    inputType: "text",
    inputPlaceholder: "새로운 메모를 입력하세요...",
    confirmText: "저장",
    cancelText: "닫기",
    onConfirm: (value) => {
      if (value && value.trim()) {
        saveMemo(formattedDate, value.trim());
        updateCalendarCell(date);
      }
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

  memos.forEach(memo => {
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
      memoItem.remove();
      updateCalendarCell(date);
    };

    memoItem.appendChild(memoText);
    memoItem.appendChild(deleteBtn);
    memoList.appendChild(memoItem);
  });

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
    } else if (button.textContent === '닫기') {
      button.style.backgroundColor = '#ff9f9f';
      button.style.color = '#333';
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
  }
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