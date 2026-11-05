const screens = [...document.querySelectorAll(".screen")];
const cropChoices = document.querySelector("#crop-choices");
const customCrop = document.querySelector("#custom-crop");
const continueIntakeButton = document.querySelector("#continue-intake-button");
const selectedCropLabel = document.querySelector("#selected-crop-label");
const analysisSummary = document.querySelector("#analysis-summary");
const resultVisual = document.querySelector("#result-visual");
const resultDescription = document.querySelector("#result-description");
const photoInput = document.querySelector("#photo-input");

const record = {
  crop: "",
  onset: "",
  part: "",
  signs: [],
  other: "",
  hasPhoto: false,
};

function showScreen(screenId) {
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
}

function getCropName() {
  return record.crop === "기타" ? customCrop.value.trim() || "기타 작물" : record.crop;
}

function renderSummary(lines) {
  analysisSummary.replaceChildren(
    ...lines.map(([label, value]) => {
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

function analyzeRecord() {
  const signs = record.signs;
  const hasHighSignal = signs.some((sign) => ["곰팡이", "썩음", "시듦"].includes(sign));
  const hasSpreadSignal = signs.includes("반점") && signs.includes("잎 말림");
  const isLong = record.onset === "일주일 전";
  const risk = hasHighSignal || (hasSpreadSignal && isLong) ? "빠른 확인 필요" : "관찰 필요";
  const title = risk === "빠른 확인 필요" ? "작물 상태를 빠르게 확인해주세요" : "변화를 기록해두고 관찰해주세요";
  const possibleCause = hasHighSignal
    ? "곰팡이성 병해 또는 생육 스트레스 가능성"
    : hasSpreadSignal
      ? "잎의 병해·해충 피해 가능성"
      : "해충 피해 또는 환경 스트레스 가능성";
  const actions = risk === "빠른 확인 필요"
    ? "영향받은 부위를 따로 확인하고, 주변으로 번지는지 오늘 안에 농업기술센터에 문의하세요."
    : "같은 부위의 변화를 24시간 뒤 다시 확인하고, 사진과 함께 기록을 남겨두세요.";

  resultVisual.textContent = risk === "빠른 확인 필요" ? "!" : "△";
  resultVisual.classList.toggle("help-visual", risk === "빠른 확인 필요");
  resultDescription.textContent = "입력한 증상과 공개 병해충 정보의 분류 항목을 참고한 시범 분석입니다.";
  renderSummary([
    ["작물", getCropName()],
    ["위험도", risk],
    ["가능성", possibleCause],
    ["먼저 할 일", actions],
    ["기록 정보", `${record.onset} · ${record.part} · ${signs.join(", ")}`],
  ]);
  document.querySelector("#result-title").textContent = title;
  showScreen("result-screen");
}

document.querySelector("#start-button").addEventListener("click", () => showScreen("intake-screen"));
document.querySelector("#start-analysis-button").addEventListener("click", () => showScreen("intake-screen"));

cropChoices.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-crop]");
  if (!button) return;
  record.crop = button.dataset.crop;
  selectSingle(cropChoices, button);
  customCrop.hidden = record.crop !== "기타";
  continueIntakeButton.disabled = !record.crop;
});

customCrop.addEventListener("input", () => {
  continueIntakeButton.disabled = !record.crop;
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
