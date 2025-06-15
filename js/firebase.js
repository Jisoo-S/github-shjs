// Firebase SDK 임포트
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyADIDRqmGCI6PGofskRtVnrsTK2xHpoqEw",
  authDomain: "logintodo-ff777.firebaseapp.com",
  projectId: "logintodo-ff777",
  storageBucket: "logintodo-ff777.firebasestorage.app",
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

// 사용자 인증 관련 함수
export async function signup() {
  const email = loginEmailInput.value;
  const password = loginPasswordInput.value;

  // 입력값 검증
  if (!email || !password) {
    alert("이메일과 비밀번호를 모두 입력해주세요.");
    return;
  }

  console.log("회원가입 시도:", email);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("회원가입 성공:", userCredential.user.email);
    alert("회원가입 성공!");
  } catch (error) {
    console.error("회원가입 실패:", error.code, error.message);
    alert("회원가입 실패: " + error.message);
  }
}

export async function login() {
  const email = loginEmailInput.value;
  const password = loginPasswordInput.value;

  // 입력값 검증
  if (!email || !password) {
    alert("이메일과 비밀번호를 모두 입력해주세요.");
    return;
  }

  console.log("로그인 시도:", email);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("로그인 성공:", userCredential.user.email);
    alert("로그인 성공!");
  } catch (error) {
    console.error("로그인 실패:", error.code, error.message);
    alert("로그인 실패: " + error.message);
  }
}

export async function logout() {
  try {
    await signOut(auth);
    console.log("로그아웃 성공");
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
function saveTodoToFirebase(todo) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");

  return db.collection("users").doc(user.uid).collection("todos").add(todo);
}

function getTodosFromFirebase() {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");

  return db.collection("users").doc(user.uid).collection("todos").get();
}

function updateTodoInFirebase(todoId, updates) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");

  return db.collection("users").doc(user.uid).collection("todos").doc(todoId).update(updates);
}

function deleteTodoFromFirebase(todoId) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");

  return db.collection("users").doc(user.uid).collection("todos").doc(todoId).delete();
}

// 친구 목록 관련 함수
function saveFriendsToFirebase(friends) {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");

  return db.collection("users").doc(user.uid).set({ friends }, { merge: true });
}

function getFriendsFromFirebase() {
  const user = getCurrentUser();
  if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");

  return db.collection("users").doc(user.uid).get();
}

// 인증 상태 변경 감지
onAuthStateChanged(auth, (user) => {
  if (user) {
    // 사용자가 로그인한 경우
    console.log("사용자가 로그인했습니다:", user.email);
    loginForm.style.display = 'none';
    userInfo.style.display = 'block';
    if (profileImage) profileImage.src = user.photoURL || 'https://via.placeholder.com/100';
    if (userEmail) userEmail.textContent = user.email;
    // 필요한 데이터 로드
    loadUserData();
  } else {
    // 사용자가 로그아웃한 경우
    console.log("사용자가 로그아웃했습니다");
    loginForm.style.display = 'block';
    userInfo.style.display = 'none';
    if (profileImage) profileImage.src = 'https://via.placeholder.com/100';
    if (userEmail) userEmail.textContent = '';
    // UI 초기화
    clearUserData();
  }
});

// 사용자 데이터 로드
async function loadUserData() {
  try {
    const user = getCurrentUser();
    if (!user) return;

    // 할 일 목록 로드
    const todosSnapshot = await getDocs(collection(db, "users", user.uid, "todos"));
    const todos = [];
    todosSnapshot.forEach((doc) => {
      todos.push({ id: doc.id, ...doc.data() });
    });
    // TODO: 할 일 목록 UI 업데이트

    // 친구 목록 로드
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const friends = userDoc.data().friends || [];
      // TODO: 친구 목록 UI 업데이트
    }
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  }
}

// 사용자 데이터 초기화
function clearUserData() {
  // TODO: UI 초기화 로직 구현 (예: 친구 목록 비우기 등)
  // 현재는 로그인 폼과 사용자 정보 영역 토글만 처리
} 