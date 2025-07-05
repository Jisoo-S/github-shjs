// 모달 관련 상수
const MODAL_TYPES = {
  INFO: "info",
  CONFIRM: "confirm",
  INPUT: "input",
  CUSTOM: "custom"
};
 
// 모달 스타일 관련 상수
const MODAL_STYLES = {
  OVERLAY: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  CONTENT: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    maxWidth: "90%"
  },
  TITLE: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    textAlign: "center"
  },
  MESSAGE: {
    marginBottom: "20px",
    textAlign: "center"
  },
  INPUT: {
    width: "100%",
    padding: "8px",
    marginBottom: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px"
  },
  BUTTON_CONTAINER: {
    display: "flex",
    justifyContent: "center",
    gap: "10px"
  },
  BUTTON: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    color: "white"
  },
  CONFIRM_BUTTON: {
    backgroundColor: "#4CAF50"
  },
  CANCEL_BUTTON: {
    backgroundColor: "#f44336"
  }
};

// 모달 클래스
class Modal {
  constructor(options = {}) {
    this.options = {
      type: MODAL_TYPES.INFO,
      title: "",
      message: "",
      showInput: false,
      inputType: "text",
      inputPlaceholder: "",
      confirmText: "확인",
      cancelText: "취소",
      onConfirm: null,
      onCancel: null,
      ...options
    };

    this.modal = null;
    this.input = null;
  }
 
  create() {
    // 모달 오버레이 생성
    this.modal = document.createElement("div");
    Object.assign(this.modal.style, MODAL_STYLES.OVERLAY);

    // 모달 컨텐츠 생성
    const content = document.createElement("div");
    Object.assign(content.style, MODAL_STYLES.CONTENT);

    // 제목 생성
    if (this.options.title) {
      const title = document.createElement("h3");
      title.textContent = this.options.title;
      Object.assign(title.style, MODAL_STYLES.TITLE);
      content.appendChild(title);
    }

    // 메시지 생성
    if (this.options.message) {
      const message = document.createElement("p");
      message.innerHTML = this.options.message;
      Object.assign(message.style, MODAL_STYLES.MESSAGE);
      content.appendChild(message);
    }

    // 입력 필드 생성
    if (this.options.showInput) {
      this.input = document.createElement("input");
      this.input.type = this.options.inputType;
      this.input.placeholder = this.options.inputPlaceholder;
      Object.assign(this.input.style, MODAL_STYLES.INPUT);
      content.appendChild(this.input);
    }

    // 버튼 컨테이너 생성
    const buttonContainer = document.createElement("div");
    Object.assign(buttonContainer.style, MODAL_STYLES.BUTTON_CONTAINER);

    // 확인 버튼 생성
    const confirmButton = document.createElement("button");
    confirmButton.textContent = this.options.confirmText;
    Object.assign(confirmButton.style, MODAL_STYLES.BUTTON, MODAL_STYLES.CONFIRM_BUTTON);
    confirmButton.onclick = () => this.handleConfirm();
    buttonContainer.appendChild(confirmButton);

    // 취소 버튼 생성 (confirm 타입일 때만)
    if (this.options.type === MODAL_TYPES.CONFIRM) {
      const cancelButton = document.createElement("button");
      cancelButton.textContent = this.options.cancelText;
      Object.assign(cancelButton.style, MODAL_STYLES.BUTTON, MODAL_STYLES.CANCEL_BUTTON);
      cancelButton.onclick = () => this.handleCancel();
      buttonContainer.appendChild(cancelButton);
    }

    content.appendChild(buttonContainer);
    this.modal.appendChild(content);
    document.body.appendChild(this.modal);

    // 오버레이 클릭 시 닫기 (ESC와 동일하게)
    this.modal.addEventListener("mousedown", (e) => {
      if (e.target === this.modal) {
        this.handleCancel();
      }
    });

    // 입력 필드가 있다면 포커스
    if (this.input) {
      this.input.focus();
    }

    // ESC 키 이벤트 리스너
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  handleConfirm() {
    const value = this.input ? this.input.value : true;
    if (this.options.onConfirm) {
      this.options.onConfirm(value);
    }
    this.close();
  }

  handleCancel() {
    if (this.options.onCancel) {
      this.options.onCancel();
    }
    this.close();
  }

  handleKeyDown(e) {
    if (e.key === "Escape") {
      this.handleCancel();
    } else if (e.key === "Enter" && this.input) {
      this.handleConfirm();
    }
  }

  close() {
    if (this.modal && this.modal.parentNode) {
      document.body.removeChild(this.modal);
      document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    }
  }
}

// 모달 생성 함수
function createModal(options) {
  const modal = new Modal(options);
  modal.create();
  return modal;
}

// 간단한 알림 모달
function showInfoModal(message, callback) {
  return createModal({
    type: MODAL_TYPES.INFO,
    message,
    onConfirm: callback
  });
}

// 확인 모달
function showConfirmModal(message, onConfirm, onCancel) {
  return createModal({
    type: MODAL_TYPES.CONFIRM,
    message,
    onConfirm,
    onCancel
  });
}

// 입력 모달
function showInputModal(message, onConfirm, onCancel) {
  return createModal({
    type: MODAL_TYPES.INPUT,
    message,
    showInput: true,
    onConfirm,
    onCancel
  });
}

// 커스텀 모달
function showCustomModal(options) {
  return createModal({
    type: MODAL_TYPES.CUSTOM,
    ...options
  });
} 