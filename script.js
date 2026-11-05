const screens = [...document.querySelectorAll(".screen")];
const cropChoices = document.querySelector("#crop-choices");
const customCrop = document.querySelector("#custom-crop");
const continueIntakeButton = document.querySelector("#continue-intake-button");
const selectedCropLabel = document.querySelector("#selected-crop-label");
const analysisSummary = document.querySelector("#analysis-summary");
const resultVisual = document.querySelector("#result-visual");
const resultDescription = document.querySelector("#result-description");
const photoInput = document.querySelector("#photo-input");
const copySummaryButton = document.querySelector("#copy-summary-button");
const copyStatus = document.querySelector("#copy-status");

const record = {
  crop: "",
  onset: "",
  part: "",
  signs: [],
  other: "",
  hasPhoto: false,
};

function showScreen(screenId) {
  document.querySelector(".app-shell").classList.toggle("has-sub-screen", screenId !== "home-screen");
  document.body.classList.toggle("is-sub-screen", screenId !== "home-screen");
  screens.forEach((screen) => {
    const active = screen.id === screenId;
    screen.hidden = !active;
    screen.classList.toggle("is-active", active);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectSingle(group, selectedButton) {
  group.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("is-selected", button === selectedButton);
  });
}

function resetRecord() {
  record.crop = "";
  record.onset = "";
  record.part = "";
  record.signs = [];
  record.other = "";
  record.hasPhoto = false;
  document.querySelectorAll(".choice-group button").forEach((button) => {
    button.classList.remove("is-selected");
  });
  customCrop.value = "";
  customCrop.hidden = true;
  photoInput.value = "";
  continueIntakeButton.disabled = true;
  copyStatus.textContent = "";
}

function getCropName() {
  return record.crop === "기타" ? customCrop.value.trim() || "기타 작물" : record.crop;
}

function updateCropContinueState() {
  const hasCustomName = record.crop !== "기타" || customCrop.value.trim().length > 0;
  continueIntakeButton.disabled = !record.crop || !hasCustomName;
}

function renderSummary(lines) {
  analysisSummary.replaceChildren(
    ...lines.map(([label, value]) => {
      const line = document.createElement("div");
      const labelElement = document.createElement("span");
      line.className = "summary-line";
      labelElement.textContent = label;
      line.append(labelElement);

      if (label === "지금 할 일") {
        const actionList = document.createElement("ol");
        actionList.className = "action-timeline";
        value
          .split(/\s(?=\d+\))/)
          .map((action) => action.replace(/^\d+\)\s*/, "").trim())
          .filter(Boolean)
          .forEach((action) => {
            const actionItem = document.createElement("li");
            actionItem.textContent = action;
            actionList.append(actionItem);
          });
        line.append(actionList);
      } else {
        const valueElement = document.createElement("strong");
        valueElement.textContent = value;
        line.append(valueElement);
      }
      return line;
    }),
  );
}

function analyzeRecord() {
  const signs = record.signs;
  const hasHighSignal = signs.some((sign) => ["곰팡이", "썩음", "시듦"].includes(sign));
  const hasSpreadSignal = signs.includes("반점") && signs.includes("잎 말림");
  const isLong = record.onset === "일주일 전";
  const risk = hasHighSignal || (hasSpreadSignal && isLong) ? "빠른 확인 필요" : "관찰 필요";
  const title = risk === "빠른 확인 필요"
    ? "지금 한 번 더 자세히 확인해 주세요"
    : "우선 기록하고 하루 동안 관찰해 주세요";
  const possibleCause = hasHighSignal
    ? "곰팡이·썩음·시듦과 비슷한 변화가 함께 보여 빠른 확인이 필요할 수 있어요."
    : hasSpreadSignal
      ? "반점과 잎 말림이 함께 있어 잎의 병해나 해충 피해 가능성을 확인해보세요."
      : "벌레나 물·온도 변화 때문에 생긴 스트레스 가능성을 먼저 확인해보세요.";
  const actions = risk === "빠른 확인 필요"
    ? "1) 영향을 받은 잎·열매를 주변과 비교해 보세요. 2) 물을 과하게 주거나 잎에 물을 뿌리는 것은 잠시 피하세요. 3) 오늘 안에 사진과 함께 농업기술센터에 문의하세요."
    : "1) 같은 부위를 가까이서 사진으로 남기세요. 2) 물주기·비료·날씨가 평소와 달랐는지 메모하세요. 3) 내일 같은 시간에 번짐이나 새 증상이 있는지 다시 보세요.";
  const followUp = risk === "빠른 확인 필요"
    ? "주변 잎이나 열매에도 같은 변화가 생기는지 확인하세요. 번지면 혼자 판단하지 말고 도움을 받으세요."
    : "색이 더 진해지거나 범위가 넓어지면 다시 기록하고, 위험도가 올라갈 수 있어요.";
  const summaryText = [
    `작물: ${getCropName()}`,
    `현재 판단: ${risk}`,
    `왜 이렇게 보이나요?: ${possibleCause}`,
    `지금 할 일: ${actions}`,
    `다음 확인: ${followUp}`,
  ].join("\n");

  resultVisual.textContent = risk === "빠른 확인 필요" ? "!" : "△";
  resultVisual.classList.toggle("help-visual", risk === "빠른 확인 필요");
  resultDescription.textContent = "진단이 아니라, 입력한 정보를 바탕으로 지금 먼저 할 일을 정리한 안내입니다.";
  resultDescription.dataset.summary = summaryText;
  renderSummary([
    ["작물", getCropName()],
    ["현재 판단", risk],
    ["왜 이렇게 보이나요?", possibleCause],
    ["지금 할 일", actions],
    ["다음 확인", followUp],
  ]);
  document.querySelector("#result-title").textContent = title;
  showScreen("result-screen");
}

document.querySelector("#start-button").addEventListener("click", () => showScreen("intake-screen"));

cropChoices.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-crop]");
  if (!button) return;
  record.crop = button.dataset.crop;
  selectSingle(cropChoices, button);
  customCrop.hidden = record.crop !== "기타";
  updateCropContinueState();
});

customCrop.addEventListener("input", () => {
  updateCropContinueState();
});

continueIntakeButton.addEventListener("click", () => {
  selectedCropLabel.textContent = `${getCropName()} 이상 기록`;
  showScreen("detail-screen");
});

document.querySelector("#onset-choices").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-onset]");
  if (!button) return;
  record.onset = button.dataset.onset;
  selectSingle(document.querySelector("#onset-choices"), button);
});

document.querySelector("#part-choices").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-part]");
  if (!button) return;
  record.part = button.dataset.part;
  selectSingle(document.querySelector("#part-choices"), button);
});

document.querySelector("#sign-choices").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-sign]");
  if (!button) return;
  const sign = button.dataset.sign;
  button.classList.toggle("is-selected");
  record.signs = record.signs.includes(sign)
    ? record.signs.filter((item) => item !== sign)
    : [...record.signs, sign];
});

photoInput.addEventListener("change", () => {
  record.hasPhoto = photoInput.files.length > 0;
});

document.querySelector("#analyze-button").addEventListener("click", () => {
  record.other = document.querySelector("#other-sign").value.trim();
  record.signs = record.signs.filter((sign) => !sign.startsWith("기타:"));
  if (record.other) record.signs = [...record.signs, `기타: ${record.other}`];
  if (!record.onset || !record.part || record.signs.length === 0) {
    window.alert("발생 시점, 부위, 증상을 하나 이상 선택해주세요.");
    return;
  }
  analyzeRecord();
});

document.querySelector("#new-analysis-button").addEventListener("click", () => {
  resetRecord();
  showScreen("intake-screen");
});

copySummaryButton.addEventListener("click", async () => {
  const summary = resultDescription.dataset.summary;
  if (!summary) return;

  try {
    await navigator.clipboard.writeText(summary);
    copyStatus.textContent = "문의용 요약을 복사했어요.";
  } catch {
    copyStatus.textContent = "자동 복사가 막혀 있어요. 결과 내용을 직접 선택해 복사해주세요.";
  }
});

document.querySelector("#source-button").addEventListener("click", () => showScreen("source-screen"));

document.querySelectorAll("[data-home]").forEach((button) => {
  button.addEventListener("click", () => {
    resetRecord();
    showScreen("home-screen");
  });
});

document.querySelectorAll("[data-screen]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.screen));
});
