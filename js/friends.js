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
  let requesterEmail = requesterData.email;
  if (!requesterEmail) {
    requesterEmail = "unknown";
  }
  // 내 정보
  const myName = user.displayName || "이름없음";
  const myProfile = user.photoURL || "https://via.placeholder.com/40";
  const myEmail = user.email || "unknown";
  // 1. 내 친구목록에 추가 (모든 정보 포함)
  await setDoc(doc(db, "users", user.uid, "friends", requesterUid), {
    email: requesterEmail,
    name: requesterName,
    profileImageUrl: requesterProfile,
    uid: requesterUid
  });
  // 2. 상대방 친구목록에도 나 추가 (모든 정보 포함)
  await setDoc(doc(db, "users", requesterUid, "friends", user.uid), {
    email: myEmail,
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

// 내가 보낸 친구요청 불러오기
async function getMyFriendRequests() {
  const user = auth.currentUser;
  if (!user) return [];
  const snap = await getDocs(collection(db, "users", user.uid, "friendRequests"));
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

// 친구요청 취소
async function cancelFriendRequest(targetUid) {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, "users", user.uid, "friendRequests", targetUid));
  await deleteDoc(doc(db, "users", targetUid, "receivedRequests", user.uid));
}
window.cancelFriendRequest = cancelFriendRequest;

export async function removeFriend(friendUid) {
  const user = auth.currentUser;
  if (!user) return;
  // 내 친구목록에서 삭제
  await deleteDoc(doc(db, "users", user.uid, "friends", friendUid));
  // 상대방 친구목록에서도 나를 삭제
  await deleteDoc(doc(db, "users", friendUid, "friends", user.uid));
}
window.removeFriend = removeFriend;
window.acceptFriendRequest = acceptFriendRequest;

export function initializeFriendsList() {
  // user-info 영역 내에서만 탐색하도록 root 지정
  const userInfoRoot = document.getElementById("user-info") || document;
  const friendsList = userInfoRoot.querySelector("#friends-list");
  const addFriendBtn = userInfoRoot.querySelector("#add-friend-btn");
  const friendInput = userInfoRoot.querySelector("#friend-input");
  const requestsList = userInfoRoot.querySelector("#requests-list");
  // showRequestsBtn은 항상 document에서 가져오도록 수정
  const showRequestsBtn = document.getElementById("show-requests-btn");
  const showFriendsBtn = userInfoRoot.querySelector("#show-friends-btn");
  const requestsModal = document.getElementById("requests-modal");
  const closeRequestsModal = document.getElementById("close-requests-modal");
  let showingRequests = false;

  const sentRequestsList = userInfoRoot.querySelector("#sent-requests-list");
  if (!sentRequestsList) {
    const ul = document.createElement("ul");
    ul.id = "sent-requests-list";
    ul.style.margin = "0 0 10px 0";
    ul.style.padding = "0";
    ul.style.listStyle = "none";
    friendsList.parentNode.insertBefore(ul, friendsList);
  }

  // 친구 추가 버튼
  addFriendBtn.addEventListener("click", async () => {
    if (addFriendBtn.disabled) return;
    const friendEmail = friendInput.value.trim();
    if (!friendEmail) return;
    addFriendBtn.disabled = true;
    try {
      await sendFriendRequest(friendEmail);
    } finally {
      addFriendBtn.disabled = false;
      friendInput.value = "";
      await renderFriendsList();
      await updateRequestBadge();
      await renderSentRequestsList();
    }
  });
  friendInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (friendInput.value.trim()) {
        addFriendBtn.click();
      }
    }
  });

  // 받은 친구요청 보기 버튼 (모달 오픈)
  showRequestsBtn.addEventListener("click", async () => {
    if (requestsModal) requestsModal.style.display = "flex";
    const requestsList = document.getElementById("requests-list");
    if (requestsList) {
      requestsList.innerHTML = "";
      let received = await getReceivedRequests();
      // 중복 이메일 제거
      const uniqueMap = new Map();
      received.forEach(req => {
        if (req.email && !uniqueMap.has(req.email)) {
          uniqueMap.set(req.email, req);
        }
      });
      const uniqueReceived = Array.from(uniqueMap.values());
      uniqueReceived.forEach(req => {
        const li = document.createElement("li");
        li.className = "friend-item";
        li.innerHTML = `
          <span>${req.email}</span>
          <button class="accept-request-btn" style="margin-top:6px; padding: 6px 12px; border-radius: 14px; border: none; background: #ffe08a; color: #333; cursor: pointer; font-size: 15px; font-weight: 500;">수락</button>
        `;
        const acceptBtn = li.querySelector(".accept-request-btn");
        acceptBtn.addEventListener("click", async () => {
          await acceptFriendRequest(req.uid);
          await renderFriendsList();
          if (requestsModal) requestsModal.style.display = "none";
          await updateRequestBadge();
          await renderSentRequestsList();
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
  renderSentRequestsList();
  updateRequestBadge();
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
      <div style="display: flex; flex-direction: column; align-items: flex-start; width: 100%; gap: 2px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${profileUrl}" style="width:40px; height:40px; border-radius:50%; vertical-align:middle; cursor:pointer;" onerror="this.onerror=null;this.src='https://www.gravatar.com/avatar/?d=mp';">
          <span style="font-weight:bold; cursor:pointer; white-space:nowrap;">${displayName}</span>
          <button class="delete-friend-btn" style="background:#ffb3b3; color:#fff; border:none; border-radius:8px; padding:2px 10px; cursor:pointer; font-size:13px; min-width:60px;">삭제</button>
        </div>
        <span style="color:#888; font-size:13px; white-space:nowrap; margin-left:50px;">${email}</span>
      </div>
    `;
    // 프로필 이미지/이름 클릭 시 친구 달력 뷰로 이동
    li.querySelector('img').addEventListener('click', () => window.showFriendCalendar(friend));
    li.querySelector('span').addEventListener('click', () => window.showFriendCalendar(friend));
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

// 내가 보낸 친구요청 목록 렌더링
async function renderSentRequestsList() {
  const userInfoRoot = document.getElementById("user-info") || document;
  const sentRequestsList = userInfoRoot.querySelector("#sent-requests-list");
  if (!sentRequestsList) return;
  sentRequestsList.innerHTML = "";
  const requests = await getMyFriendRequests();
  if (requests.length === 0) {
    sentRequestsList.style.display = "none";
    return;
  }
  sentRequestsList.style.display = "block";
  requests.forEach(req => {
    const li = document.createElement("li");
    li.className = "sent-request-item";
    li.style.marginBottom = "6px";
    li.innerHTML = `
      <span style="color:#888; font-size:14px;">${req.email}</span>
      <span style="margin-left:8px; color:#888; font-size:13px; font-weight:bold;">대기중</span>
      <button class="cancel-request-btn" style="margin-left:10px; background:#ffe08a; color:#333; border:none; border-radius:8px; padding:2px 10px; cursor:pointer; font-size:13px;">요청 취소</button>
    `;
    const cancelBtn = li.querySelector('.cancel-request-btn');
    cancelBtn.addEventListener('click', async () => {
      if (confirm('이 친구요청을 취소하시겠습니까?')) {
        await cancelFriendRequest(req.uid);
        await renderSentRequestsList();
        await updateRequestBadge();
      }
    });
    sentRequestsList.appendChild(li);
  });
}

// DOMContentLoaded에서 initializeFriendsList를 호출하지 않음
// document.addEventListener("DOMContentLoaded", initializeFriendsList); 
window.initializeFriendsList = initializeFriendsList; 

// 받은 친구요청 개수 뱃지 표시
async function updateRequestBadge() {
  const showRequestsBtn = document.getElementById("show-requests-btn");
  if (!showRequestsBtn) return;
  const received = await getReceivedRequests();
  // 중복 이메일 제거
  const uniqueEmails = new Set(received.map(r => r.email));
  const count = uniqueEmails.size;
  let badge = showRequestsBtn.querySelector('.request-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'request-badge';
    badge.style.cssText = 'display:inline-block; min-width:22px; height:22px; background:#ffe08a; color:#333; border-radius:50%; font-size:14px; font-weight:bold; text-align:center; line-height:22px; margin-left:6px; vertical-align:middle;';
    showRequestsBtn.appendChild(badge);
  }
  badge.textContent = count > 0 ? count : '';
  badge.style.display = count > 0 ? 'inline-block' : 'none';
}
// 최초 1회, 그리고 친구목록 갱신 시마다 호출
updateRequestBadge();
window.updateRequestBadge = updateRequestBadge; 

// 친구 달력 뷰로 전환 및 데이터 로드
window.showFriendCalendar = async function(friend) {
  document.getElementById('user-info').style.display = 'none';
  document.getElementById('friend-home').style.display = 'block';
  // Firestore에서 최신 이름을 가져와서 표시
  let displayName = friend.name;
  try {
    const docSnap = await getDoc(doc(db, "users", friend.uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.name && data.name.trim() !== "") displayName = data.name;
    }
  } catch (e) {}
  document.getElementById('friend-name').textContent = (displayName && displayName.trim() !== "") ? displayName : (friend.email || '친구');
  if (window.loadFriendCalendar) {
    await window.loadFriendCalendar(friend.uid);
  }
}; 

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('back-to-plus');
  if (backBtn) {
    backBtn.onclick = function() {
      document.getElementById('friend-home').style.display = 'none';
      document.getElementById('user-info').style.display = 'block';
      if (window.initializeCalendar) window.initializeCalendar();
    };
  }
}); 