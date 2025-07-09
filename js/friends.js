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

export async function removeFriend(friendUid) {
  const user = auth.currentUser;
  if (!user) return;
  // 내 친구목록에서 삭제
  await deleteDoc(doc(db, "users", user.uid, "friends", friendUid));
  // 상대방 친구목록에서도 나를 삭제
  await deleteDoc(doc(db, "users", friendUid, "friends", user.uid));
}
window.removeFriend = removeFriend;

export function initializeFriendsList() {
  // user-info 영역 내에서만 탐색하도록 root 지정
  const userInfoRoot = document.getElementById("user-info") || document;
  const friendsList = userInfoRoot.querySelector("#friends-list");
  const addFriendBtn = userInfoRoot.querySelector("#add-friend-btn");
  const friendInput = userInfoRoot.querySelector("#friend-input");
  const requestsList = userInfoRoot.querySelector("#requests-list");
  const showRequestsBtn = userInfoRoot.querySelector("#show-requests-btn");
  const showFriendsBtn = userInfoRoot.querySelector("#show-friends-btn");
  const requestsModal = document.getElementById("requests-modal");
  const closeRequestsModal = document.getElementById("close-requests-modal");
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

  // 친구목록 보기 버튼 (friends-list는 항상 보이므로 별도 동작 없음)
  showFriendsBtn.addEventListener("click", async () => {
    friendsList.style.display = "grid";
  });

  // 받은 친구요청 보기 버튼 (모달 오픈)
  showRequestsBtn.addEventListener("click", async () => {
    if (requestsModal) requestsModal.style.display = "flex";
    const requestsList = document.getElementById("requests-list");
    if (requestsList) {
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
          if (requestsModal) requestsModal.style.display = "none";
        });
        requestsList.appendChild(li);
      });
    }
  });
  // 모달 닫기 버튼
  if (closeRequestsModal) {
    closeRequestsModal.addEventListener("click", () => {
      if (requestsModal) requestsModal.style.display = "none";
    });
  }

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
  // 각 친구의 최신 정보 Firestore에서 동적으로 가져오기
  for (const friend of friends) {
    let latestName = friend.name;
    let latestProfile = friend.profileImageUrl;
    try {
      const docSnap = await getDoc(doc(db, "users", friend.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        latestName = data.name || latestName;
        latestProfile = data.photoURL || latestProfile;
      }
    } catch (e) {}
    const li = document.createElement("li");
    li.className = "friend-item";
    const profileUrl = (latestProfile && latestProfile.startsWith('http')) ? latestProfile : 'https://www.gravatar.com/avatar/?d=mp';
    const displayName = (latestName && latestName.trim() !== "") ? latestName : "이름없음";
    const email = friend.email || "";
    li.innerHTML = `
      <img src="${profileUrl}" style="width:40px; height:40px; border-radius:50%; vertical-align:middle;" onerror="this.onerror=null;this.src='https://www.gravatar.com/avatar/?d=mp';">
      <span style="margin-left:10px; font-weight:bold;">${displayName}</span>
      <span style="margin-left:8px; color:#888; font-size:13px;">${email}</span>
      <button class="delete-friend-btn" style="margin-left:12px; background:#ffb3b3; color:#fff; border:none; border-radius:8px; padding:2px 10px; cursor:pointer; font-size:13px;">삭제</button>
    `;
    // 삭제 버튼 이벤트 연결
    const deleteBtn = li.querySelector('.delete-friend-btn');
    deleteBtn.addEventListener('click', async () => {
      if (confirm('정말 이 친구를 삭제하시겠습니까?')) {
        await window.removeFriend(friend.uid);
        await renderFriendsList();
      }
    });
    friendsList.appendChild(li);
  }
}

// DOMContentLoaded에서 initializeFriendsList를 호출하지 않음
// document.addEventListener("DOMContentLoaded", initializeFriendsList); 
window.initializeFriendsList = initializeFriendsList; 