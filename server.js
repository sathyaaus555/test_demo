const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, "public");

const DEMO_USER = { username: "demo", password: "demo123", name: "Alex Morgan" };
const initialAccounts = {
  ACC001: { id: "ACC001", name: "Everyday Account", balance: 1000 },
  ACC002: { id: "ACC002", name: "Savings Account", balance: 500 }
};
let accounts = structuredClone(initialAccounts);

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error("Request is too large."));
    });
    request.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch { reject(new Error("Invalid JSON.")); }
    });
    request.on("error", reject);
  });
}

function accountList() {
  return Object.values(accounts);
}

function serveStatic(request, response) {
  const requestPath = new URL(request.url, "http://localhost").pathname;
  const requested = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const filePath = path.resolve(publicDir, requested);
  if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${path.sep}`)) {
    response.writeHead(403);
    return response.end("Forbidden");
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      return response.end("Not found");
    }
    const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
    response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
    response.end(data);
  });
}

function resetAccounts() {
  accounts = structuredClone(initialAccounts);
}

function createServer() {
  return http.createServer(async (request, response) => {
    if (request.method === "POST" && request.url === "/api/login") {
      try {
        const input = await readBody(request);
        if (input.username !== DEMO_USER.username || input.password !== DEMO_USER.password) {
          return sendJson(response, 401, { message: "Invalid demo username or password." });
        }
        return sendJson(response, 200, { message: "Login successful", user: { name: DEMO_USER.name } });
      } catch (error) {
        return sendJson(response, 400, { message: error.message });
      }
    }

    if (request.method === "GET" && request.url === "/api/accounts") {
      return sendJson(response, 200, { accounts: accountList() });
    }

    if (request.method === "POST" && request.url === "/api/transfer") {
      try {
        const input = await readBody(request);
        const from = accounts[input.fromAccount];
        const to = accounts[input.toAccount];
        const amount = Number(input.amount);

        if (!from || !to) return sendJson(response, 400, { message: "Please select valid accounts." });
        if (from.id === to.id) return sendJson(response, 400, { message: "Source and destination accounts must be different." });
        if (!Number.isFinite(amount) || amount <= 0) return sendJson(response, 400, { message: "Transfer amount must be greater than zero." });
        if (amount > from.balance) return sendJson(response, 400, { message: "Transfer amount exceeds the available balance." });

        from.balance = Number((from.balance - amount).toFixed(2));
        to.balance = Number((to.balance + amount).toFixed(2));
        return sendJson(response, 200, { status: "success", message: "Transfer Successful", amount, accounts: accountList() });
      } catch (error) {
        return sendJson(response, 400, { message: error.message });
      }
    }

    if (request.method === "POST" && request.url === "/api/reset") {
      resetAccounts();
      return sendJson(response, 200, { accounts: accountList() });
    }

    return serveStatic(request, response);
  });
}

if (require.main === module) {
  createServer().listen(PORT, () => console.log(`Northstar Bank demo: http://localhost:${PORT}`));
}

module.exports = { createServer, resetAccounts };
