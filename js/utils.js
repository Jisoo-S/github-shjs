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