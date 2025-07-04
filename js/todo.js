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
  list.style.display = "block";

  const li = document.createElement("li");
  li.dataset.category = categoryValue;
  li.dataset.date = dateValue;

  const left = document.createElement("div");
  left.className = "todo-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed");
    renderList();
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
  dateSpan.textContent = `${dateValue}`;
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

  // 1. 미완료 먼저, 완료는 나중에
  // 2. 같은 상태 내에서는 날짜 오름차순(미래가 아래)
  items.sort((a, b) => {
    const aCompleted = a.classList.contains("completed");
    const bCompleted = b.classList.contains("completed");
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    // 같은 상태면 날짜 비교
    const aDate = a.dataset.date || "9999-12-31";
    const bDate = b.dataset.date || "9999-12-31";
    return aDate.localeCompare(bDate);
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

  // 모바일 감지
  const isMobile = window.innerWidth <= 600;

  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.value = span.textContent;
  newInput.style.fontSize = "14px";
  newInput.style.padding = "8px";
  newInput.style.borderRadius = "10px";
  newInput.style.border = "1px solid #ccc";
  newInput.style.width = isMobile ? "80px" : "200px";
  newInput.style.marginRight = "4px";

  left.innerHTML = "";
  left.appendChild(checkbox);
  left.appendChild(newInput);

  if (isMobile) {
    // 📅 버튼+input 겹치기 구조
    const dateWrap = document.createElement("div");
    dateWrap.style.position = "relative";
    dateWrap.style.display = "inline-block";
    dateWrap.style.marginRight = "2px";

    const dateBtn = document.createElement("button");
    dateBtn.type = "button";
    dateBtn.textContent = "📅";
    dateBtn.style.fontSize = "18px";
    dateBtn.style.padding = "6px 8px";
    dateBtn.style.borderRadius = "8px";
    dateBtn.style.border = "1px solid #ccc";
    dateBtn.style.background = "#fff";
    dateBtn.style.cursor = "pointer";
    dateBtn.style.position = "relative";
    dateBtn.style.zIndex = "1";

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = oldDate;
    dateInput.style.position = "absolute";
    dateInput.style.left = "0";
    dateInput.style.top = "0";
    dateInput.style.width = "100%";
    dateInput.style.height = "100%";
    dateInput.style.opacity = "0";
    dateInput.style.cursor = "pointer";
    dateInput.style.zIndex = "2";

    dateWrap.appendChild(dateBtn);
    dateWrap.appendChild(dateInput);

    // 📅 버튼 클릭 시 date input 트리거
    dateBtn.addEventListener("click", function(e) {
      e.preventDefault();
      dateInput.focus();
      dateInput.click();
    });

    // ▾ 버튼 (카테고리)
    const categoryBtn = document.createElement("button");
    categoryBtn.type = "button";
    categoryBtn.textContent = "▾";
    categoryBtn.style.fontSize = "18px";
    categoryBtn.style.padding = "6px 8px";
    categoryBtn.style.borderRadius = "8px";
    categoryBtn.style.border = "1px solid #ccc";
    categoryBtn.style.background = "#fff";
    categoryBtn.style.cursor = "pointer";
    categoryBtn.style.marginRight = "2px";
    categoryBtn.dataset.value = oldCategory;

    // 커스텀 드롭다운(ul/li)
    const categoryDropdown = document.createElement("ul");
    categoryDropdown.style.display = "none";
    categoryDropdown.style.position = "fixed";
    categoryDropdown.style.zIndex = "4000";
    categoryDropdown.style.left = "0";
    categoryDropdown.style.top = "40px";
    categoryDropdown.style.background = "#fff";
    categoryDropdown.style.borderRadius = "8px";
    categoryDropdown.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
    categoryDropdown.style.padding = "8px 0";
    categoryDropdown.style.margin = "0";
    categoryDropdown.style.listStyle = "none";
    categoryDropdown.style.minWidth = "120px";
    categoryDropdown.style.fontSize = "16px";
    categoryDropdown.style.border = "1px solid #ccc";
    categoryDropdown.style.maxHeight = "180px";
    categoryDropdown.style.overflowY = "auto";

    Array.from(document.getElementById("todo-category").options).forEach(opt => {
      if (!opt.value) return;
      const liEl = document.createElement("li");
      liEl.textContent = opt.textContent;
      liEl.style.padding = "8px 16px";
      liEl.style.cursor = "pointer";
      if (opt.value === oldCategory) {
        liEl.style.background = "#eee";
        liEl.style.fontWeight = "bold";
      }
      liEl.onclick = () => {
        categoryBtn.textContent = opt.textContent;
        categoryBtn.dataset.value = opt.value;
        categoryDropdown.style.display = "none";
      };
      liEl.onmouseover = () => { liEl.style.background = "#f5f5f5"; };
      liEl.onmouseout = () => { liEl.style.background = opt.value === oldCategory ? "#eee" : "#fff"; };
      categoryDropdown.appendChild(liEl);
    });

    categoryBtn.onclick = () => {
      if (categoryDropdown.style.display === "block") {
        categoryDropdown.style.display = "none";
      } else {
        categoryDropdown.style.display = "block";
        // 버튼 바로 아래에 위치 (window 기준)
        const rect = categoryBtn.getBoundingClientRect();
        categoryDropdown.style.left = rect.left + window.scrollX + "px";
        categoryDropdown.style.top = rect.bottom + 4 + window.scrollY + "px";
      }
    };

    // 저장 버튼만 보이게
    buttonGroup.innerHTML = "";
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾";
    saveBtn.className = "edit-btn";
    saveBtn.style.fontSize = "18px";
    saveBtn.style.padding = "6px 8px";
    saveBtn.style.borderRadius = "8px";
    saveBtn.style.border = "1px solid #ccc";
    saveBtn.style.background = "#fff";
    saveBtn.style.cursor = "pointer";
    buttonGroup.appendChild(saveBtn);

    left.style.position = "relative";
    left.appendChild(dateWrap);
    left.appendChild(categoryBtn);
    left.appendChild(categoryDropdown);

    saveBtn.onclick = () => {
      const updatedTitle = newInput.value.trim();
      const selectedDate = dateInput.value || oldDate;
      const selectedCategory = categoryBtn.dataset.value || oldCategory;
      li.dataset.date = selectedDate;
      li.dataset.category = selectedCategory;
      const newSpan = document.createElement("span");
      newSpan.textContent = updatedTitle;
      const updatedDateSpan = document.createElement("span");
      updatedDateSpan.textContent = selectedDate;
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
      // 버튼 그룹 복원 (핀, 수정, 삭제)
      buttonGroup.innerHTML = "";
      const pinBtn = document.createElement("button");
      pinBtn.textContent = "📌";
      pinBtn.classList.add("pin-btn");
      setPinButtonStyle(pinBtn, li.dataset.pinned === "true");
      pinBtn.addEventListener("click", () => {
        const isPinned = li.dataset.pinned === "true";
        li.dataset.pinned = isPinned ? "false" : "true";
        setPinButtonStyle(pinBtn, !isPinned);
        renderList();
      });
      const editBtn2 = document.createElement("button");
      editBtn2.textContent = "✏️";
      editBtn2.classList.add("edit-btn");
      editBtn2.style.border = "none";
      editBtn2.style.background = "none";
      editBtn2.style.cursor = "pointer";
      editBtn2.addEventListener("click", () => {
        editTodo(li, left, newSpan, checkbox, selectedDate, buttonGroup);
      });
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.style.border = "none";
      deleteBtn.style.background = "none";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.addEventListener("click", () => {
        li.remove();
        saveTodoList();
      });
      buttonGroup.appendChild(pinBtn);
      buttonGroup.appendChild(editBtn2);
      buttonGroup.appendChild(deleteBtn);
      renderList();
      saveTodoList();
      if (document.getElementById("calendar-view").style.display === "block") {
        updateCalendarCell(new Date(oldDate));
        if (oldDate !== selectedDate) {
          updateCalendarCell(new Date(selectedDate));
        }
      }
    };
  } else {
    // PC: 기존 input/date/select UI
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
    left.appendChild(newDateInput);
    left.appendChild(newCategorySelect);
    // 저장 버튼만 보이게
  const editBtn = buttonGroup.querySelector(".edit-btn");
  const originalText = editBtn.textContent;
  const cloned = editBtn.cloneNode(true);
  buttonGroup.replaceChild(cloned, editBtn);
  cloned.textContent = "💾";
    cloned.onclick = () => {
    const updatedTitle = newInput.value.trim();
    const selectedDate = newDateInput.value || oldDate;
    const selectedCategory = newCategorySelect.value || "";
    li.dataset.date = selectedDate;
    li.dataset.category = selectedCategory;
    const newSpan = document.createElement("span");
    newSpan.textContent = updatedTitle;
    const updatedDateSpan = document.createElement("span");
      updatedDateSpan.textContent = selectedDate;
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
      // 버튼 그룹 복원 (핀, 수정, 삭제)
      buttonGroup.innerHTML = "";
      const pinBtn = document.createElement("button");
      pinBtn.textContent = "📌";
      pinBtn.classList.add("pin-btn");
      setPinButtonStyle(pinBtn, li.dataset.pinned === "true");
      pinBtn.addEventListener("click", () => {
        const isPinned = li.dataset.pinned === "true";
        li.dataset.pinned = isPinned ? "false" : "true";
        setPinButtonStyle(pinBtn, !isPinned);
        renderList();
      });
      const editBtn2 = document.createElement("button");
      editBtn2.textContent = "✏️";
      editBtn2.classList.add("edit-btn");
      editBtn2.style.border = "none";
      editBtn2.style.background = "none";
      editBtn2.style.cursor = "pointer";
      editBtn2.addEventListener("click", () => {
      editTodo(li, left, newSpan, checkbox, selectedDate, buttonGroup);
    });
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.style.border = "none";
      deleteBtn.style.background = "none";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.addEventListener("click", () => {
        li.remove();
        saveTodoList();
      });
      buttonGroup.appendChild(pinBtn);
      buttonGroup.appendChild(editBtn2);
      buttonGroup.appendChild(deleteBtn);
    renderList();
  saveTodoList();
  if (document.getElementById("calendar-view").style.display === "block") {
      updateCalendarCell(new Date(oldDate));
      if (oldDate !== selectedDate) {
        updateCalendarCell(new Date(selectedDate));
    }
  }
    };
  }
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
      if (sidebar.classList.contains("sidebar--mobile-open")) {
        document.body.classList.add("sidebar-open");
      } else {
        document.body.classList.remove("sidebar-open");
      }
    });
    // 사이드바 바깥 클릭 시 닫기
    document.addEventListener("click", (e) => {
      if (
        sidebar.classList.contains("sidebar--mobile-open") &&
        !sidebar.contains(e.target) &&
        e.target !== sidebarToggleBtn
      ) {
        sidebar.classList.remove("sidebar--mobile-open");
        document.body.classList.remove("sidebar-open");
      }
    });
  }
  // 📅 버튼: 모바일에서 클릭 시 input을 JS로 트리거
  const mobileDateBtn = document.getElementById("mobile-date-btn");
  const mobileDateInput = document.getElementById("mobile-date-input");
  if (mobileDateBtn && mobileDateInput) {
    mobileDateBtn.addEventListener("click", () => {
      mobileDateInput.focus();
      mobileDateInput.click();
    });
  }
  // PC 환경에서도 input-section의 📅 버튼이 있으면 date input을 트리거하도록 연결
  // (모바일 환경에서만 보이지만, 혹시 여러개 있을 경우 모두 연결)
  document.querySelectorAll("#mobile-date-btn").forEach(btn => {
    const input = document.getElementById("mobile-date-input");
    if (btn && input) {
      btn.onclick = function(e) {
        e.preventDefault();
        input.focus();
        input.click();
      };
    }
  });
  // ▾ 버튼 개선: 클릭 시 select show/hide, 버튼 바로 아래에 위치
  const mobileCategoryBtn = document.querySelector(".input-section #mobile-category-btn");
  const mobileCategorySelect = document.querySelector(".input-section #mobile-category-select");
  if (mobileCategoryBtn && mobileCategorySelect) {
    mobileCategoryBtn.addEventListener("click", () => {
      if (mobileCategorySelect.style.display === "block") {
        mobileCategorySelect.style.display = "none";
      } else {
        mobileCategorySelect.style.display = "block";
        // ▾ 버튼 바로 아래에 위치
        const rect = mobileCategoryBtn.getBoundingClientRect();
        mobileCategorySelect.style.position = "absolute";
        mobileCategorySelect.style.left = rect.left + "px";
        mobileCategorySelect.style.top = rect.bottom + 4 + window.scrollY + "px";
        mobileCategorySelect.focus();
      }
    });
    mobileCategorySelect.addEventListener("change", (e) => {
      document.getElementById("todo-category").value = e.target.value;
      mobileCategorySelect.style.display = "none";
    });
    // select 외부 클릭 시 닫기
    document.addEventListener("click", (e) => {
      if (mobileCategorySelect.style.display === "block" && !mobileCategorySelect.contains(e.target) && e.target !== mobileCategoryBtn) {
        mobileCategorySelect.style.display = "none";
      }
    });
  }
});

const todoList = document.getElementById("todo-list");
const hideBtn = document.getElementById("toggle-hide");
const showBtn = document.getElementById("toggle-show");

// 두 버튼 모두 항상 보이게
hideBtn.style.display = "inline-block";
showBtn.style.display = "inline-block";

hideBtn.addEventListener("click", () => {
  const todoItems = document.querySelectorAll("#todo-list li");
  todoItems.forEach(li => {
    if (li.classList.contains("completed")) {
      li.style.display = "none";
    }
  });
});

showBtn.addEventListener("click", () => {
  const todoItems = document.querySelectorAll("#todo-list li");
  todoItems.forEach(li => {
    if (li.classList.contains("completed")) {
      li.style.display = "";
    }
  });
}); 