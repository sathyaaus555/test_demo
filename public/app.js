const loginView = document.querySelector("#login-view");
const dashboardView = document.querySelector("#dashboard-view");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const accountsContainer = document.querySelector("#accounts");
const transferPanel = document.querySelector("#transfer-panel");
const transferForm = document.querySelector("#transfer-form");
const transferMessage = document.querySelector("#transfer-message");
const fromSelect = document.querySelector("#from-account");
const toSelect = document.querySelector("#to-account");
const amountInput = document.querySelector("#amount");
let accounts = [];

const money = value => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value);

function showMessage(element, text, type = "") {
  element.textContent = text;
  element.className = `message ${type}`;
}

function renderAccounts() {
  accountsContainer.innerHTML = accounts.map((account, index) => `
    <article class="account-card ${index === 0 ? "featured" : ""}">
      <div class="account-top"><span>${account.name}</span><span class="pill">DEMO</span></div>
      <div class="account-number">${account.number}</div>
      <div class="balance-label">Available balance</div>
      <div class="balance">${money(account.balance)}</div>
    </article>
  `).join("");

  const options = accounts.map(account => `<option value="${account.id}">${account.name} — ${money(account.balance)}</option>`).join("");
  fromSelect.innerHTML = options;
  toSelect.innerHTML = options;
  fromSelect.value = accounts[0]?.id || "";
  toSelect.value = accounts[1]?.id || "";
}

async function loadAccounts() {
  const response = await fetch("/api/accounts");
  const result = await response.json();
  accounts = result.accounts;
  renderAccounts();
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  showMessage(loginMessage, "Signing in...");
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: document.querySelector("#username").value,
      password: document.querySelector("#password").value
    })
  });
  const result = await response.json();
  if (!response.ok) return showMessage(loginMessage, `✕ ${result.message}`, "error");

  document.querySelector("#customer-name").textContent = result.user.name.split(" ")[0];
  await loadAccounts();
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
});

document.querySelector("#open-transfer").addEventListener("click", () => {
  transferPanel.classList.remove("hidden");
  transferPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  amountInput.focus();
});

document.querySelector("#close-transfer").addEventListener("click", () => transferPanel.classList.add("hidden"));

document.querySelector("#logout").addEventListener("click", () => {
  dashboardView.classList.add("hidden");
  transferPanel.classList.add("hidden");
  loginView.classList.remove("hidden");
  showMessage(loginMessage, "");
});

transferForm.addEventListener("submit", async event => {
  event.preventDefault();
  showMessage(transferMessage, "Processing secure demo transfer...");
  const response = await fetch("/api/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromAccount: fromSelect.value,
      toAccount: toSelect.value,
      amount: amountInput.value
    })
  });
  const result = await response.json();
  if (!response.ok) return showMessage(transferMessage, `✕ ${result.message}`, "error");

  accounts = result.accounts;
  renderAccounts();
  amountInput.value = "";
  showMessage(transferMessage, `✓ Transfer Successful — ${money(result.amount)} moved between your demo accounts. Balances updated.`, "success");
});
