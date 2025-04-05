function addTodo() {
    const input = document.getElementById("todo-input");
    const dateInput = document.getElementById("todo-date");
    const categorySelect = document.getElementById("todo-category");
    const value = input.value.trim();
    const dateValue = dateInput.value;
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
  
    if (dateValue) {
      const dateSpan = document.createElement("span");
      dateSpan.textContent = `📅 ${dateValue}`;
      dateSpan.style.fontSize = "12px";
      dateSpan.style.marginLeft = "10px";
      dateSpan.style.opacity = "0.6";
      left.appendChild(dateSpan);
    }
  
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
  
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.style.border = "none";
    deleteBtn.style.background = "none";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.addEventListener("click", () => {
      li.remove();
    });
  
    li.appendChild(left);
    li.appendChild(deleteBtn);
  
    list.appendChild(li);
    input.value = "";
    dateInput.value = "";
    categorySelect.value = "";
  }
  // 기존 addTodo 함수는 그대로 두고...
  
  // input 요소에 keyup 이벤트 추가
  document.getElementById("todo-input").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      addTodo();
    }
  });