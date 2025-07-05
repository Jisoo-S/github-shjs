// Firebase 관련 함수 임포트
import { getCurrentUser, addTodoToFirebase, getTodosFromFirebase, updateTodoInFirebase, deleteTodoFromFirebase } from './firebase.js';

let todos = []; // 할 일 목록을 저장할 배열
let showCompleted = true;

// UI를 업데이트하는 함수
function updateTodoList() {
  renderTodos();
  // 캘린더 뷰 업데이트
  if (typeof showMonthView === 'function') {
    showMonthView();
  }
}

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function addTodo() {
  const input = document.getElementById("todo-input");
  const dateInput = document.getElementById("todo-date");
  const categorySelect = document.getElementById("todo-category");

  const value = input.value.trim();
  const dateValue = dateInput.value || getToday();
  const categoryValue = categorySelect.value;

  if (!value) return;

  const newTodo = {
    text: value,
    date: dateValue,
    category: categoryValue,
    completed: false,
    pinned: false,
    createdAt: new Date().toISOString() // 생성 시간 추가
  };

  try {
    // Firebase에 저장하고 ID를 할당받음
    const user = getCurrentUser();
    if (!user) {
      alert("로그인해야 할 일을 추가할 수 있습니다.");
      return;
    }
    
    // Firestore에서는 addDoc을 사용하면 자동 ID가 생성됩니다.
    const docRef = await addTodoToFirebase(newTodo); // addTodoToFirebase 호출
    todos.push({ id: docRef.id, ...newTodo }); // 할 일 배열에 추가
    updateTodoList(); // UI 업데이트
    input.value = "";
    dateInput.value = "";
    categorySelect.value = "";
  } catch (error) {
    console.error("할 일 추가 실패:", error);
    alert("할 일 추가에 실패했습니다.");
  }
}

async function deleteTodo(id) {
  try {
    await deleteTodoFromFirebase(id);
    todos = todos.filter(todo => todo.id !== id);
    updateTodoList();
  } catch (error) {
    console.error("할 일 삭제 실패:", error);
    alert("할 일 삭제에 실패했습니다.");
  }
}

async function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const updatedCompleted = !todo.completed;
  try {
    await updateTodoInFirebase(id, { completed: updatedCompleted });
    todo.completed = updatedCompleted;
    updateTodoList();
  } catch (error) {
    console.error("할 일 상태 변경 실패:", error);
    alert("할 일 상태 변경에 실패했습니다.");
  }
}

async function togglePin(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const updatedPinned = !todo.pinned;
  try {
    await updateTodoInFirebase(id, { pinned: updatedPinned });
    todo.pinned = updatedPinned;
    updateTodoList();
  } catch (error) {
    console.error("할 일 고정 상태 변경 실패:", error);
    alert("할 일 고정 상태 변경에 실패했습니다.");
  }
}

export async function loadTodoList() {
  try {
    const loadedTodos = await getTodosFromFirebase();
    // createdAt을 기준으로 정렬 (최신 항목이 먼저 오도록)
    todos = loadedTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    updateTodoList();
  } catch (error) {
    console.error("할 일 목록 로드 실패:", error);
    // alert("할 일 목록 로드에 실패했습니다."); // 사용자에게 너무 많은 알림 방지
  }
}

export function clearTodoListUI() {
  const list = document.getElementById("todo-list");
  list.innerHTML = '';
  todos = []; // 로컬 배열도 비움
  console.log("투두리스트 UI 초기화");
}

function renderTodos() {
  const list = document.getElementById("todo-list");
  list.innerHTML = "";

  // 필터링: showCompleted가 false면 완료된 항목 제외
  let itemsToRender = [...todos];
  if (!showCompleted) {
    itemsToRender = itemsToRender.filter(todo => !todo.completed);
  }

  // 완료된 항목은 항상 아래로 정렬
  itemsToRender.sort((a, b) => {
    // 1. 완료 여부(미완료 먼저)
    if (a.completed !== b.completed) {
      return a.completed - b.completed; // false(0) - true(1) → 미완료가 위
    }
    // 2. 고정 여부(핀)
    const pinnedA = a.pinned;
    const pinnedB = b.pinned;
    if (pinnedA !== pinnedB) {
      return pinnedB - pinnedA;
    }
    // 3. 날짜
    const dateA = a.date || "";
    const dateB = b.date || "";
    return dateA.localeCompare(dateB);
  });

  itemsToRender.forEach(todo => {
    const li = document.createElement("li");
    li.dataset.category = todo.category;
    li.dataset.date = todo.date;
    li.dataset.pinned = todo.pinned;

    const left = document.createElement("div");
    left.className = "todo-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
      toggleTodo(todo.id);
    });

    const pinBtn = document.createElement("button");
    pinBtn.textContent = "📌";
    pinBtn.classList.add("pin-btn");
    setPinButtonStyle(pinBtn, todo.pinned);

    pinBtn.addEventListener("click", () => {
      togglePin(todo.id);
    });

    const span = document.createElement("span");
    span.textContent = todo.text;
    left.appendChild(checkbox);
    left.appendChild(span);

    const dateSpan = document.createElement("span");
    dateSpan.textContent = `📅 ${todo.date}`;
    dateSpan.style.fontSize = "12px";
    dateSpan.style.marginLeft = "10px";
    dateSpan.style.opacity = "0.6";
    left.appendChild(dateSpan);

    if (todo.category) {
      const categorySpan = document.createElement("span");
      categorySpan.textContent = todo.category;
      categorySpan.style.fontSize = "12px";
      categorySpan.style.marginLeft = "10px";
      categorySpan.style.opacity = "0.8";
      categorySpan.style.backgroundColor = "#eee";
      categorySpan.style.padding = "2px 6px";
      categorySpan.style.borderRadius = "8px";
      left.appendChild(categorySpan);
    }

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("edit-btn");
    editBtn.style.border = "none";
    editBtn.style.background = "none";
    editBtn.style.cursor = "pointer";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.style.border = "none";
    deleteBtn.style.background = "none";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.addEventListener("click", () => {
      deleteTodo(todo.id);
      // 달력 뷰가 표시 중이면 즉시 업데이트
      if (document.getElementById("calendar-view").style.display === "block") {
        updateCalendarCell(new Date(todo.date));
      }
    });

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "button-group";
    buttonGroup.appendChild(pinBtn);
    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(deleteBtn);

    editBtn.addEventListener("click", () => {
      editTodo(li, left, span, checkbox, todo.date, todo.category, buttonGroup, todo.id);
    });

    li.appendChild(left);
    li.appendChild(buttonGroup);
    list.appendChild(li);

    if (todo.completed) {
      li.classList.add("completed");
    }
  });

  // 달력 뷰가 표시 중이면 달력 업데이트
  if (document.getElementById("calendar-view").style.display === "block") {
    if (typeof calendarMode !== 'undefined' && calendarMode === "month") {
      showMonthView();
    } else if (typeof calendarMode !== 'undefined' && calendarMode === "week") {
      showWeekView();
    } else if (typeof calendarMode !== 'undefined' && calendarMode === "today") {
      showTodayView();
    }
  }
}

function setPinButtonStyle(btn, isPinned) {
  btn.style.border = "none";
  btn.style.background = isPinned ? "#ffe08a" : "transparent";
  btn.style.cursor = "pointer";
  btn.style.borderRadius = "8px";
  btn.style.padding = "2px 4px";
  btn.style.opacity = isPinned ? "1" : "0.5";
  btn.style.width = "28px";
  btn.style.height = "28px";
  btn.style.lineHeight = "24px";
}

function editTodo(li, left, span, checkbox, oldDate, oldCategory, buttonGroup, todoId) {
  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.value = span.textContent;
  newInput.style.fontSize = "14px";
  newInput.style.padding = "8px";
  newInput.style.borderRadius = "10px";
  newInput.style.border = "1px solid #ccc";
  newInput.style.width = "200px";
  newInput.style.marginRight = "10px";

  const newDateInput = document.createElement("input");
  newDateInput.type = "date";
  newDateInput.value = oldDate;
  newDateInput.style.fontSize = "14px";
  newDateInput.style.padding = "8px";
  newDateInput.style.borderRadius = "10px";
  newDateInput.style.border = "1px solid #ccc";

  const newCategorySelect = document.createElement("select");
  newCategorySelect.style.fontSize = "14px";
  newCategorySelect.style.padding = "8px";
  newCategorySelect.style.borderRadius = "10px";
  newCategorySelect.style.border = "1px solid #ccc";

  Array.from(document.getElementById("todo-category").options).forEach(opt => {
    const option = new Option(opt.textContent, opt.value);
    if (opt.value === oldCategory) option.selected = true;
    newCategorySelect.appendChild(option);
  });

  const editBtn = buttonGroup.querySelector(".edit-btn");
  const originalText = editBtn.textContent;
  const cloned = editBtn.cloneNode(true);
  buttonGroup.replaceChild(cloned, editBtn);
  cloned.textContent = "💾";

  left.innerHTML = "";
  left.appendChild(checkbox);
  left.appendChild(newInput);
  left.appendChild(newDateInput);
  left.appendChild(newCategorySelect);

  cloned.addEventListener("click", async () => {
    const updatedTitle = newInput.value.trim();
    const selectedDate = newDateInput.value || oldDate;
    const selectedCategory = newCategorySelect.value || "";

    try {
      await updateTodoInFirebase(todoId, { text: updatedTitle, date: selectedDate, category: selectedCategory });
      const todoIndex = todos.findIndex(t => t.id === todoId);
      if (todoIndex > -1) {
        todos[todoIndex].text = updatedTitle;
        todos[todoIndex].date = selectedDate;
        todos[todoIndex].category = selectedCategory;
      }
      updateTodoList(); // UI 전체 새로고침

      // 달력 뷰가 표시 중이면 즉시 업데이트
      if (document.getElementById("calendar-view").style.display === "block") {
        updateCalendarCell(new Date(oldDate));
        if (oldDate !== selectedDate) {
          updateCalendarCell(new Date(selectedDate));
        }
      }
    } catch (error) {
      console.error("할 일 수정 실패:", error);
      alert("할 일 수정에 실패했습니다.");
    }
  });
}

// 엔터 키로 할 일 추가
document.getElementById("todo-input").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    addTodo();
  }
});

// 외부에서 호출할 수 있도록 전역으로 노출
window.addTodo = addTodo;
window.loadTodoList = loadTodoList;
window.clearTodoListUI = clearTodoListUI;
window.setPinButtonStyle = setPinButtonStyle;
window.editTodo = editTodo;

document.addEventListener("DOMContentLoaded", () => {
  // 모바일 햄버거 메뉴 토글
  const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
  const sidebar = document.querySelector(".sidebar");
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar--mobile-open");
    });
    // 사이드바 바깥 클릭 시 닫기
    document.addEventListener("click", (e) => {
      if (
        sidebar.classList.contains("sidebar--mobile-open") &&
        !sidebar.contains(e.target) &&
        e.target !== sidebarToggleBtn
      ) {
        sidebar.classList.remove("sidebar--mobile-open");
      }
    });
  }

  const showBtn = document.getElementById('toggle-show');
  const hideBtn = document.getElementById('toggle-hide');
  if (showBtn && hideBtn) {
    showBtn.onclick = () => {
      showCompleted = true;
      updateTodoList();
    };
    hideBtn.onclick = () => {
      showCompleted = false;
      updateTodoList();
    };
  }
}); 