// Firebase SDK 임포트
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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
const storage = getStorage(app);

// HTML 요소 참조
const loginForm = document.getElementById('login-form');
const userInfo = document.getElementById('user-info');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const profileImage = document.getElementById('profile-image');
const userEmail = document.getElementById('user-email');
const profileName = document.getElementById('profile-name');
const editNameBtn = document.getElementById('edit-name-btn');
const editNameInput = document.getElementById('edit-name-input');
const saveNameBtn = document.getElementById('save-name-btn');
const profileImageInput = document.getElementById('profile-image-input');
const changeProfileBtn = document.getElementById('change-profile-btn');

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
  // 모든 뷰 숨기기
  if (todoMain) todoMain.style.display = "none";
  if (calendarView) calendarView.style.display = "none";
  if (categoryView) categoryView.style.display = "none";
  if (friendsView) friendsView.style.display = "none";
  const plusView = document.getElementById('plus-view');
  if (plusView) plusView.style.display = "none";

  // 로그인하지 않은 경우 plus-view만 표시
  if (!isLoggedIn) {
    if (plusView) plusView.style.display = "block";
    return;
  }

  // 로그인한 경우 선택된 뷰 표시
  if (view === 'todo' && todoMain) todoMain.style.display = "block";
  if (view === 'calendar' && calendarView) calendarView.style.display = "block";
  if (view === 'category' && categoryView) categoryView.style.display = "block";
  if (view === 'friends' && friendsView) friendsView.style.display = "block";
  if (view === 'plus' && plusView) {
    plusView.style.display = "block";
    if (typeof window.initializeFriendsList === 'function') window.initializeFriendsList();
  }
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
    // Firestore에 사용자 정보 저장
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: userCredential.user.email,
      name: userCredential.user.displayName || "이름없음"
    }, { merge: true });
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
    // Firestore에 사용자 정보(email) 저장
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: userCredential.user.email
    }, { merge: true });
    
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
    if (profileImage) profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
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

export async function getCalendarNotesFromFirebase(uid) {
  let targetUid = uid;
  if (!targetUid) {
    const user = getCurrentUser();
    if (!user) return Promise.reject("사용자가 로그인되어 있지 않습니다.");
    targetUid = user.uid;
  }
  const querySnapshot = await getDocs(collection(db, "users", targetUid, "calendarNotes"));
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

// 친구 요청 보내기
export async function sendFriendRequest(targetEmail) {
  const user = getCurrentUser();
  if (!user) throw new Error("로그인 필요");
  if (user.email === targetEmail) throw new Error("본인에게 요청 불가");

  // 상대방 uid 찾기
  const usersRef = collection(db, "users");
  const usersSnap = await getDocs(usersRef);
  let targetUid = null;
  usersSnap.forEach(doc => {
    if (doc.data().email === targetEmail) targetUid = doc.id;
  });
  if (!targetUid) throw new Error("상대방 이메일을 찾을 수 없습니다.");

  // 내 요청 목록에 추가
  await setDoc(doc(db, "users", user.uid, "friendRequests", targetUid), {
    email: targetEmail,
    status: "pending"
  });
  // 상대방 받은 요청 목록에 추가
  await setDoc(doc(db, "users", targetUid, "receivedRequests", user.uid), {
    email: user.email,
    status: "pending"
  });
}

// 내가 보낸 친구 요청 목록
export async function getFriendRequests() {
  const user = getCurrentUser();
  if (!user) throw new Error("로그인 필요");
  const snap = await getDocs(collection(db, "users", user.uid, "friendRequests"));
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}
// 내가 받은 친구 요청 목록
export async function getReceivedRequests() {
  const user = getCurrentUser();
  if (!user) throw new Error("로그인 필요");
  const snap = await getDocs(collection(db, "users", user.uid, "receivedRequests"));
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}
// 친구 요청 수락
export async function acceptFriendRequest(requesterUid, requesterEmail) {
  const user = getCurrentUser();
  if (!user) throw new Error("로그인 필요");
  // 내 친구 목록에 추가
  await setDoc(doc(db, "users", user.uid, "friends", requesterUid), {
    email: requesterEmail
  });
  // 상대방 친구 목록에 나 추가
  await setDoc(doc(db, "users", requesterUid, "friends", user.uid), {
    email: user.email
  });
  // 요청 삭제
  await deleteDoc(doc(db, "users", user.uid, "receivedRequests", requesterUid));
  await deleteDoc(doc(db, "users", requesterUid, "friendRequests", user.uid));
}
// 친구 삭제
export async function removeFriend(friendUid) {
  const user = getCurrentUser();
  if (!user) throw new Error("로그인 필요");
  await deleteDoc(doc(db, "users", user.uid, "friends", friendUid));
  await deleteDoc(doc(db, "users", friendUid, "friends", user.uid));
}
// 친구 요청 취소
export async function cancelFriendRequest(targetUid) {
  const user = getCurrentUser();
  if (!user) throw new Error("로그인 필요");
  await deleteDoc(doc(db, "users", user.uid, "friendRequests", targetUid));
  await deleteDoc(doc(db, "users", targetUid, "receivedRequests", user.uid));
}

// 이름 Firestore에 저장 및 UI 갱신 함수
async function updateUserName(newName) {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, "users", user.uid), { name: newName }, { merge: true });
  await updateProfile(user, { displayName: newName });
  if (profileName) profileName.textContent = newName;
}
// Firestore에서 이름 불러오기
async function loadUserName() {
  const user = auth.currentUser;
  if (!user) return;
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists() && userDoc.data().name) {
    if (profileName) profileName.textContent = userDoc.data().name;
    if (editNameInput) editNameInput.value = userDoc.data().name;
  } else {
    if (profileName) profileName.textContent = user.displayName || "이름 없음";
    if (editNameInput) editNameInput.value = user.displayName || "";
  }
}
// 프로필 사진 업로드 및 갱신 함수
async function uploadProfileImage(file) {
  const user = auth.currentUser;
  if (!user || !file) return;

  // 파일을 이미지로 읽기
  const img = new Image();
  const reader = new FileReader();
  reader.onload = function(e) {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  img.onload = async function() {
    // 정사각형 canvas 생성 (가장 짧은 변 기준)
    const size = Math.min(img.width, img.height);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // 중앙 기준으로 자르기
    ctx.drawImage(
      img,
      (img.width - size) / 2,
      (img.height - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size
    );
    // canvas를 Blob으로 변환
    canvas.toBlob(async (blob) => {
      const fileRef = storageRef(storage, `profileImages/${user.uid}`);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      await updateProfile(user, { photoURL: url });
      await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
      if (profileImage) profileImage.src = url || 'https://www.gravatar.com/avatar/?d=mp';
    }, 'image/jpeg', 0.95);
  };
}

// 인증 상태 변화 시 이름/프로필 UI 갱신
onAuthStateChanged(auth, (user) => {
  if (user) {
    handleUserLogin(user);
    if (typeof window.initializeFriendsList === 'function') window.initializeFriendsList();
  } else {
    handleUserLogout();
  }
});
async function handleUserLogin(user) {
  try {
    if (profileImage) profileImage.src = (user.photoURL ? user.photoURL : 'https://www.gravatar.com/avatar/?d=mp');
    if (userEmail) userEmail.textContent = user.email;
    await loadUserName();
    if (loginForm) loginForm.style.display = 'none';
    if (userInfo) userInfo.style.display = 'block';
    // 데이터 로드
    const loadPromises = [];
    if (window.loadTodoList) loadPromises.push(window.loadTodoList());
    if (window.loadNotes) loadPromises.push(window.loadNotes());
    if (window.loadCalendarNotes) loadPromises.push(window.loadCalendarNotes());
    await Promise.all(loadPromises);
  } catch (error) {
    console.error("데이터 로드 중 오류 발생:", error);
  }
}
function handleUserLogout() {
  if (loginForm) loginForm.style.display = 'block';
  if (userInfo) userInfo.style.display = 'none';
  if (profileImage) profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
  if (userEmail) userEmail.textContent = '';
  if (profileName) profileName.textContent = '';
  if (editNameInput) editNameInput.value = '';
  try {
    if (window.clearTodoListUI) window.clearTodoListUI();
    if (window.clearNotesUI) window.clearNotesUI();
    if (window.clearCalendarNotesUI) window.clearCalendarNotesUI();
  } catch (error) {
    console.error("UI 초기화 중 오류 발생:", error);
  }
}
// 이름 변경 버튼 이벤트
if (editNameBtn && editNameInput && saveNameBtn) {
  editNameBtn.onclick = () => {
    editNameInput.style.display = 'inline-block';
    saveNameBtn.style.display = 'inline-block';
    editNameInput.value = profileName.textContent;
    profileName.style.display = 'none';
    editNameBtn.style.display = 'none';
    editNameInput.focus();
  };
  saveNameBtn.onclick = () => {
    (async () => {
      const newName = editNameInput.value.trim();
      if (newName) {
        await updateUserName(newName);
      }
      editNameInput.style.display = 'none';
      saveNameBtn.style.display = 'none';
      profileName.style.display = 'inline';
      editNameBtn.style.display = 'inline-block';
    })();
  };
  editNameInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      saveNameBtn.click();
    }
  });
}
// 프로필 사진 변경 버튼 이벤트
if (changeProfileBtn && profileImageInput) {
  changeProfileBtn.onclick = () => {
    profileImageInput.click();
  };
  profileImageInput.onchange = (e) => {
    (async () => {
      const file = e.target.files[0];
      if (file) {
        await uploadProfileImage(file);
      }
    })();
  };
}

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
    if (profileImage) profileImage.src = 'https://www.gravatar.com/avatar/?d=mp';
  }
}

// window에 함수들 등록 (다른 파일에서 호출 가능하도록)
window.showView = showView;
window.login = login;
window.signup = signup;
window.logout = logout; 