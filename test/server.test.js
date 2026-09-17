const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer, resetAccounts } = require("../server");

let server;
let baseUrl;

test.before(async () => {
  server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
test.beforeEach(() => resetAccounts());
test.after(() => new Promise(resolve => server.close(resolve)));

async function transfer(payload) {
  return fetch(`${baseUrl}/api/transfer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}

test("logs in with valid credentials", async () => {
  const response = await fetch(`${baseUrl}/api/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: "demo", password: "demo123" }) });
  assert.equal(response.status, 200);
});

test("starts with the two required account balances", async () => {
  const response = await fetch(`${baseUrl}/api/accounts`);
  const body = await response.json();
  assert.deepEqual(body.accounts.map(({ id, balance }) => ({ id, balance })), [{ id: "ACC001", balance: 1000 }, { id: "PAY001", balance: 500 }]);
});

test("transfers money and returns updated balances", async () => {
  const response = await transfer({ fromAccount: "ACC001", toAccount: "PAY001", amount: 250 });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.message, "Transfer Successful");
  assert.deepEqual(body.accounts.map(({ balance }) => balance), [750, 750]);
});

for (const [name, payload, message] of [
  ["rejects zero amounts", { fromAccount: "ACC001", toAccount: "PAY001", amount: 0 }, "greater than zero"],
  ["rejects insufficient funds", { fromAccount: "ACC001", toAccount: "PAY001", amount: 1500 }, "exceeds"],
  ["rejects matching accounts", { fromAccount: "ACC001", toAccount: "ACC001", amount: 10 }, "must be different"]
]) {
  test(name, async () => {
    const response = await transfer(payload);
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.match(body.message, new RegExp(message, "i"));
  });
}
