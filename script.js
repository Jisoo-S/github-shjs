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

  // 🔧 수정 반영 문제 해결된 버전 (span 참조 재사용 제거)

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
      const restoredBtn = buttonGroup.querySelector(".edit-btn");
      restoredBtn.textContent = "✏️";
      restoredBtn.addEventListener("click", () => {
        editTodo(li, left, newSpan, checkbox, selectedDate, buttonGroup);
      });

      renderList();

      const isCategoryViewVisible = document.getElementById("category-view").style.display === "block";
      if (isCategoryViewVisible) {
        setTimeout(() => {
          handleCategoryChange();
        }, 100);
      }
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
    const selectedCategory = document.getElementById("category-edit-select").value.trim();
    const resultArea = document.getElementById("category-todo-result");
    const allTodos = document.querySelectorAll("#todo-list li");
  
    resultArea.innerHTML = "";
  
    allTodos.forEach(li => {
      const todoCategory = (li.dataset.category || "").trim();
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

  
// ✅ 버튼 연동용: pin/edit/delete 버튼에 class 붙이는 부분은 addTodo 안에 이미 있다고 가정
// ✅ 수정 기능이 카테고리 뷰에서도 완전히 작동하도록 리팩토링된 버전

function handleCategoryChange() {
  const selectedCategory = document.getElementById("category-edit-select").value.trim();
  const resultArea = document.getElementById("category-todo-result");
  const allTodos = document.querySelectorAll("#todo-list li");

  resultArea.innerHTML = "";

  // 📌 정렬: 핀 고정 먼저, 그 다음 날짜 순
  const sortedTodos = Array.from(allTodos).sort((a, b) => {
    const pinnedA = a.dataset.pinned === "true";
    const pinnedB = b.dataset.pinned === "true";
    if (pinnedA !== pinnedB) return pinnedB - pinnedA;

    const dateA = a.dataset.date || "";
    const dateB = b.dataset.date || "";
    return dateA.localeCompare(dateB);
  });

  // 이후 기존 로직을 sortedTodos로 돌리기
  sortedTodos.forEach(originalLi => {
    const liCategory = (originalLi.dataset.category || "").trim();
    if (selectedCategory && liCategory === selectedCategory) {
      // 🔁 여기부터는 기존 클론 및 이벤트 연결 코드 유지
    }
  });

  allTodos.forEach(originalLi => {
    const liCategory = (originalLi.dataset.category || "").trim();
    if (selectedCategory && liCategory === selectedCategory) {
      const clone = originalLi.cloneNode(true);
      clone.classList.add("todo-item");

      // ✅ 복제본에 직접 수정 기능을 구현하기 위해 이벤트 전부 재설정
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
        
        // 원본 버튼에 스타일 적용 (스타일 함수가 있다면 사용)
        const originalPinBtn = originalLi.querySelector(".pin-btn");
        if (originalPinBtn) {
          setPinButtonStyle(originalPinBtn, !isPinned);
        }

        // 클론 버튼에도 스타일 적용
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

        // 텍스트 입력창
        input.type = "text";
        input.value = oldText;
        input.style.fontSize = "14px";
        input.style.padding = "8px";
        input.style.borderRadius = "10px";
        input.style.border = "1px solid #ccc";
        input.style.width = "200px";
        input.style.marginRight = "10px";

        // 날짜 입력창
        dateInput.type = "date";
        dateInput.value = oldDate;
        dateInput.style.fontSize = "14px";
        dateInput.style.padding = "8px";
        dateInput.style.borderRadius = "10px";
        dateInput.style.border = "1px solid #ccc";
        dateInput.style.marginRight = "10px";

        // 카테고리 셀렉트
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

          // ⛔ 기존 span 하나만 갱신하던 것 → ✅ 전체 구조 갱신
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

          // 실제 데이터 반영
          originalLi.dataset.date = updatedDate;
          originalLi.dataset.category = updatedCategory;

 
          // 기존 todo-left 대체
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

          handleCategoryChange(); // 화면 갱신
        };

      });

      resultArea.appendChild(clone);
    }
  });

  document.querySelector(".main").style.display = "none";
  document.getElementById("calendar-view").style.display = "none";
  document.getElementById("category-view").style.display = "block";
}


// Firebase 초기화
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 사용자 상태 관리
let currentUser = null;

// 로그인 함수
async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    currentUser = userCredential.user;
    updateUserUI();
    loadFriendsList();
  } catch (error) {
    showModal(error.message);
  }
}

// 회원가입 함수
async function signup() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    currentUser = userCredential.user;
    await initializeUserProfile(currentUser);
    updateUserUI();
  } catch (error) {
    showModal(error.message);
  }
}

// 로그아웃 함수
async function logout() {
  try {
    await firebase.auth().signOut();
    currentUser = null;
    updateUserUI();
  } catch (error) {
    showModal(error.message);
  }
}

// 사용자 프로필 초기화
async function initializeUserProfile(user) {
  const userProfile = {
    email: user.email,
    displayName: user.email.split('@')[0],
    photoURL: `https://api.dicebear.com/6.x/initials/svg?seed=${user.email}`,
    friends: []
  };

  try {
    await firebase.firestore().collection('users').doc(user.uid).set(userProfile);
  } catch (error) {
    console.error('Error initializing user profile:', error);
  }
}

// UI 업데이트
function updateUserUI() {
  const loginForm = document.getElementById('login-form');
  const userInfo = document.getElementById('user-info');
  const profileImage = document.getElementById('profile-image');

  if (currentUser) {
    loginForm.style.display = 'none';
    userInfo.style.display = 'block';
    profileImage.src = currentUser.photoURL || `https://api.dicebear.com/6.x/initials/svg?seed=${currentUser.email}`;
    loadFriendsList();
  } else {
    loginForm.style.display = 'block';
    userInfo.style.display = 'none';
    document.getElementById('friends-list').innerHTML = '';
    document.getElementById('friend-home').style.display = 'none';
  }
}

// 친구 목록 로드
async function loadFriendsList() {
  if (!currentUser) return;

  try {
    const userDoc = await firebase.firestore().collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();
    const friendsList = document.getElementById('friends-list');
    friendsList.innerHTML = '';

    if (userData.friends && userData.friends.length > 0) {
      for (const friendId of userData.friends) {
        const friendDoc = await firebase.firestore().collection('users').doc(friendId).get();
        const friendData = friendDoc.data();
        
        const friendElement = createFriendElement(friendId, friendData);
        friendsList.appendChild(friendElement);
      }
    } else {
      friendsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">아직 친구가 없습니다.</p>';
    }
  } catch (error) {
    console.error('Error loading friends list:', error);
  }
}

// 친구 프로필 요소 생성
function createFriendElement(friendId, friendData) {
  const friendDiv = document.createElement('div');
  friendDiv.className = 'friend-profile';
  friendDiv.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 15px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `;

  friendDiv.innerHTML = `
    <img src="${friendData.photoURL}" alt="${friendData.displayName}" 
      style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;">
    <div style="font-weight: bold;">${friendData.displayName}</div>
  `;

  friendDiv.addEventListener('click', () => showFriendHome(friendId, friendData));
  
  friendDiv.addEventListener('mouseenter', () => {
    friendDiv.style.transform = 'translateY(-5px)';
  });
  
  friendDiv.addEventListener('mouseleave', () => {
    friendDiv.style.transform = 'translateY(0)';
  });

  return friendDiv;
}

// 친구의 홈 화면 표시
async function showFriendHome(friendId, friendData) {
  const friendsList = document.getElementById('friends-list');
  const friendHome = document.getElementById('friend-home');
  const friendName = document.getElementById('friend-name');
  const friendTodos = document.getElementById('friend-todos');

  friendsList.style.display = 'none';
  friendHome.style.display = 'block';
  friendName.textContent = `${friendData.displayName}의 할 일`;

  try {
    const todosSnapshot = await firebase.firestore()
      .collection('users')
      .doc(friendId)
      .collection('todos')
      .get();

    friendTodos.innerHTML = '';
    
    if (todosSnapshot.empty) {
      friendTodos.innerHTML = '<p style="text-align: center;">할 일이 없습니다.</p>';
      return;
    }

    todosSnapshot.forEach(doc => {
      const todo = doc.data();
      const todoElement = createFriendTodoElement(todo);
      friendTodos.appendChild(todoElement);
    });
  } catch (error) {
    console.error('Error loading friend todos:', error);
    friendTodos.innerHTML = '<p style="text-align: center;">할 일을 불러오는데 실패했습니다.</p>';
  }
}

// 친구의 할 일 요소 생성
function createFriendTodoElement(todo) {
  const todoDiv = document.createElement('div');
  todoDiv.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  todoDiv.innerHTML = `
    <div>
      <div style="font-weight: bold;">${todo.text}</div>
      <div style="font-size: 12px; color: #666; margin-top: 5px;">
        📅 ${todo.date}
        ${todo.category ? `<span style="margin-left: 10px;">${todo.category}</span>` : ''}
      </div>
    </div>
    ${todo.completed ? '<span style="color: #4CAF50;">✓ 완료</span>' : ''}
  `;

  return todoDiv;
}

// 친구 목록으로 돌아가기
function backToFriendsList() {
  document.getElementById('friends-list').style.display = 'grid';
  document.getElementById('friend-home').style.display = 'none';
}

// Firebase 인증 상태 변경 감지
firebase.auth().onAuthStateChanged((user) => {
  currentUser = user;
  updateUserUI();
});

function showModal(message, withInput = false, callback) {
  const overlay = document.getElementById("modal-overlay");
  const msg = document.getElementById("modal-message");
  const input = document.getElementById("modal-input");
  const confirmBtn = document.getElementById("modal-confirm");
  const cancelBtn = document.getElementById("modal-cancel");

  msg.innerHTML = message;
  input.style.display = withInput ? "block" : "none";
  input.value = "";

  overlay.classList.remove("hidden");

  const cleanUp = () => {
    overlay.classList.add("hidden");
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
  };

  confirmBtn.onclick = () => {
    const value = withInput ? input.value.trim() : true;
    cleanUp();
    callback(value);
  };

  cancelBtn.onclick = () => {
    cleanUp();
    callback(null);
  };

  // 엔터 키 입력 시 확인 동작 수행
  document.getElementById("modal-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const confirmBtn = document.getElementById("modal-confirm");
      confirmBtn.click();
    }
  });

}

const noteList = document.getElementById('note-list');
const noteInput = document.getElementById('note-input');

  function addNote() {
    const text = noteInput.value.trim();
    if (text === '') return;

    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.justifyContent = 'space-between';
    li.style.padding = '8px 12px';
    li.style.marginBottom = '6px';
    li.style.background = '#fff';
    li.style.borderRadius = '10px';
    li.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    
    const span = document.createElement('span');
    span.textContent = text;
    span.style.flex = '1';

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.style.background = 'none';
    delBtn.style.border = 'none';
    delBtn.style.cursor = 'pointer';
    delBtn.onclick = () => li.remove();

    li.appendChild(span);
    li.appendChild(delBtn);

    noteList.appendChild(li);
    noteInput.value = '';
  }

  noteInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addNote();
    }
  });


function showMonthView() {
  calendarMode = "month"; // ← 이거 추가

  const now = new Date(currentDate); // ← 기존 currentDate를 사용해야 함
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'long' });

  document.getElementById("calendar-title").textContent = monthName.toUpperCase();

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();

  const grid = document.getElementById("calendar-grid");
  grid.style.gridTemplateColumns = "repeat(7, 1fr)";
  grid.innerHTML = "";

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    if (i >= firstDay && i < firstDay + daysInMonth) {
      const dayNum = i - firstDay + 1;
      cell.textContent = dayNum;
    }
    grid.appendChild(cell);
  }
}
  
function showWeekView() {
  calendarMode = "week";

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // 월요일 시작

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // 일요일 끝

  const currentMonth = currentDate.getMonth();

  const startWeekNum = getWeekNumberInMonth(startOfWeek);
  const endWeekNum = getWeekNumberInMonth(endOfWeek);

  const startMonth = startOfWeek.getMonth();
  const endMonth = endOfWeek.getMonth();

  let label = "";

  if (startMonth === endMonth) {
    label = `${ordinal(startWeekNum)} week`;
  } else {
    // 예: "5th week / 1st week"
    label = `${ordinal(startWeekNum)} week / ${ordinal(endWeekNum)} week`;
  }

  document.getElementById("calendar-title").textContent = label;

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = "repeat(7, 1fr)";

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    cell.textContent = day.getDate();
    grid.appendChild(cell);
  }
}


function showTodayView() {
  calendarMode = "today";

  const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
  document.getElementById("calendar-title").textContent = dateStr;

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = "1fr";

  const cell = document.createElement("div");
  cell.className = "calendar-cell";
  cell.textContent = currentDate.getDate();
  grid.appendChild(cell);
}



let currentDate = new Date();
let calendarMode = "month"; // or 'week' or 'today'

// VIEW 초기 진입 시 자동 실행
calendarIcon.addEventListener("click", () => {
  todoMain.style.display = "none";
  calendarView.style.display = "block";
  categoryView.style.display = "none";
  friendsView.style.display = "none";
  showMonthView(); // ✅ 자동 표시
});

// 이전/다음 버튼
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
  const firstDay = (firstDayOfMonth.getDay() + 6) % 7; // 월요일: 0, 일요일: 6
  const day = date.getDate();

  return Math.ceil((day + firstDay) / 7);
}


function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

document.addEventListener("DOMContentLoaded", () => {
  // MONTH 버튼도 currentDate 리셋 포함
  document.querySelector(".calendar-btn:nth-child(1)").addEventListener("click", () => {
    currentDate = new Date(); // ✅ 리셋 추가
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
});
