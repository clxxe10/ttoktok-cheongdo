const statuses = [
  { label: "괜찮아요", state: 0 },
  { label: "조금 불편해요", state: 1 },
  { label: "아파요", state: 2 },
  { label: "도움이 필요해요", state: 3 },
  { label: "오늘 기록하기", state: 4 },
];

const screens = [...document.querySelectorAll(".screen")];
const statusButton = document.querySelector("#status-button");
const nextButton = document.querySelector("#next-button");
const statusLabel = document.querySelector("#status-label");
const statusSaveNote = document.querySelector("#status-save-note");
const progressDots = [...document.querySelectorAll(".progress-dot")];
const progressContainer = document.querySelector("#progress-dots");
const symptomSummary = document.querySelector("#symptom-summary");
const symptomFlow = document.querySelector("#symptom-flow");
const recentHomeRecord = document.querySelector("#recent-home-record");
const guardianStatusValue = document.querySelector("#guardian-status-value");
const recentStatusValue = document.querySelector("#recent-status-value");
const recentLifeValue = document.querySelector("#recent-life-value");
const recentMemoValue = document.querySelector("#recent-memo-value");
const memoInput = document.querySelector("#memo-input");
const memoResult = document.querySelector("#memo-result");

let currentStatusIndex = 0;
let symptomData = {
  location: "",
  pain: "",
  detail: "",
};
const latestRecord = {
  status: "괜찮아요",
  life: "아직 기록 없음",
  memo: "아직 기록 없음",
};

function showScreen(screenId) {
  screens.forEach((screen) => {
    const isActive = screen.id === screenId;
    screen.hidden = !isActive;
    screen.classList.toggle("is-active", isActive);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showNextStatus() {
  currentStatusIndex = (currentStatusIndex + 1) % statuses.length;
  updateStatus();
}

function updateStatus() {
  const currentStatus = statuses[currentStatusIndex];

  statusSaveNote.hidden = true;
  statusLabel.textContent = currentStatus.label;
  statusButton.dataset.state = currentStatusIndex;
  statusButton.setAttribute(
    "aria-label",
    `현재 상태: ${currentStatus.label}. 눌러서 다음 상태 보기`,
  );
  progressContainer.setAttribute(
    "aria-label",
    `상태 진행 ${currentStatusIndex + 1} / ${statuses.length}`,
  );

  progressDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === currentStatusIndex);
  });
}

function renderLatestRecord() {
  recentHomeRecord.textContent = `${latestRecord.status} · 오늘`;
  guardianStatusValue.textContent = latestRecord.status;
  recentStatusValue.textContent = latestRecord.status;
  recentLifeValue.textContent = latestRecord.life;
  recentMemoValue.textContent = latestRecord.memo;
}

function handleNextAction() {
  statusSaveNote.hidden = true;

  if (currentStatusIndex === 0) {
    latestRecord.status = statuses[currentStatusIndex].label;
    renderLatestRecord();
    statusSaveNote.hidden = false;
    return;
  }

  if (currentStatusIndex === 1 || currentStatusIndex === 2) {
    resetSymptomFlow();
    showScreen("symptom-screen");
    return;
  }

  if (currentStatusIndex === 3) {
    showScreen("help-screen");
    return;
  }

  if (currentStatusIndex === 4) {
    showScreen("memo-screen");
  }
}

function resetSymptomFlow() {
  symptomData = { location: "", pain: "", detail: "" };
  document.querySelector('[data-question="location"]').hidden = false;
  document.querySelector("#pain-step").hidden = true;
  document.querySelector("#detail-step").hidden = true;
  document.querySelector("#symptom-detail").value = "";
  document.querySelectorAll(".choice-group button").forEach((button) => {
    button.classList.remove("is-selected");
  });
}

function renderSymptomSummary() {
  const detail = symptomData.detail.trim() || "추가 설명 없음";
  const summaryItems = [
    ["불편한 곳", symptomData.location],
    ["느낌", symptomData.pain],
    ["추가 내용", detail],
  ];

  symptomSummary.replaceChildren(
    ...summaryItems.map(([label, value]) => {
      const line = document.createElement("div");
      const labelElement = document.createElement("span");
      const valueElement = document.createElement("strong");

      line.className = "summary-line";
      labelElement.textContent = label;
      valueElement.textContent = value;
      line.append(labelElement, valueElement);
      return line;
    }),
  );
}

statusButton.addEventListener("click", showNextStatus);
nextButton.addEventListener("click", handleNextAction);

document.querySelectorAll("[data-home]").forEach((button) => {
  button.addEventListener("click", () => showScreen("home-screen"));
});

document.querySelectorAll("[data-screen]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.screen));
});

symptomFlow.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-value]");
  if (!button) {
    return;
  }

  const group = button.closest(".choice-group");
  group.querySelectorAll("button").forEach((choice) => {
    choice.classList.toggle("is-selected", choice === button);
  });

  if (group.dataset.question === "location") {
    symptomData.location = button.dataset.value;
    group.hidden = true;
    document.querySelector("#pain-step").hidden = false;
    return;
  }

  symptomData.pain = button.dataset.value;
  document.querySelector("#pain-step").hidden = true;
  document.querySelector("#detail-step").hidden = false;
  document.querySelector("#symptom-detail").focus();
});

document.querySelector("#symptom-record-button").addEventListener("click", () => {
  symptomData.detail = document.querySelector("#symptom-detail").value;
  renderSymptomSummary();
  showScreen("symptom-result-screen");
});

document.querySelector("#notify-guardian-button").addEventListener("click", (event) => {
  event.currentTarget.textContent = "알림 내용을 준비했어요";
  event.currentTarget.disabled = true;
});

document.querySelector("#save-symptom-button").addEventListener("click", (event) => {
  latestRecord.status = statuses[currentStatusIndex].label;
  latestRecord.life = `${symptomData.location} · ${symptomData.pain}`;
  renderLatestRecord();
  event.currentTarget.textContent = "기록을 저장했어요";
  event.currentTarget.disabled = true;
  showScreen("home-screen");
});

document.querySelector("#organize-memo-button").addEventListener("click", () => {
  const memo = memoInput.value.trim();
  memoResult.querySelector("p:last-child").textContent = memo
    ? `오늘은 “${memo}”라고 기록했어요.`
    : "아직 입력한 내용이 없어, 오늘의 이야기를 먼저 적어주세요.";
  memoResult.hidden = false;
});

document.querySelector("#save-memo-button").addEventListener("click", (event) => {
  const memo = memoInput.value.trim();
  latestRecord.memo = memo || "짧은 메모를 남겼어요";
  renderLatestRecord();
  event.currentTarget.textContent = "메모를 저장했어요";
  event.currentTarget.disabled = true;
  showScreen("home-screen");
});

document.querySelector("#request-help-button").addEventListener("click", (event) => {
  event.currentTarget.textContent = "도움 요청 내용을 준비했어요";
  event.currentTarget.disabled = true;
  document.querySelector("#help-feedback").hidden = false;
});
