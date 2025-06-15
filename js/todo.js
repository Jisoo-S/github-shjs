function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addTodo() {
  const input = document.getElementById("todo-input");
  const dateInput = document.getElementById("todo-date");
  const categorySelect = document.getElementById("todo-category");

  const value = input.value.trim();
  const dateValue = dateInput.value || getToday();
  const categoryValue = categorySelect.value;

  if (!value) return;

  const list = document.getElementById("todo-list");

  const li = document.createElement("li");
  li.dataset.category = categoryValue;
  li.dataset.date = dateValue;

  const left = document.createElement("div");
  left.className = "todo-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed");
    saveTodoList();
  });

  const pinBtn = document.createElement("button");
  pinBtn.textContent = "📌";
  pinBtn.classList.add("pin-btn");
  setPinButtonStyle(pinBtn, false);

  pinBtn.addEventListener("click", () => {
    const isPinned = li.dataset.pinned === "true";
    li.dataset.pinned = isPinned ? "false" : "true";
    setPinButtonStyle(pinBtn, !isPinned);
    renderList();
  });

  const initiallyPinned = li.dataset.pinned === "true";
  pinBtn.classList.add(initiallyPinned ? "pin-active" : "pin-inactive");

  if (li.dataset.pinned === "true") {
    pinBtn.style.opacity = "1";
    pinBtn.style.backgroundColor = "#ffe08a";
    pinBtn.style.borderRadius = "8px";
    pinBtn.style.padding = "2px 4px";
  } else {
    pinBtn.style.opacity = "0.5";
  }

  const span = document.createElement("span");
  span.textContent = value;
  left.appendChild(checkbox);
  left.appendChild(span);

  const dateSpan = document.createElement("span");
  dateSpan.textContent = `📅 ${dateValue}`;
  dateSpan.style.fontSize = "12px";
  dateSpan.style.marginLeft = "10px";
  dateSpan.style.opacity = "0.6";
  left.appendChild(dateSpan);

  if (categoryValue) {
    const categorySpan = document.createElement("span");
    categorySpan.textContent = categoryValue;
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
    const date = li.dataset.date;
    li.remove();
    saveTodoList();
    
    // 달력 뷰가 표시 중이면 즉시 업데이트
    if (document.getElementById("calendar-view").style.display === "block") {
      updateCalendarCell(new Date(date));
    }
  });

  const buttonGroup = document.createElement("div");
  buttonGroup.className = "button-group";
  buttonGroup.appendChild(pinBtn);
  buttonGroup.appendChild(editBtn);
  buttonGroup.appendChild(deleteBtn);

  editBtn.addEventListener("click", () => {
    editTodo(li, left, span, checkbox, dateValue, buttonGroup);
  });

  li.appendChild(left);
  li.appendChild(buttonGroup);
  list.appendChild(li);

  input.value = "";
  dateInput.value = "";
  categorySelect.value = "";

  renderList();
  saveTodoList();

  // 달력 뷰가 표시 중이면 즉시 업데이트
  if (document.getElementById("calendar-view").style.display === "block") {
    updateCalendarCell(new Date(dateValue));
  }
}

function renderList() {
  const list = document.getElementById("todo-list");
  const items = Array.from(list.children);

  items.sort((a, b) => {
    const pinnedA = a.dataset.pinned === "true";
    const pinnedB = b.dataset.pinned === "true";

    if (pinnedA !== pinnedB) {
      return pinnedB - pinnedA;
    }

    const dateA = a.dataset.date || "";
    const dateB = b.dataset.date || "";
    return dateA.localeCompare(dateB);
  });

  items.forEach(item => list.appendChild(item));
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

function editTodo(li, left, span, checkbox, oldDate, buttonGroup) {
  const oldCategory = li.dataset.category || "";

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

  cloned.addEventListener("click", () => {
    const updatedTitle = newInput.value.trim();
    const selectedDate = newDateInput.value || oldDate;
    const selectedCategory = newCategorySelect.value || "";

    li.dataset.date = selectedDate;
    li.dataset.category = selectedCategory;

    const newSpan = document.createElement("span");
    newSpan.textContent = updatedTitle;

    const updatedDateSpan = document.createElement("span");
    updatedDateSpan.textContent = `📅 ${selectedDate}`;
    updatedDateSpan.style.fontSize = "12px";
    updatedDateSpan.style.marginLeft = "10px";
    updatedDateSpan.style.opacity = "0.6";

    left.innerHTML = "";
    left.appendChild(checkbox);
    left.appendChild(newSpan);
    left.appendChild(updatedDateSpan);

    if (selectedCategory) {
      const newCategorySpan = document.createElement("span");
      newCategorySpan.textContent = selectedCategory;
      newCategorySpan.style.fontSize = "12px";
      newCategorySpan.style.marginLeft = "10px";
      newCategorySpan.style.opacity = "0.8";
      newCategorySpan.style.backgroundColor = "#eee";
      newCategorySpan.style.padding = "2px 6px";
      newCategorySpan.style.borderRadius = "8px";
      left.appendChild(newCategorySpan);
    }

    cloned.replaceWith(cloned.cloneNode(true));
    const refreshedEditBtn = buttonGroup.querySelector(".edit-btn");
    refreshedEditBtn.textContent = "✏️";
    refreshedEditBtn.addEventListener("click", () => {
      editTodo(li, left, newSpan, checkbox, selectedDate, buttonGroup);
    });

    renderList(); 

    saveTodoList();

    // 달력 뷰가 표시 중이면 즉시 업데이트
    if (document.getElementById("calendar-view").style.display === "block") {
      updateCalendarCell(new Date(oldDate));
      if (oldDate !== selectedDate) {
        updateCalendarCell(new Date(selectedDate));
      }
    }
  });
}

function saveTodoList() {
  const todoList = document.getElementById("todo-list");
  const todos = Array.from(todoList.children).map(li => ({
    text: li.querySelector(".todo-left span").textContent,
    date: li.dataset.date,
    category: li.dataset.category,
    completed: li.classList.contains("completed"),
    pinned: li.dataset.pinned === "true"
  }));
  localStorage.setItem("todoList", JSON.stringify(todos));
  
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

function loadTodoList() {
  const savedTodos = localStorage.getItem("todoList");
  if (!savedTodos) return;

  const todos = JSON.parse(savedTodos);
  const list = document.getElementById("todo-list");
  list.innerHTML = "";

  todos.forEach(todo => {
    const input = document.getElementById("todo-input");
    const dateInput = document.getElementById("todo-date");
    const categorySelect = document.getElementById("todo-category");

    input.value = todo.text;
    dateInput.value = todo.date;
    categorySelect.value = todo.category;

    addTodo();

    const lastItem = list.lastElementChild;
    if (todo.completed) {
      lastItem.classList.add("completed");
      lastItem.querySelector("input[type='checkbox']").checked = true;
    }
    if (todo.pinned) {
      lastItem.dataset.pinned = "true";
      const pinBtn = lastItem.querySelector(".pin-btn");
      setPinButtonStyle(pinBtn, true);
    }
  });

  renderList();
}

// 엔터 키로 할 일 추가
document.getElementById("todo-input").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    addTodo();
  }
});

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
}); 