// Firebase 설정
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// 사용자 인증 관련 함수
function signUp(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

function signIn(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function signOut() {
  return auth.signOut();
}

function getCurrentUser() {
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
auth.onAuthStateChanged((user) => {
  if (user) {
    // 사용자가 로그인한 경우
    console.log("사용자가 로그인했습니다:", user.email);
    // 필요한 데이터 로드
    loadUserData();
  } else {
    // 사용자가 로그아웃한 경우
    console.log("사용자가 로그아웃했습니다");
    // UI 초기화
    clearUserData();
  }
});

// 사용자 데이터 로드
function loadUserData() {
  getTodosFromFirebase()
    .then((snapshot) => {
      const todos = [];
      snapshot.forEach((doc) => {
        todos.push({ id: doc.id, ...doc.data() });
      });
      // TODO: 할 일 목록 UI 업데이트
    })
    .catch((error) => {
      console.error("할 일 목록 로드 실패:", error);
    });

  getFriendsFromFirebase()
    .then((doc) => {
      if (doc.exists) {
        const friends = doc.data().friends || [];
        // TODO: 친구 목록 UI 업데이트
      }
    })
    .catch((error) => {
      console.error("친구 목록 로드 실패:", error);
    });
}

// 사용자 데이터 초기화
function clearUserData() {
  // TODO: UI 초기화 로직 구현
} 