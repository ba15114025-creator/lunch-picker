"use strict";

const form = document.querySelector("#picker-form");
const customBudget = document.querySelector("#custom-budget");
const customAmount = document.querySelector("#custom-amount");
const budgetError = document.querySelector("#budget-error");
const card = document.querySelector("#meal-card");
const resultsStatus = document.querySelector("#results-status");
const resultsArt = document.querySelector("#results-art");
const resultsList = document.querySelector("#results-list");
const menuList = document.querySelector("#menu-list");

function formatPrice(price) {
  return `$${price.toLocaleString("zh-TW")}`;
}

function createMealCard(meal) {
  const element = card.content.firstElementChild.cloneNode(true);
  const art = element.querySelector(".meal-art");
  const price = element.querySelector(".meal-price");
  const note = element.querySelector(".meal-note");
  element.querySelector("h3").textContent = meal.name;

  if (typeof meal.art === "string") {
    art.classList.add("meal-art-file");
    art.style.backgroundImage = `url(${JSON.stringify(meal.art)})`;
  } else {
    // 素材表以四欄排列。缺少專屬圖片時使用最後一格的餐具。
    const index = meal.art ?? 15;
    art.style.setProperty("--art-x", `${(index % 4) / 3 * 100}%`);
    art.style.setProperty("--art-y", `${Math.floor(index / 4) / 3 * 100}%`);
  }

  if (meal.minPrice === null) {
    price.textContent = meal.priceNote;
    note.textContent = "確切價格待補，暫不參與抽選。";
  } else {
    price.textContent = formatPrice(meal.minPrice);
    if (meal.maxPrice !== meal.minPrice) {
      price.textContent += `～${formatPrice(meal.maxPrice)}`;
    }
  }

  note.hidden = !note.textContent;
  return element;
}

function drawMeals(budget) {
  const eligible = meals.filter((meal) => meal.minPrice !== null && meal.minPrice <= budget);

  // 部分 Fisher–Yates 洗牌，每次只抽走仍在候選區的一筆。
  const count = Math.min(3, eligible.length);
  for (let index = 0; index < count; index += 1) {
    const pick = index + Math.floor(Math.random() * (eligible.length - index));
    [eligible[index], eligible[pick]] = [eligible[pick], eligible[index]];
  }
  return eligible.slice(0, count);
}

function clearResults() {
  budgetError.hidden = true;
  budgetError.textContent = "";
  customAmount.removeAttribute("aria-invalid");
  resultsList.replaceChildren();
  resultsList.hidden = true;
  resultsArt.hidden = false;
  resultsStatus.textContent = "選好預算後，按「抽午餐」。";
}

form.addEventListener("change", (event) => {
  if (event.target.name === "budget") {
    customBudget.hidden = event.target.value !== "custom";
    clearResults();
  }
});
customAmount.addEventListener("input", clearResults);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const selection = form.elements.budget.value;
  const amount = selection === "custom" ? customAmount.value.trim() : selection;
  const budget = Number(amount);

  if (!/^\d+$/.test(amount) || !Number.isSafeInteger(budget) || budget < 1) {
    budgetError.textContent = "請輸入大於 0 的整數金額。";
    budgetError.hidden = false;
    customAmount.setAttribute("aria-invalid", "true");
    customAmount.focus();
    return;
  }

  const choices = drawMeals(budget);
  resultsList.replaceChildren(...choices.map(createMealCard));
  resultsList.hidden = choices.length === 0;
  resultsArt.hidden = choices.length > 0;
  resultsStatus.textContent = choices.length
    ? `每人預算 ${formatPrice(budget)}，這輪抽到 ${choices.length} 個選項。`
    : `每人預算 ${formatPrice(budget)}，目前沒有符合的餐點。可以換個金額再試。`;
});

menuList.replaceChildren(...meals.map(createMealCard));
