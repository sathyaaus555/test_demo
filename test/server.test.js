const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer, students } = require("../server");

let server;
let baseUrl;

test.before(async () => {
  students.length = 0;
  server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise(resolve => server.close(resolve)));

async function register(payload) {
  return fetch(`${baseUrl}/api/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

test("registers a valid student", async () => {
  const response = await register({
    name: "Maya Chen",
    email: "maya@example.com",
    course: "Software Engineering"
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.student.email, "maya@example.com");
});

test("rejects empty data", async () => {
  const response = await register({ name: "", email: "", course: "" });
  assert.equal(response.status, 400);
});

test("rejects an invalid email", async () => {
  const response = await register({
    name: "Noah",
    email: "not-an-email",
    course: "Data Science"
  });
  assert.equal(response.status, 400);
});

test("rejects a duplicate registration", async () => {
  const payload = {
    name: "Maya Chen",
    email: "maya@example.com",
    course: "Software Engineering"
  };
  const response = await register(payload);
  assert.equal(response.status, 409);
});
