const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, "public");
const students = [];

function validateStudent(input) {
  const name = String(input.name || "").trim();
  const email = String(input.email || "").trim().toLowerCase();
  const course = String(input.course || "").trim();

  if (!name || !email || !course) {
    return { error: "Name, email and course are required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  return { student: { name, email, course } };
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json" });
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
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function serveStatic(request, response) {
  const requested = request.url === "/" ? "index.html" : request.url.slice(1);
  const safePath = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    return response.end("Forbidden");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      return response.end("Not found");
    }

    const extension = path.extname(filePath);
    const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
    response.writeHead(200, { "Content-Type": types[extension] || "application/octet-stream" });
    response.end(data);
  });
}

function createServer() {
  return http.createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/api/students") {
      return sendJson(response, 200, { students });
    }

    if (request.method === "POST" && request.url === "/api/students") {
      try {
        const result = validateStudent(await readBody(request));
        if (result.error) return sendJson(response, 400, { message: result.error });

        if (students.some(item => item.email === result.student.email)) {
          return sendJson(response, 409, { message: "This email is already registered." });
        }

        const saved = { id: students.length + 1, ...result.student };
        students.push(saved);
        return sendJson(response, 201, { message: "Registration successful!", student: saved });
      } catch (error) {
        return sendJson(response, 400, { message: error.message });
      }
    }

    return serveStatic(request, response);
  });
}

if (require.main === module) {
  createServer().listen(PORT, () => {
    console.log(`Student Registration Demo: http://localhost:${PORT}`);
  });
}

module.exports = { createServer, validateStudent, students };
