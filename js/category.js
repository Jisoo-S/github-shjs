function handleCategoryChange() {
  const selectedCategory = document.getElementById("category-edit-select").value.trim();
  const resultArea = document.getElementById("category-todo-result");
  const allTodos = document.querySelectorAll("#todo-list li");
 
  resultArea.innerHTML = "";

  const sortedTodos = Array.from(allTodos).sort((a, b) => {
    const pinnedA = a.dataset.pinned === "true";
    const pinnedB = b.dataset.pinned === "true";
    if (pinnedA !== pinnedB) return pinnedB - pinnedA;

    const dateA = a.dataset.date || "";
    const dateB = b.dataset.date || "";
    return dateA.localeCompare(dateB);
  });

  sortedTodos.forEach(originalLi => {
    const liCategory = (originalLi.dataset.category || "").trim();
    if (selectedCategory && liCategory === selectedCategory) {
      const clone = originalLi.cloneNode(true);
      clone.classList.add("todo-item");

      const checkbox = clone.querySelector("input[type='checkbox']");
      const originalCheckbox = originalLi.querySelector("input[type='checkbox']");
      checkbox.checked = originalCheckbox.checked;
      checkbox.addEventListener("change", () => {
        originalCheckbox.checked = checkbox.checked;
        originalCheckbox.dispatchEvent(new Event("change"));
      });

      const editBtn = clone.querySelector(".edit-btn");
      const deleteBtn = clone.querySelector(".delete-btn");
      const pinBtn = clone.querySelector(".pin-btn");
      const left = clone.querySelector(".todo-left");

      deleteBtn.addEventListener("click", () => {
        originalLi.remove();
        handleCategoryChange();
      });

      pinBtn.addEventListener("click", () => {
        const isPinned = originalLi.dataset.pinned === "true";
        originalLi.dataset.pinned = isPinned ? "false" : "true";
        
        const originalPinBtn = originalLi.querySelector(".pin-btn");
        if (originalPinBtn) {
          setPinButtonStyle(originalPinBtn, !isPinned);
        }

        setPinButtonStyle(pinBtn, !isPinned);

        handleCategoryChange();
      });

      editBtn.addEventListener("click", () => {
        const span = left.querySelector("span");
        const oldText = span.textContent;
        const oldDate = originalLi.dataset.date;
        const oldCategory = originalLi.dataset.category || "";

        const input = document.createElement("input");
        input.type = "text";
        input.value = oldText;
        
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.value = oldDate;

        const categorySelect = document.createElement("select");

        input.type = "text";
        input.value = oldText;
        input.style.fontSize = "14px";
        input.style.padding = "8px";
        input.style.borderRadius = "10px";
        input.style.border = "1px solid #ccc";
        input.style.width = "200px";
        input.style.marginRight = "10px";

        dateInput.type = "date";
        dateInput.value = oldDate;
        dateInput.style.fontSize = "14px";
        dateInput.style.padding = "8px";
        dateInput.style.borderRadius = "10px";
        dateInput.style.border = "1px solid #ccc";
        dateInput.style.marginRight = "10px";

        categorySelect.style.fontSize = "14px";
        categorySelect.style.padding = "8px";
        categorySelect.style.borderRadius = "10px";
        categorySelect.style.border = "1px solid #ccc";

        Array.from(document.getElementById("todo-category").options).forEach(opt => {
          const option = new Option(opt.textContent, opt.value);
          if (opt.value === oldCategory) option.selected = true;
          categorySelect.appendChild(option);
        });

        left.innerHTML = "";
        left.appendChild(checkbox);
        left.appendChild(input);
        left.appendChild(dateInput);
        left.appendChild(categorySelect);

        editBtn.textContent = "💾";

        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            editBtn.click();
          }
        });
        
        editBtn.onclick = () => {
          const updatedTitle = input.value.trim();
          const updatedDate = dateInput.value || oldDate;
          const updatedCategory = categorySelect.value || "";

          if (!updatedTitle) return;

          const newLeft = document.createElement("div");
          newLeft.className = "todo-left";

          const newCheckbox = originalLi.querySelector("input[type='checkbox']");
          newLeft.appendChild(newCheckbox);

          const titleSpan = document.createElement("span");
          titleSpan.textContent = updatedTitle;
          newLeft.appendChild(titleSpan);

          const dateSpan = document.createElement("span");
          dateSpan.textContent = `📅 ${updatedDate}`;
          dateSpan.style.fontSize = "12px";
          dateSpan.style.marginLeft = "10px";
          dateSpan.style.opacity = "0.6";
          newLeft.appendChild(dateSpan);

          if (updatedCategory) {
            const categorySpan = document.createElement("span");
            categorySpan.textContent = updatedCategory;
            categorySpan.style.fontSize = "12px";
            categorySpan.style.marginLeft = "10px";
            categorySpan.style.opacity = "0.8";
            categorySpan.style.backgroundColor = "#eee";
            categorySpan.style.padding = "2px 6px";
            categorySpan.style.borderRadius = "8px";
            newLeft.appendChild(categorySpan);
          }

          originalLi.dataset.date = updatedDate;
          originalLi.dataset.category = updatedCategory;

          originalLi.replaceChild(newLeft, originalLi.querySelector(".todo-left"));

          const originalLeft = originalLi.querySelector(".todo-left");
          const originalSpan = originalLeft.querySelector("span");
          const originalCheckbox = originalLeft.querySelector("input[type='checkbox']");
          const originalButtonGroup = originalLi.querySelector(".button-group");
          const originalEditBtn = originalButtonGroup.querySelector(".edit-btn");

          originalEditBtn.replaceWith(originalEditBtn.cloneNode(true));
          const refreshedEditBtn = originalButtonGroup.querySelector(".edit-btn");
          refreshedEditBtn.textContent = "✏️";
          refreshedEditBtn.addEventListener("click", () => {
            editTodo(originalLi, originalLeft, originalSpan, originalCheckbox, updatedDate, originalButtonGroup);
          });

          handleCategoryChange();
        };
      });

      resultArea.appendChild(clone);
    }
  });

  document.querySelector(".main").style.display = "none";
  document.getElementById("calendar-view").style.display = "none";
  document.getElementById("category-view").style.display = "block";
}

// 카테고리 관련 이벤트 리스너
document.addEventListener("DOMContentLoaded", () => {
  const categoryFilterSelect = document.getElementById("category-edit-select");
  if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener("change", handleCategoryChange);
  }
});

const categorySelect = document.getElementById("todo-category");
const editSelect = document.getElementById("category-edit-select");
const addCategoryBtn = document.getElementById("add-category-btn");

addCategoryBtn.addEventListener("click", () => {
  showModal("추가할 카테고리 이름을 입력하세요", true, (value) => {
    if (!value) return;

    const fullCategory = value;
    const exists = [...categorySelect.options].some(opt => opt.value === fullCategory);
    if (exists) {
      setTimeout(() => {
        showModal("이미 존재하는 카테고리입니다.", false, () => {});
      }, 0);
      return;
    }

    const option1 = new Option(fullCategory, fullCategory);
    const option2 = new Option(fullCategory, fullCategory);
    categorySelect.add(option1);
    editSelect.add(option2);
  });
});

const deleteCategoryBtn = document.getElementById("delete-category-btn");

deleteCategoryBtn.addEventListener("click", () => {
  const selected = editSelect.value;
  if (!selected) {
    showModal("삭제할 카테고리를 선택하세요.", false, () => {});
    return;
  }

  showModal(`'${selected}'<br> 카테고리를 정말 삭제할까요?`, false, (confirm) => {
    if (!confirm) return;

    [...editSelect.options].forEach((opt, i) => {
      if (opt.value === selected) editSelect.remove(i);
    });
    [...categorySelect.options].forEach((opt, i) => {
      if (opt.value === selected) categorySelect.remove(i);
    });

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

    showModal(`'${selected}'<br>카테고리가 삭제되었습니다.`, false, () => {});
  });
}); 