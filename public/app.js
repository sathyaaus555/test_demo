const form = document.querySelector("#registration-form");
const message = document.querySelector("#message");
const button = form.querySelector("button");

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  button.disabled = true;
  showMessage("Checking registration...", "");

  const payload = Object.fromEntries(new FormData(form));

  try {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) {
      return showMessage(`✕ ${result.message}`, "error");
    }

    showMessage(`✓ Welcome, ${result.student.name}! Registration #${result.student.id} confirmed.`, "success");
    form.reset();
  } catch {
    showMessage("✕ The service is unavailable. Please try again.", "error");
  } finally {
    button.disabled = false;
  }
});
