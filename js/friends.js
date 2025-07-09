import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

// 친구 추가(요청) - 이메일로
async function sendFriendRequest(friendEmail) {
  const user = auth.currentUser;
  if (!user) {
    alert("로그인 필요");
    return;
  }
  if (user.email === friendEmail) {
    alert("본인에게 요청 불가");
    return;
  }
  // 이미 친구인지 확인
  const myFriendsSnap = await getDocs(collection(db, "users", user.uid, "friends"));
  for (const docSnap of myFriendsSnap.docs) {
    if (docSnap.data().email === friendEmail) {
      alert("이미 친구입니다.");
      return;
    }
  }
  // 이미 요청 보냈는지 확인
  const myRequestsSnap = await getDocs(collection(db, "users", user.uid, "friendRequests"));
  for (const docSnap of myRequestsSnap.docs) {
    if (docSnap.data().email === friendEmail) {
      alert("이미 친구 요청을 보냈습니다.");
      return;
    }
  }
  // 이미 받은 요청이 있는지 확인
  const receivedSnap = await getDocs(collection(db, "users", user.uid, "receivedRequests"));
  for (const docSnap of receivedSnap.docs) {
    if (docSnap.data().email === friendEmail) {
      alert("상대방이 이미 친구 요청을 보냈습니다.");
      return;
    }
  }
  // 상대방 uid 찾기
  const usersSnap = await getDocs(collection(db, "users"));
  let friendUid = null, friendName = "이름없음", friendProfile = "https://via.placeholder.com/40";
  usersSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.email === friendEmail) {
      friendUid = docSnap.id;
      if (data.name && data.name.trim() !== "") friendName = data.name;
      if (data.profileImageUrl && data.profileImageUrl.trim() !== "") friendProfile = data.profileImageUrl;
    }
  });
  if (!friendUid) {
    alert("해당 이메일의 사용자를 찾을 수 없습니다.");
    return;
  }
  // 요청 상태로 양쪽에 저장 (모든 정보 포함)
  await setDoc(doc(db, "users", user.uid, "friendRequests", friendUid), {
    email: friendEmail,
    name: friendName,
    profileImageUrl: friendProfile,
    uid: friendUid,
    status: "pending"
  });
  await setDoc(doc(db, "users", friendUid, "receivedRequests", user.uid), {
    email: user.email,
    name: user.displayName || "이름없음",
    profileImageUrl: user.photoURL || "https://via.placeholder.com/40",
    uid: user.uid,
    status: "pending"
  });
  alert("친구 요청을 보냈습니다!");
}

// 친구 요청 수락
async function acceptFriendRequest(requesterUid) {
  const user = auth.currentUser;
  if (!user) return;
  // 상대방 정보 가져오기
  const requesterDoc = await getDoc(doc(db, "users", requesterUid));
  const requesterData = requesterDoc.data() || {};
  const requesterName = requesterData.name || "이름없음";
  const requesterProfile = requesterData.profileImageUrl || "https://via.placeholder.com/40";
  // 내 정보
  const myName = user.displayName || "이름없음";
  const myProfile = user.photoURL || "https://via.placeholder.com/40";
  // 1. 내 친구목록에 추가 (모든 정보 포함)
  await setDoc(doc(db, "users", user.uid, "friends", requesterUid), {
    email: requesterData.email,
    name: requesterName,
    profileImageUrl: requesterProfile,
    uid: requesterUid
  });
  // 2. 상대방 친구목록에도 나 추가 (모든 정보 포함)
  await setDoc(doc(db, "users", requesterUid, "friends", user.uid), {
    email: user.email,
    name: myName,
    profileImageUrl: myProfile,
    uid: user.uid
  });
  // 3. 요청 상태 삭제
  await deleteDoc(doc(db, "users", user.uid, "receivedRequests", requesterUid));
  await deleteDoc(doc(db, "users", requesterUid, "friendRequests", user.uid));
}

// 친구목록 불러오기
async function getMyFriends() {
  const user = auth.currentUser;
  if (!user) return [];
  const friendsSnap = await getDocs(collection(db, "users", user.uid, "friends"));
  // 내 uid와 같은 친구는 제외
  return friendsSnap.docs
    .map(doc => doc.data())
    .filter(friend => friend.uid && friend.uid !== user.uid);
}

// 받은 친구요청 불러오기
async function getReceivedRequests() {
  const user = auth.currentUser;
  if (!user) return [];
  const snap = await getDocs(collection(db, "users", user.uid, "receivedRequests"));
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

// UI 연결
function initializeFriendsList() {
  // user-info 영역 내에서만 탐색하도록 root 지정
  const userInfoRoot = document.getElementById("user-info") || document;
  const friendsList = userInfoRoot.querySelector("#friends-list");
  const addFriendBtn = userInfoRoot.querySelector("#add-friend-btn");
  const friendInput = userInfoRoot.querySelector("#friend-input");
  const requestsList = userInfoRoot.querySelector("#requests-list");
  const showRequestsBtn = userInfoRoot.querySelector("#show-requests-btn");
  let showingRequests = false;

  // 친구 추가 버튼
  addFriendBtn.addEventListener("click", async () => {
    const friendEmail = friendInput.value.trim();
    if (!friendEmail) return;
    await sendFriendRequest(friendEmail);
    friendInput.value = "";
    await renderFriendsList();
  });
  friendInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addFriendBtn.click();
  });

  // 받은 친구요청 보기 버튼
  showRequestsBtn.addEventListener("click", async () => {
    if (!showingRequests) {
      friendsList.style.display = "none";
      requestsList.style.display = "grid";
      showRequestsBtn.textContent = "친구목록 보기";
      requestsList.innerHTML = "";
      const received = await getReceivedRequests();
      received.forEach(req => {
        const li = document.createElement("li");
        li.className = "friend-item";
        li.innerHTML = `
          <span>${req.email}</span>
          <button class="accept-request-btn" style="margin-left: 6px;">수락</button>
        `;
        const acceptBtn = li.querySelector(".accept-request-btn");
        acceptBtn.addEventListener("click", async () => {
          await acceptFriendRequest(req.uid);
          await renderFriendsList();
          requestsList.style.display = "none";
          friendsList.style.display = "grid";
          showRequestsBtn.textContent = "받은 친구요청 보기";
          showingRequests = false;
        });
        requestsList.appendChild(li);
      });
      showingRequests = true;
    } else {
      requestsList.style.display = "none";
      friendsList.style.display = "grid";
      showRequestsBtn.textContent = "받은 친구요청 보기";
      showingRequests = false;
      await renderFriendsList();
    }
  });

  renderFriendsList();
}

// 친구목록 렌더링
async function renderFriendsList() {
  const userInfoRoot = document.getElementById("user-info") || document;
  const friendsList = userInfoRoot.querySelector("#friends-list");
  if (!friendsList) return;
  friendsList.innerHTML = "";
  const friends = await getMyFriends();
  if (friends.length === 0) {
    friendsList.innerHTML = '<li style="color:#888;">친구가 없습니다.</li>';
    return;
  }
  friends.forEach(friend => {
    const li = document.createElement("li");
    li.className = "friend-item";
    li.innerHTML = `
      <img src="${friend.profileImageUrl || 'https://via.placeholder.com/40'}" style="width:40px; height:40px; border-radius:50%; vertical-align:middle;">
      <span style="margin-left:10px; font-weight:bold;">${friend.name || friend.email}</span>
    `;
    friendsList.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", initializeFriendsList); 