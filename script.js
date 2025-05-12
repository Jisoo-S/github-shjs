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
    pinBtn.classList.add("pin-btn");
    setPinButtonStyle(pinBtn, false);

    // 핀 클릭 이벤트
    pinBtn.addEventListener("click", () => {
      const isPinned = li.dataset.pinned === "true";
      li.dataset.pinned = isPinned ? "false" : "true";
    
      setPinButtonStyle(pinBtn, !isPinned); // 스타일 재적용
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
    const currentCategorySpan = Array.from(left.children).find(child =>
      child.textContent && (child.textContent.includes("Study") || child.textContent.includes("Travel") || child.textContent.includes("Shopping") || child.textContent.includes("Work"))
    );

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
    document.querySelectorAll("#todo-list li").forEach(li => {
      li.style.display = "flex";
    });

    document.querySelector(".main").style.display = "block";               // To-do 보이기
    document.getElementById("calendar-view").style.display = "none";      // 캘린더 숨기기
    document.getElementById("category-view").style.display = "none";
    document.getElementById("friends-view").style.display = "none";

  });

// 📅 아이콘 (캘린더 화면 전환)
  icons[1].addEventListener("click", () => {
    document.querySelector(".main").style.display = "none";               // To-do 숨기기
    document.getElementById("calendar-view").style.display = "block";     // 캘린더 보이기
    const calendarSection = document.querySelector(".calendar-section");
    if (calendarSection) calendarSection.style.display = "none";          // 다른 캘린더 섹션도 숨기기
  });

  let showCompleted = true;

  categoryIcon.addEventListener("click", () => {
    todoMain.style.display = "none";
    calendarView.style.display = "none";
    categoryView.style.display = "block";
    friendsView.style.display = "none";
  
    const selectedCategory = document.getElementById("category-edit-select").value;
    if (selectedCategory) {
      handleCategoryChange(); // 선택된 항목 다시 보여줌
    } else {
      document.getElementById("category-todo-result").innerHTML = ""; // 선택 안 됐으면 초기화
    }
  });
  

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

  // 이벤트 바인딩만 DOMContentLoaded 안에
  window.addEventListener("DOMContentLoaded", () => {
    const categoryFilterSelect = document.getElementById("category-edit-select");
    if (categoryFilterSelect) {
      categoryFilterSelect.addEventListener("change", handleCategoryChange);
    }
  });


  document.getElementById("category-edit-select").addEventListener("change", () => {
    const selectedCategory = document.getElementById("category-edit-select").value;
    const resultArea = document.getElementById("category-todo-result");
    const allTodos = document.querySelectorAll("#todo-list li");
  
    resultArea.innerHTML = "";
  
    allTodos.forEach(li => {
      const todoCategory = li.dataset.category || "";
      if (selectedCategory && todoCategory === selectedCategory) {
        const clone = li.cloneNode(true);
        clone.style.marginBottom = "10px";
  
        // ✅ 체크박스 동기화
        const cloneCheckbox = clone.querySelector("input[type='checkbox']");
        const originCheckbox = li.querySelector("input[type='checkbox']");
        if (cloneCheckbox && originCheckbox) {
          cloneCheckbox.checked = originCheckbox.checked;
          cloneCheckbox.addEventListener("change", () => {
            originCheckbox.checked = cloneCheckbox.checked;
            originCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
          });
        }
  
        // ✅ 버튼 연결 (클릭 시 원본 버튼 강제 클릭)
        const clonedButtons = clone.querySelectorAll("button");
        const originalButtons = li.querySelectorAll("button");
  
        clonedButtons.forEach((btn, i) => {
          const label = btn.textContent.trim(); // 📌 ✏️ 🗑️
  
          btn.addEventListener("click", () => {
            const matchingButton = Array.from(originalButtons).find(b => b.textContent.trim() === label);
            if (matchingButton) {
              matchingButton.click();
            } else {
              console.warn(`원본 버튼을 찾을 수 없음: ${label}`);
            }
          });
        });
  
        resultArea.appendChild(clone);
      }
    });
  
    // 뷰 전환
    document.querySelector(".main").style.display = "none";
    document.getElementById("calendar-view").style.display = "none";
    document.getElementById("category-view").style.display = "block";
  });  
  

const categorySelect = document.getElementById("todo-category");
const editSelect = document.getElementById("category-edit-select");
const addCategoryBtn = document.getElementById("add-category-btn");

addCategoryBtn.addEventListener("click", () => {
  const newCategory = prompt("추가할 카테고리 이름을 입력하세요:");
  if (!newCategory) return;


  const fullCategory = newCategory;

  // 중복 방지
  const exists = [...categorySelect.options].some(opt => opt.value === fullCategory);
  if (exists) {
    alert("이미 존재하는 카테고리입니다.");
    return;
  }

  const option1 = new Option(fullCategory, fullCategory);
  const option2 = new Option(fullCategory, fullCategory);

  categorySelect.add(option1);
  editSelect.add(option2);
});

const deleteCategoryBtn = document.getElementById("delete-category-btn");

deleteCategoryBtn.addEventListener("click", () => {
  const selected = editSelect.value;
  if (!selected) {
    alert("삭제할 카테고리를 선택하세요.");
    return;
  }

  if (!confirm(`'${selected}' 카테고리를 정말 삭제할까요?`)) return;

  // select option에서 제거
  [...editSelect.options].forEach((opt, i) => {
    if (opt.value === selected) editSelect.remove(i);
  });
  [...categorySelect.options].forEach((opt, i) => {
    if (opt.value === selected) categorySelect.remove(i);
  });

  // 해당 카테고리의 할 일에서 카테고리 정보 제거
  const allTodos = document.querySelectorAll("#todo-list li");
  allTodos.forEach(li => {
    if (li.dataset.category === selected) {
      li.dataset.category = "";
      const catSpan = [...li.querySelectorAll("span")].find(span =>
        span.textContent === selected
      );
      if (catSpan) catSpan.remove();
    }
  });

  alert(`'${selected}' 카테고리가 삭제되었습니다.`);
});
  
// ✅ 버튼 연동용: pin/edit/delete 버튼에 class 붙이는 부분은 addTodo 안에 이미 있다고 가정

function handleCategoryChange() {
  const selectedCategory = document.getElementById("category-edit-select").value;
  const resultArea = document.getElementById("category-todo-result");
  const allTodos = document.querySelectorAll("#todo-list li");

  resultArea.innerHTML = "";

  allTodos.forEach(li => {
    const todoCategory = li.dataset.category || "";
    if (selectedCategory && todoCategory === selectedCategory) {
      const clone = li.cloneNode(true);
      clone.style.marginBottom = "10px";

      // ✅ 버튼 동기화
      const clonedPinBtn = clone.querySelector(".pin-btn");
      const clonedEditBtn = clone.querySelector(".edit-btn");
      const clonedDeleteBtn = clone.querySelector(".delete-btn");

      const originalPinBtn = li.querySelector(".pin-btn");
      const originalEditBtn = li.querySelector(".edit-btn");
      const originalDeleteBtn = li.querySelector(".delete-btn");

      if (clonedPinBtn && originalPinBtn) {
        clonedPinBtn.addEventListener("click", () => {
          originalPinBtn.click();
          handleCategoryChange(); // 즉시 반영
        });
      }
      if (clonedEditBtn && originalEditBtn) {
        clonedEditBtn.addEventListener("click", () => {
          originalEditBtn.click();
          // 편집 후 handleCategoryChange는 editTodo 안에서 호출되므로 여기선 생략 가능
        });
      }
      if (clonedDeleteBtn && originalDeleteBtn) {
        clonedDeleteBtn.addEventListener("click", () => {
          originalDeleteBtn.click();
          handleCategoryChange(); // 삭제 후 즉시 갱신
        });
      }

      // ✅ 체크박스 동기화
      const cloneCheckbox = clone.querySelector("input[type='checkbox']");
      const originCheckbox = li.querySelector("input[type='checkbox']");
      if (cloneCheckbox && originCheckbox) {
        cloneCheckbox.checked = originCheckbox.checked;
        cloneCheckbox.addEventListener("change", () => {
          originCheckbox.checked = cloneCheckbox.checked;
          originCheckbox.dispatchEvent(new Event("change"));
          handleCategoryChange(); // 체크 상태 변경 반영
        });
      }

      resultArea.appendChild(clone);
    }
  });

  // 뷰 전환
  document.querySelector(".main").style.display = "none";
  document.getElementById("calendar-view").style.display = "none";
  document.getElementById("category-view").style.display = "block";
}