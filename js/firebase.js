// Firebase SDK 임포트
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyADIDRqmGCI6PGofskRtVnrsTK2xHpoqEw",
  authDomain: "logintodo-ff777.firebaseapp.com",
  projectId: "logintodo-ff777",
  storageBucket: "logintodo-ff777.appspot.com",
  messagingSenderId: "1067689858137",
  appId: "1:1067689858137:web:c2de1fdbe937bfb2104d48",
  measurementId: "G-0SYF713XKM"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// HTML 요소 참조
const loginForm = document.getElementById('login-form');
const userInfo = document.getElementById('user-info');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const profileImage = document.getElementById('profile-image');
const userEmail = document.getElementById('user-email');

// 메인 뷰 요소들
const todoMain = document.querySelector(".main");
const calendarView = document.getElementById("calendar-view");
const categoryView = document.getElementById("category-view");
const friendsView = document.getElementById("friends-view");
const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
const sidebar = document.querySelector(".sidebar");

// 뷰 전환 함수
export function showView(view) {
  // 로그인 상태 확인
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // 로그인하지 않은 경우 friends-view만 표시
  if (!isLoggedIn) {
    if (todoMain) todoMain.style.display = "none";
    if (calendarView) calendarView.style.display = "none";
    if (categoryView) categoryView.style.display = "none";
    if (friendsView) friendsView.style.display = "block";
    return;
  }

  // 로그인한 경우 선택된 뷰 표시
  if (todoMain) todoMain.style.display = view === 'todo' ? "block" : "none";
  if (calendarView) calendarView.style.display = view === 'calendar' ? "block" : "none";
  if (categoryView) categoryView.style.display = view === 'category' ? "block" : "none";
  if (friendsView) friendsView.style.display = view === 'friends' ? "block" : "none";
  localStorage.setItem('lastView', view);

  // 캘린더 뷰일 때 캘린더 초기화 (initializeCalendar 함수가 전역에 노출되어 있어야 합니다)
  if (view === 'calendar') {
    if (typeof window.initializeCalendar === 'function') {
      window.initializeCalendar();
    }
  }

  // 카테고리 뷰일 때 카테고리별 할 일 목록 초기화
  if (view === 'category') {
    if (typeof window.handleCategoryChange === 'function') {
      window.handleCategoryChange();
    }
  }
}

// 사용자 인증 관련 함수
export async function signup() {
  if (!loginEmailInput || !loginPasswordInput) {
    console.error('로그인 폼 요소를 찾을 수 없습니다.');
    return;
  }

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();

  // 입력값 검증
  if (!email || !password) {
    alert("이메일과 비밀번호를 모두 입력해주세요.");
    return;
  }

  if (password.length < 6) {
    alert("비밀번호는 6자 이상이어야 합니다.");
    return;
  }

  console.log("회원가입 시도:", email);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("회원가입 성공:", userCredential.user.email);
    alert("회원가입 성공!");
    
    // 입력 필드 초기화
    loginEmailInput.value = '';
    loginPasswordInput.value = '';
  } catch (error) {
    console.error("회원가입 실패:", error.code, error.message);
    let errorMessage = "회원가입 실패: ";
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage += "이미 사용 중인 이메일입니다.";
        break;
      case 'auth/invalid-email':
        errorMessage += "유효하지 않은 이메일 형식입니다.";
        break;
      case 'auth/operation-not-allowed':
        errorMessage += "이메일/비밀번호 로그인이 비활성화되어 있습니다.";
        break;
      case 'auth/weak-password':
        errorMessage += "비밀번호가 너무 약합니다.";
        break;
      default:
        errorMessage += error.message;
    }
    
    alert(errorMessage);
  }
}

export async function login() {
  if (!loginEmailInput || !loginPasswordInput) {
    console.error('로그인 폼 요소를 찾을 수 없습니다.');
    return;
  }

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();

  // 입력값 검증
  if (!email || !password) {
    alert("이메일과 비밀번호를 모두 입력해주세요.");
    return;
  }

  console.log("로그인 시도:", email);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("로그인 성공:", userCredential.user.email);
    
    // 로그인 상태 저장
    localStorage.setItem('isLoggedIn', 'true');
    
    alert("로그인 성공!");
    
    // 입력 필드 초기화
    loginEmailInput.value = '';
    loginPasswordInput.value = '';
  } catch (error) {
    console.error("로그인 실패:", error.code, error.message);
    let errorMessage = "로그인 실패: ";
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage += "유효하지 않은 이메일 형식입니다.";
        break;
      case 'auth/user-disabled':
        errorMessage += "비활성화된 계정입니다.";
        break;
      case 'auth/user-not-found':
        errorMessage += "등록되지 않은 이메일입니다.";
        break;
      case 'auth/wrong-password':
        errorMessage += "잘못된 비밀번호입니다.";
        break;
      default:
        errorMessage += error.message;
    }
    
    alert(errorMessage);
  }
}

export async function logout() {
  try {
    // UI 초기화 먼저 수행
    if (window.clearTodoListUI) window.clearTodoListUI();
    if (window.clearNotesUI) window.clearNotesUI();
    if (window.clearCalendarNotesUI) window.clearCalendarNotesUI();

    // 로그아웃 수행
    await signOut(auth);
    console.log("로그아웃 성공");
    
    // 로그인 상태 제거
    localStorage.removeItem('isLoggedIn');
    
    // UI 업데이트
    if (loginForm) loginForm.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
    if (profileImage) profileImage.src = 'https://via.placeholder.com/100';
    if (userEmail) userEmail.textContent = '';
    
    // friends-view로 전환
    if (window.showView) window.showView('friends');
    
    alert("로그아웃되었습니다.");
  } catch (error) {
    console.error("로그아웃 실패:", error.message);
    alert("로그아웃 실패: " + error.message);
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}

// 할 일 목록 관련 함수
export async function addTodoToFirebase(todoData) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  
  try {
    const docRef = await addDoc(collection(db, "users", user.uid, "todos"), todoData);
    console.log("할 일 추가 성공:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("할 일 추가 실패:", error);
    throw error;
  }
}

export async function getTodosFromFirebase() {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  const querySnapshot = await getDocs(collection(db, "users", user.uid, "todos"));
  const todos = [];
  querySnapshot.forEach((doc) => {
    todos.push({ id: doc.id, ...doc.data() });
  });
  return todos;
}

export async function updateTodoInFirebase(todoId, updates) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  return updateDoc(doc(db, "users", user.uid, "todos", todoId), updates);
}

export async function deleteTodoFromFirebase(todoId) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  return deleteDoc(doc(db, "users", user.uid, "todos", todoId));
}

// 캘린더 노트 관련 함수
export async function addCalendarNoteToFirebase(noteData) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  return addDoc(collection(db, "users", user.uid, "calendarNotes"), noteData);
}

export async function getCalendarNotesFromFirebase() {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  const querySnapshot = await getDocs(collection(db, "users", user.uid, "calendarNotes"));
  const notes = [];
  querySnapshot.forEach((doc) => {
    notes.push({ id: doc.id, ...doc.data() });
  });
  return notes;
}

export async function deleteCalendarNoteFromFirebase(noteId) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  return deleteDoc(doc(db, "users", user.uid, "calendarNotes", noteId));
}

// 일반 노트 관련 함수
export async function addNoteToFirebase(noteData) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  return addDoc(collection(db, "users", user.uid, "generalNotes"), noteData);
}

export async function getNotesFromFirebase() {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  const querySnapshot = await getDocs(collection(db, "users", user.uid, "generalNotes"));
  const notes = [];
  querySnapshot.forEach((doc) => {
    notes.push({ id: doc.id, ...doc.data() });
  });
  return notes;
}

export async function deleteNoteFromFirebase(noteId) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  return deleteDoc(doc(db, "users", user.uid, "generalNotes", noteId));
}

// 친구 목록 관련 함수
export async function saveFriendsToFirebase(friends) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  return setDoc(doc(db, "users", user.uid, "friends", "list"), { friends });
}

export async function getFriendsFromFirebase() {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
  const docSnap = await getDoc(doc(db, "users", user.uid, "friends", "list"));
  if (docSnap.exists()) {
    return docSnap.data().friends || [];
  } else {
    return [];
  }
}

// 인증 상태 변경 감지
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // 사용자가 로그인한 경우
      console.log("사용자가 로그인했습니다:", user.email);
      if (loginForm) loginForm.style.display = 'none';
      if (userInfo) userInfo.style.display = 'block';
      if (profileImage) profileImage.src = user.photoURL || 'https://via.placeholder.com/100';
      if (userEmail) userEmail.textContent = user.email;

      // 필요한 데이터 로드
      const loadPromises = [];
      
      if (window.loadTodoList) {
        console.log("loadTodoList 호출");
        loadPromises.push(window.loadTodoList());
      }
      if (window.loadNotes) {
        console.log("loadNotes 호출");
        loadPromises.push(window.loadNotes());
      }
      if (window.loadCalendarNotes) {
        console.log("loadCalendarNotes 호출");
        loadPromises.push(window.loadCalendarNotes());
      }

      await Promise.all(loadPromises);
      console.log("모든 데이터 로드 완료");
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
    }
  } else {
    // 사용자가 로그아웃한 경우
    console.log("사용자가 로그아웃했습니다");
    if (loginForm) loginForm.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
    if (profileImage) profileImage.src = 'https://via.placeholder.com/100';
    if (userEmail) userEmail.textContent = '';

    // UI 초기화
    try {
      if (window.clearTodoListUI) window.clearTodoListUI();
      if (window.clearNotesUI) window.clearNotesUI();
      if (window.clearCalendarNotesUI) window.clearCalendarNotesUI();
    } catch (error) {
      console.error("UI 초기화 중 오류 발생:", error);
    }
  }
});

// UI 업데이트 함수 (외부에서 호출 가능하도록 export)
export function updateUIforAuth(user) {
  if (user) {
    // 로그인 상태: 사용자 정보 표시, 로그인 폼 숨김
    if (loginForm) loginForm.style.display = 'none';
    if (userInfo) userInfo.style.display = 'block';
    if (userEmail) userEmail.textContent = user.email;
    // 프로필 이미지는 추후 구현 예정 (현재는 placeholder 사용)
  } else {
    // 로그아웃 상태: 로그인 폼 표시, 사용자 정보 숨김
    if (loginForm) loginForm.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
    if (userEmail) userEmail.textContent = '';
    if (profileImage) profileImage.src = 'https://via.placeholder.com/100';
  }
}

// window에 함수들 등록 (다른 파일에서 호출 가능하도록)
window.showView = showView;
window.login = login;
window.signup = signup;
window.logout = logout; 