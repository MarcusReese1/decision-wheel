const palette = [
  "#fb6b4a",
  "#f8cb65",
  "#74c9af",
  "#7786dd",
  "#d98dcc",
  "#91c85c",
  "#ef8c5d",
  "#64acd3",
];

let choices = ["Pizza", "Tacos", "Sushi", "Burgers"];

const form = document.querySelector("#choice-form");
const input = document.querySelector("#choice-input");
const message = document.querySelector("#form-message");
const list = document.querySelector("#choice-list");
const count = document.querySelector("#choice-count");
const wheel = document.querySelector("#wheel");
const wheelLabels = document.querySelector("#wheel-labels");
const spinButton = document.querySelector("#spin-button");
const spinStatus = document.querySelector("#spin-status");

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function buildWheelGradient() {
  if (choices.length === 0) {
    return "conic-gradient(#e6e4dc 0 100%)";
  }

  const sectionSize = 100 / choices.length;

  return `conic-gradient(${choices
    .map((_, index) => {
      const start = (index * sectionSize).toFixed(3);
      const end = ((index + 1) * sectionSize).toFixed(3);
      return `${palette[index % palette.length]} ${start}% ${end}%`;
    })
    .join(", ")})`;
}

function renderWheel() {
  wheel.style.background = buildWheelGradient();
  wheelLabels.innerHTML = "";

  choices.forEach((choice, index) => {
    const sectionAngle = 360 / choices.length;
    const centerAngle = sectionAngle * index + sectionAngle / 2;
    const label = document.createElement("div");

    label.className = "wheel-label";
    label.style.setProperty("--label-angle", `${centerAngle}deg`);
    label.innerHTML = `<span>${escapeHtml(choice)}</span>`;
    wheelLabels.append(label);
  });

  const description = choices.length
    ? `Decision wheel containing ${choices.join(", ")}`
    : "Empty decision wheel";
  wheel.setAttribute("aria-label", description);
}

function renderChoices() {
  list.innerHTML = "";

  choices.forEach((choice, index) => {
    const item = document.createElement("li");
    const color = palette[index % palette.length];

    item.className = "choice-item";
    item.style.setProperty("--choice-color", color);
    item.innerHTML = `
      <span class="color-dot" aria-hidden="true"></span>
      <span class="choice-name">${escapeHtml(choice)}</span>
      <button
        class="remove-button"
        type="button"
        data-index="${index}"
        aria-label="Remove ${escapeHtml(choice)}"
        title="Remove ${escapeHtml(choice)}"
      >×</button>
    `;
    list.append(item);
  });

  count.textContent = `${choices.length} ${choices.length === 1 ? "choice" : "choices"}`;
  renderWheel();
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const newChoice = input.value.trim();

  if (!newChoice) {
    showMessage("Enter a choice before adding it.", true);
    input.focus();
    return;
  }

  const isDuplicate = choices.some(
    (choice) => choice.toLowerCase() === newChoice.toLowerCase(),
  );

  if (isDuplicate) {
    showMessage("That choice is already on the wheel.", true);
    input.select();
    return;
  }

  if (choices.length >= 12) {
    showMessage("The wheel supports up to 12 choices.", true);
    return;
  }

  choices.push(newChoice);
  input.value = "";
  showMessage(`Added “${newChoice}” to the wheel.`);
  renderChoices();
  input.focus();
});

list.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-button");

  if (!removeButton) {
    return;
  }

  const index = Number(removeButton.dataset.index);
  const [removedChoice] = choices.splice(index, 1);

  showMessage(`Removed “${removedChoice}” from the wheel.`);
  renderChoices();
});

let currentRotation = 0;
let isSpinning = false;

spinButton.addEventListener("click", () => {
  if (choices.length < 2) {
    spinStatus.textContent = "Add at least two choices before spinning.";
    return;
  }

  if (isSpinning) {
    return;
  }

  isSpinning = true;
  spinButton.disabled = true;
  spinStatus.textContent = "Spinning...";

  const winnerIndex = Math.floor(Math.random() * choices.length);
  const sectionAngle = 360 / choices.length;
  const winnerCenterAngle =
    winnerIndex * sectionAngle + sectionAngle / 2;

  const extraSpins = 5 * 360;

  const targetRotation =
    currentRotation +
    extraSpins +
    (360 - winnerCenterAngle);

  currentRotation = targetRotation;

  wheel.style.transition = "transform 3s ease-out";
  wheel.style.transform = `rotate(${targetRotation}deg)`;

  setTimeout(() => {
    spinStatus.textContent = `🎉 Winner: ${choices[winnerIndex]}!`;
    spinButton.disabled = false;
    isSpinning = false;
  }, 3000);
});

renderChoices();
