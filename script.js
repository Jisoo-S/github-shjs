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
    });
    


    const pinBtn = document.createElement("button");
    pinBtn.textContent = "📌";
    pinBtn.style.border = "none";
    pinBtn.style.background = "none";
    pinBtn.style.cursor = "pointer";

    // 초기 핀 상태 
    li.dataset.pinned = "false";

    // 핀 클릭 이벤트
    pinBtn.addEventListener("click", () => {
      const isPinned = li.dataset.pinned === "true";
      li.dataset.pinned = isPinned ? "false" : "true";
    
      // 버튼에 강조 효과 주기
      pinBtn.style.opacity = isPinned ? "0.5" : "1";
      pinBtn.style.backgroundColor = isPinned ? "transparent" : "#ffe08a";
      pinBtn.style.borderRadius = "8px";
      pinBtn.style.padding = "2px 4px";

      pinBtn.classList.toggle("pin-active", !isPinned);
      pinBtn.classList.toggle("pin-inactive", isPinned);
    
      renderList();
    });


    // ✅ 처음부터 스타일 설정
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
    editBtn.style.border = "none";
    editBtn.style.background = "none";
    editBtn.style.cursor = "pointer";
  
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.style.border = "none";
    deleteBtn.style.background = "none";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.addEventListener("click", () => {
      li.remove();
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
  }

  function renderList() {
    const list = document.getElementById("todo-list");
    const items = Array.from(list.children);
  
    items.sort((a, b) => {
      const pinnedA = a.dataset.pinned === "true";
      const pinnedB = b.dataset.pinned === "true";
  
      if (pinnedA !== pinnedB) {
        // 📌 고정 항목 먼저
        return pinnedB - pinnedA;
      }
  
      // 날짜 오름차순 정렬
      const dateA = a.dataset.date || "";
      const dateB = b.dataset.date || "";
      return dateA.localeCompare(dateB);
    });
  
    // 정렬된 항목 다시 list에 붙이기
    items.forEach(item => list.appendChild(item));
  }
  
  function editTodo(li, left, span, checkbox, oldDate, buttonGroup) {
    const currentCategorySpan = Array.from(left.children).find(child =>
      child.textContent && (child.textContent.includes("Study") || child.textContent.includes("Travel") || child.textContent.includes("Shopping") || child.textContent.includes("Work"))
    );
    const oldCategory = currentCategorySpan ? currentCategorySpan.textContent : "";
  
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
  
    const categories = ["", "📚 Study", "🧳 Travel", "🛒 Shopping", "💼 Work"];
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat || "Category";
      if (cat === oldCategory) option.selected = true;
      newCategorySelect.appendChild(option);
    });
  
    // 📌 버튼 유지 + 저장 시 덮어쓰기 위해 기존 ✏️ 버튼을 찾음
    const editBtn = buttonGroup.querySelector("button:nth-child(2)"); // 📌(1), ✏️(2), 🗑️(3)
    const originalText = editBtn.textContent;
  
    // 기존 클릭 이벤트 제거 (안전하게)
    const cloned = editBtn.cloneNode(true);
    buttonGroup.replaceChild(cloned, editBtn);
  
    // 버튼 텍스트 변경
    cloned.textContent = "💾";
  
    // left에 수정창 붙이기
    left.innerHTML = "";
    left.appendChild(checkbox);
    left.appendChild(newInput);
    left.appendChild(newDateInput);
    left.appendChild(newCategorySelect);
  
    // 저장 핸들러 등록
    cloned.addEventListener("click", () => {
      const updatedTitle = newInput.value.trim();
      const selectedDate = newDateInput.value || oldDate;
      const selectedCategory = newCategorySelect.value || "";
  
      li.dataset.date = selectedDate;
  
      const updatedSpan = document.createElement("span");
      updatedSpan.textContent = updatedTitle;
  
      const updatedDateSpan = document.createElement("span");
      updatedDateSpan.textContent = `📅 ${selectedDate}`;
      updatedDateSpan.style.fontSize = "12px";
      updatedDateSpan.style.marginLeft = "10px";
      updatedDateSpan.style.opacity = "0.6";
  
      left.innerHTML = "";
      left.appendChild(checkbox);
      left.appendChild(updatedSpan);
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
  
      // 🔁 버튼 다시 ✏️로 되돌리고 edit 기능 복구
      cloned.textContent = originalText;
      const newSpan = updatedSpan;
      cloned.replaceWith(cloned.cloneNode(true)); // clean again
  
      const restoredBtn = buttonGroup.querySelector("button:nth-child(2)");
      restoredBtn.textContent = "✏️";
      restoredBtn.addEventListener("click", () => {
        editTodo(li, left, newSpan, checkbox, selectedDate, buttonGroup);
      });
  
      renderList();
    });
  }  
  
  
  // 엔터 키로 할 일 추가
  document.getElementById("todo-input").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      addTodo();
    }
  });  

  const categoryFilterSelect = document.getElementById("category-edit-select");

    categoryFilterSelect.addEventListener("change", () => {
      const selectedCategory = categoryFilterSelect.value;
      const allTodos = document.querySelectorAll("#todo-list li");

      allTodos.forEach(li => {
        const todoCategory = li.dataset.category || "";
        if (!selectedCategory || todoCategory === selectedCategory) {
          li.style.display = "flex"; // 보여줌
        } else {
          li.style.display = "none"; // 숨김
      }
    });
  });

  // 사이드바 아이콘 클릭 이벤트 연결
  const icons = document.querySelectorAll(".sidebar .icon");

// ⭐ 아이콘 (To-do 화면 전환)
  icons[0].addEventListener("click", () => {
    document.querySelector(".main").style.display = "block";               // To-do 보이기
    document.getElementById("calendar-view").style.display = "none";      // 캘린더 숨기기
    const calendarSection = document.querySelector(".calendar-section");
    if (calendarSection) calendarSection.style.display = "none";          // 다른 캘린더 섹션도 숨기기
  });

// 📅 아이콘 (캘린더 화면 전환)
  icons[1].addEventListener("click", () => {
    document.querySelector(".main").style.display = "none";               // To-do 숨기기
    document.getElementById("calendar-view").style.display = "block";     // 캘린더 보이기
    const calendarSection = document.querySelector(".calendar-section");
    if (calendarSection) calendarSection.style.display = "none";          // 다른 캘린더 섹션도 숨기기
  });

  let showCompleted = true;

  document.getElementById("toggle-completed").addEventListener("click", () => {
    const todos = document.querySelectorAll("#todo-list li.completed");

    showCompleted = !showCompleted;

    todos.forEach(li => {
      li.style.display = showCompleted ? "flex" : "none";
    });

    // 버튼 텍스트도 바꿔주면 더 UX 좋아짐!
    const btn = document.getElementById("toggle-completed");
    btn.textContent = showCompleted ? "📌 Hide" : "📌 Show All";
  });

  window.addEventListener("DOMContentLoaded", () => {
    const categoryFilterSelect = document.getElementById("category-edit-select");
  
    if (categoryFilterSelect) {
      categoryFilterSelect.addEventListener("change", () => {
        const selectedCategory = categoryFilterSelect.value;
        const allTodos = document.querySelectorAll("#todo-list li");
  
        allTodos.forEach(li => {
          const todoCategory = li.dataset.category || "";
          if (!selectedCategory || todoCategory === selectedCategory) {
            li.style.display = "flex";
          } else {
            li.style.display = "none";
          }
        });
      });
    }
  });
  
