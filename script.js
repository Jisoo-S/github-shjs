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
  
    const left = document.createElement("div");
    left.className = "todo-left";
  
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
      li.classList.toggle("completed");
    });
  
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
  
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾";
    saveBtn.style.border = "none";
    saveBtn.style.background = "none";
    saveBtn.style.cursor = "pointer";
  
    left.innerHTML = "";
    left.appendChild(checkbox);
    left.appendChild(newInput);
    left.appendChild(newDateInput);
    left.appendChild(newCategorySelect);
  
    buttonGroup.replaceChild(saveBtn, buttonGroup.querySelector("button"));
  
    saveBtn.addEventListener("click", () => {
      const updatedTitle = newInput.value.trim();
      const selectedDate = newDateInput.value || oldDate;
      const selectedCategory = newCategorySelect.value || "";
  
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
  
      const newEditBtn = document.createElement("button");
      newEditBtn.textContent = "✏️";
      newEditBtn.style.border = "none";
      newEditBtn.style.background = "none";
      newEditBtn.style.cursor = "pointer";
  
      newEditBtn.addEventListener("click", () => {
        editTodo(li, left, updatedSpan, checkbox, selectedDate, buttonGroup);
      });
  
      buttonGroup.replaceChild(newEditBtn, saveBtn);
    });
  }
  
  // 엔터 키로 할 일 추가
  document.getElementById("todo-input").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      addTodo();
    }
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