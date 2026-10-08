const test = require("node:test");
const assert = require("node:assert/strict");

const authenticateBot = require("../middleware/authenticateBot");

function invokeMiddleware(apiKey) {
  const originalKey = process.env.BOT_API_KEY;
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let nextCalled = false;

  if (apiKey === undefined) {
    delete process.env.BOT_API_KEY;
  } else {
    process.env.BOT_API_KEY = "test-secret";
  }

  authenticateBot(
    { get: () => apiKey },
    response,
    () => {
      nextCalled = true;
    },
  );

  if (originalKey === undefined) {
    delete process.env.BOT_API_KEY;
  } else {
    process.env.BOT_API_KEY = originalKey;
  }

  return { response, nextCalled };
}

test("rejects missing configured bot key", () => {
  const { response, nextCalled } = invokeMiddleware(undefined);
  assert.equal(response.statusCode, 503);
  assert.equal(nextCalled, false);
});

test("rejects a missing or incorrect bot key", () => {
  for (const apiKey of [null, "wrong-secret"]) {
    const { response, nextCalled } = invokeMiddleware(apiKey);
    assert.equal(response.statusCode, 401);
    assert.equal(nextCalled, false);
  }
});

test("accepts the configured bot key", () => {
  const { response, nextCalled } = invokeMiddleware("test-secret");
  assert.equal(response.statusCode, 200);
  assert.equal(nextCalled, true);
});
