function initializeFriendsList() {
  const friendsList = document.getElementById("friends-list");
  const addFriendBtn = document.getElementById("add-friend-btn");
  const friendInput = document.getElementById("friend-input");

  // 요소가 존재하는지 확인
  if (!friendsList || !addFriendBtn || !friendInput) {
    console.log("친구 목록 관련 요소를 찾을 수 없습니다.");
    return;
  }

  // 친구 추가 버튼 클릭 이벤트
  addFriendBtn.addEventListener("click", () => {
    const friendName = friendInput.value.trim();
    if (!friendName) return;

    const li = document.createElement("li");
    li.className = "friend-item";
    li.innerHTML = `
      <span>${friendName}</span>
      <button class="delete-friend-btn">❌</button>
    `;

    const deleteBtn = li.querySelector(".delete-friend-btn");
    deleteBtn.addEventListener("click", () => {
      li.remove();
      saveFriendsList();
    });

    friendsList.appendChild(li);
    friendInput.value = "";
    saveFriendsList();
  });

  // Enter 키 이벤트
  friendInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addFriendBtn.click();
    }
  });

  // 저장된 친구 목록 불러오기
  loadFriendsList();
}

function saveFriendsList() {
  const friendsList = document.getElementById("friends-list");
  if (!friendsList) return;

  const friends = Array.from(friendsList.children).map(li => ({
    name: li.querySelector("span").textContent
  }));
  localStorage.setItem("friends", JSON.stringify(friends));
}

function loadFriendsList() {
  const friendsList = document.getElementById("friends-list");
  if (!friendsList) return;

  const savedFriends = JSON.parse(localStorage.getItem("friends") || "[]");

  friendsList.innerHTML = "";
  savedFriends.forEach(friend => {
    const li = document.createElement("li");
    li.className = "friend-item";
    li.innerHTML = `
      <span>${friend.name}</span>
      <button class="delete-friend-btn">❌</button>
    `;

    const deleteBtn = li.querySelector(".delete-friend-btn");
    deleteBtn.addEventListener("click", () => {
      li.remove();
      saveFriendsList();
    });

    friendsList.appendChild(li);
  });
}

// 친구 목록 초기화
document.addEventListener("DOMContentLoaded", initializeFriendsList); 