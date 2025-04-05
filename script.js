function addTodo() {
  const input = document.getElementById("todo-input");
  const value = input.value.trim();
  if (!value) return;

  const list = document.getElementById("todo-list");

  const li = document.createElement("li");

  const left = document.createElement("div");
  left.className = "todo-left";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.addEventListener("change", () => {
    li.classList.toggle("completed");
  });

  const span = document.createElement("span");
  span.textContent = value;

  left.appendChild(checkbox);
  left.appendChild(span);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.style.border = "none";
  deleteBtn.style.background = "none";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.addEventListener("click", () => {
    li.remove();
  });

  li.appendChild(left);
  li.appendChild(deleteBtn);

  list.appendChild(li);
  input.value = "";
}
// 기존 addTodo 함수는 그대로 두고...

// input 요소에 keyup 이벤트 추가
document.getElementById("todo-input").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    addTodo();
  }
});
