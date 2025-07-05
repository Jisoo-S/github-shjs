// showModal 함수 정의 (utils.js가 로드되지 않을 경우를 대비)
function showModal(message, hasInput = false, callback = () => {}) {
  const overlay = document.getElementById("modal-overlay");
  const modal = document.getElementById("custom-modal");
  const messageEl = document.getElementById("modal-message");
  const inputEl = document.getElementById("modal-input");
  const confirmBtn = document.getElementById("modal-confirm");
  const cancelBtn = document.getElementById("modal-cancel");

  messageEl.innerHTML = message;
  overlay.classList.remove("hidden");

  if (hasInput) {
    inputEl.classList.remove("hidden");
    inputEl.value = "";
    inputEl.focus();

    inputEl.onkeydown = (e) => {
      if (e.key === "Enter") {
        confirmBtn.click();
      }
    };
  } else {
    inputEl.classList.add("hidden");
  }

  const close = () => {
    overlay.classList.add("hidden");
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
    inputEl.onkeydown = null;
  };

  confirmBtn.onclick = () => {
    const value = hasInput ? inputEl.value.trim() : true;
    close();
    callback(value);
  };

  cancelBtn.onclick = () => {
    close();
    callback(null);
  };
}

// window에 showModal 등록
window.showModal = showModal;

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
          window.setPinButtonStyle(originalPinBtn, !isPinned);
        }

        window.setPinButtonStyle(pinBtn, !isPinned);

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
        input.style.fontSize = "14px";
        input.style.padding = "8px";
        input.style.borderRadius = "10px";
        input.style.border = "1px solid #ccc";
        input.style.width = "200px";
        input.style.marginRight = "10px";

        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.value = oldDate;
        dateInput.style.fontSize = "14px";
        dateInput.style.padding = "8px";
        dateInput.style.borderRadius = "10px";
        dateInput.style.border = "1px solid #ccc";
        dateInput.style.marginRight = "10px";

        const categorySelect = document.createElement("select");
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
            window.editTodo(originalLi, originalLeft, originalSpan, originalCheckbox, updatedDate, originalButtonGroup);
          });

          refreshedEditBtn.onclick = null;
          refreshedEditBtn.addEventListener("click", () => {
            window.editTodo(originalLi, originalLeft, originalSpan, originalCheckbox, updatedDate, originalButtonGroup);
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

// 모든 이벤트 리스너를 DOMContentLoaded 내부로 이동
document.addEventListener("DOMContentLoaded", () => {
  // 카테고리 필터 이벤트 리스너
  const categoryFilterSelect = document.getElementById("category-edit-select");
  if (categoryFilterSelect) {
    categoryFilterSelect.addEventListener("change", handleCategoryChange);
  }

  // 카테고리 추가 버튼 이벤트 리스너
  const addCategoryBtn = document.getElementById("add-category-btn");
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
      const overlay = document.getElementById("modal-overlay");
      const modal = document.getElementById("custom-modal");
      const messageEl = document.getElementById("modal-message");
      const inputEl = document.getElementById("modal-input");
      const confirmBtn = document.getElementById("modal-confirm");
      const cancelBtn = document.getElementById("modal-cancel");

      messageEl.innerHTML = "추가할 카테고리 이름을 입력하세요";
      overlay.classList.remove("hidden");
      inputEl.classList.remove("hidden");
      inputEl.value = "";
      inputEl.focus();

      const close = () => {
        overlay.classList.add("hidden");
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        inputEl.onkeydown = null;
      };

      inputEl.onkeydown = (e) => {
        if (e.key === "Enter") {
          confirmBtn.click();
        }
      };

      confirmBtn.onclick = () => {
        const value = inputEl.value.trim();
        close();
        
        if (!value) return;

        const categorySelect = document.getElementById("todo-category");
        const editSelect = document.getElementById("category-edit-select");
        const fullCategory = value;
        const exists = [...categorySelect.options].some(opt => opt.value === fullCategory);
        
        if (exists) {
          // 이미 존재하는 카테고리 알림
          messageEl.innerHTML = "이미 존재하는 카테고리입니다.";
          overlay.classList.remove("hidden");
          inputEl.classList.add("hidden");
          
          const closeAlert = () => {
            overlay.classList.add("hidden");
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
          };
          
          confirmBtn.onclick = closeAlert;
          cancelBtn.onclick = closeAlert;
          return;
        }

        const newOption1 = new Option(fullCategory, fullCategory);
        const newOption2 = new Option(fullCategory, fullCategory);
        categorySelect.add(newOption1);
        editSelect.add(newOption2);
      };

      cancelBtn.onclick = () => {
        close();
      };
    });
  }

  // 카테고리 삭제 버튼 이벤트 리스너
  const deleteCategoryBtn = document.getElementById("delete-category-btn");
  if (deleteCategoryBtn) {
    deleteCategoryBtn.addEventListener("click", () => {
      const editSelect = document.getElementById("category-edit-select");
      const selected = editSelect.value;
      if (!selected) {
        const overlay = document.getElementById("modal-overlay");
        const messageEl = document.getElementById("modal-message");
        const inputEl = document.getElementById("modal-input");
        const confirmBtn = document.getElementById("modal-confirm");
        const cancelBtn = document.getElementById("modal-cancel");

        messageEl.innerHTML = "삭제할 카테고리를 선택하세요.";
        overlay.classList.remove("hidden");
        inputEl.classList.add("hidden");

        const close = () => {
          overlay.classList.add("hidden");
          confirmBtn.onclick = null;
          cancelBtn.onclick = null;
        };

        confirmBtn.onclick = close;
        cancelBtn.onclick = close;
        return;
      }

      const overlay = document.getElementById("modal-overlay");
      const messageEl = document.getElementById("modal-message");
      const inputEl = document.getElementById("modal-input");
      const confirmBtn = document.getElementById("modal-confirm");
      const cancelBtn = document.getElementById("modal-cancel");

      messageEl.innerHTML = `'${selected}'<br> 카테고리를 정말 삭제할까요?`;
      overlay.classList.remove("hidden");
      inputEl.classList.add("hidden");

      const close = () => {
        overlay.classList.add("hidden");
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
      };

      confirmBtn.onclick = () => {
        close();

        const categorySelect = document.getElementById("todo-category");
        const editSelect = document.getElementById("category-edit-select");

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

        // 삭제 완료 알림
        messageEl.innerHTML = `'${selected}'<br>카테고리가 삭제되었습니다.`;
        overlay.classList.remove("hidden");
        inputEl.classList.add("hidden");

        const closeAlert = () => {
          overlay.classList.add("hidden");
          confirmBtn.onclick = null;
          cancelBtn.onclick = null;
        };

        confirmBtn.onclick = closeAlert;
        cancelBtn.onclick = closeAlert;
      };

      cancelBtn.onclick = close;
    });
  }

  // 카테고리 수정 버튼 이벤트 리스너
  const editCategoryBtn = document.getElementById("edit-category-btn");
  if (editCategoryBtn) {
    editCategoryBtn.addEventListener("click", () => {
      const editSelect = document.getElementById("category-edit-select");
      const selected = editSelect.value;
      if (!selected) {
        const overlay = document.getElementById("modal-overlay");
        const messageEl = document.getElementById("modal-message");
        const inputEl = document.getElementById("modal-input");
        const confirmBtn = document.getElementById("modal-confirm");
        const cancelBtn = document.getElementById("modal-cancel");

        messageEl.innerHTML = "수정할 카테고리를 선택하세요.";
        overlay.classList.remove("hidden");
        inputEl.classList.add("hidden");

        const close = () => {
          overlay.classList.add("hidden");
          confirmBtn.onclick = null;
          cancelBtn.onclick = null;
        };

        confirmBtn.onclick = close;
        cancelBtn.onclick = close;
        return;
      }

      const overlay = document.getElementById("modal-overlay");
      const messageEl = document.getElementById("modal-message");
      const inputEl = document.getElementById("modal-input");
      const confirmBtn = document.getElementById("modal-confirm");
      const cancelBtn = document.getElementById("modal-cancel");

      messageEl.innerHTML = "카테고리의 새로운 이름을 작성해주세요.";
      overlay.classList.remove("hidden");
      inputEl.classList.remove("hidden");
      inputEl.value = "";
      inputEl.focus();

      const close = () => {
        overlay.classList.add("hidden");
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        inputEl.onkeydown = null;
      };

      inputEl.onkeydown = (e) => {
        if (e.key === "Enter") {
          confirmBtn.click();
        }
      };

      confirmBtn.onclick = () => {
        const newName = inputEl.value.trim();
        close();
        
        if (!newName) return;
        
        const categorySelect = document.getElementById("todo-category");
        const editSelect = document.getElementById("category-edit-select");
        const exists = [...categorySelect.options].some(opt => opt.value === newName);
        if (exists) {
          // 이미 존재하는 카테고리 알림
          messageEl.innerHTML = "이미 존재하는 카테고리입니다.";
          overlay.classList.remove("hidden");
          inputEl.classList.add("hidden");
          
          const closeAlert = () => {
            overlay.classList.add("hidden");
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
          };
          
          confirmBtn.onclick = closeAlert;
          cancelBtn.onclick = closeAlert;
          return;
        }
        
        // select option 값 변경
        [...editSelect.options].forEach(opt => {
          if (opt.value === selected) opt.text = opt.value = newName;
        });
        [...categorySelect.options].forEach(opt => {
          if (opt.value === selected) opt.text = opt.value = newName;
        });
        // 기존 할 일의 카테고리 값도 변경
        const allTodos = document.querySelectorAll("#todo-list li");
        allTodos.forEach(li => {
          if (li.dataset.category === selected) {
            li.dataset.category = newName;
            const catSpan = [...li.querySelectorAll("span")].find(span => span.textContent === selected);
            if (catSpan) catSpan.textContent = newName;
          }
        });
        
        // 수정 완료 알림
        messageEl.innerHTML = "카테고리 이름이 수정되었습니다.";
        overlay.classList.remove("hidden");
        inputEl.classList.add("hidden");

        const closeAlert = () => {
          overlay.classList.add("hidden");
          confirmBtn.onclick = null;
          cancelBtn.onclick = null;
        };

        confirmBtn.onclick = closeAlert;
        cancelBtn.onclick = closeAlert;
      };

      cancelBtn.onclick = close;
    });
  }
});

window.handleCategoryChange = handleCategoryChange; 