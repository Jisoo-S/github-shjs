// 날짜 관련 유틸리티 함수
function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
 
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekNumberInMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekday = firstDay.getDay();
  const offsetDate = date.getDate() + firstDayWeekday - 1;
  return Math.floor(offsetDate / 7) + 1;
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// 모달 관련 유틸리티 함수
function showModal(message, isInput = false, callback) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "1000";

  const modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "white";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "10px";
  modalContent.style.width = "300px";
  modalContent.style.maxWidth = "90%";

  const messageElement = document.createElement("p");
  messageElement.innerHTML = message;
  messageElement.style.marginBottom = "20px";
  messageElement.style.textAlign = "center";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "center";
  buttonContainer.style.gap = "10px";

  let inputElement = null;
  if (isInput) {
    inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.style.width = "100%";
    inputElement.style.padding = "8px";
    inputElement.style.marginBottom = "20px";
    inputElement.style.border = "1px solid #ccc";
    inputElement.style.borderRadius = "5px";
    modalContent.insertBefore(inputElement, buttonContainer);
  }

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "확인";
  confirmButton.style.padding = "8px 16px";
  confirmButton.style.border = "none";
  confirmButton.style.borderRadius = "5px";
  confirmButton.style.backgroundColor = "#4CAF50";
  confirmButton.style.color = "white";
  confirmButton.style.cursor = "pointer";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "취소";
  cancelButton.style.padding = "8px 16px";
  cancelButton.style.border = "none";
  cancelButton.style.borderRadius = "5px";
  cancelButton.style.backgroundColor = "#f44336";
  cancelButton.style.color = "white";
  cancelButton.style.cursor = "pointer";

  buttonContainer.appendChild(confirmButton);
  buttonContainer.appendChild(cancelButton);
  modalContent.appendChild(messageElement);
  modalContent.appendChild(buttonContainer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  if (inputElement) {
    inputElement.focus();
  }

  return new Promise((resolve) => {
    confirmButton.onclick = () => {
      const value = isInput ? inputElement.value : true;
      document.body.removeChild(modal);
      if (callback) callback(value);
      resolve(value);
    };

    cancelButton.onclick = () => {
      document.body.removeChild(modal);
      if (callback) callback(false);
      resolve(false);
    };

    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        if (callback) callback(false);
        resolve(false);
      }
    };
  });
}

// 로컬 스토리지 관련 유틸리티 함수
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("로컬 스토리지 저장 실패:", error);
    return false;
  }
}

function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("로컬 스토리지 로드 실패:", error);
    return null;
  }
}

// DOM 관련 유틸리티 함수
function createElement(tag, className, innerHTML = "") {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

function addClass(element, className) {
  if (element && !element.classList.contains(className)) {
    element.classList.add(className);
  }
}

function removeClass(element, className) {
  if (element && element.classList.contains(className)) {
    element.classList.remove(className);
  }
}

// 이벤트 관련 유틸리티 함수
function addEvent(element, eventType, handler) {
  if (element) {
    element.addEventListener(eventType, handler);
  }
}

function removeEvent(element, eventType, handler) {
  if (element) {
    element.removeEventListener(eventType, handler);
  }
}

// 문자열 관련 유틸리티 함수
function truncateString(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 배열 관련 유틸리티 함수
function uniqueArray(arr) {
  return [...new Set(arr)];
}

function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// 객체 관련 유틸리티 함수
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mergeObjects(...objects) {
  return objects.reduce((result, obj) => ({ ...result, ...obj }), {});
} 