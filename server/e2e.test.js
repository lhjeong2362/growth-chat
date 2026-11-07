import { test, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { httpServer } from "./server.js";

await new Promise((resolve) => httpServer.listen(0, resolve));
const base = `http://localhost:${httpServer.address().port}`;
after(() => httpServer.close());

async function connectMcp() {
  const client = new Client({ name: "e2e", version: "0.0.0" });
  await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)));
  return client;
}

const parse = (result) => JSON.parse(result.content[0].text);

test("keyword → session → get_request → submit_questions → ready, unsafe filtered", async () => {
  const { session } = await (await fetch(`${base}/session`, { method: "POST", body: JSON.stringify({ word: "게임" }) })).json();
  assert.match(session, /^[A-HJ-NP-Z2-9]{4}$/);

  assert.deepEqual(await (await fetch(`${base}/session/${session}`)).json(), { status: "waiting", questions: [] });

  const client = await connectMcp();
  const names = (await client.listTools()).tools.map((t) => t.name).sort();
  assert.deepEqual(names, ["get_request", "submit_questions"]);

  const request = parse(await client.callTool({ name: "get_request", arguments: { session: session.toLowerCase() } }));
  assert.equal(request.word, "게임");
  assert.equal(request.count, 5);

  const submitted = parse(
    await client.callTool({
      name: "submit_questions",
      arguments: { session, questions: ["인생 게임 OST 하나를 고른다면?", "연봉이 얼마예요?"] },
    }),
  );
  assert.deepEqual(submitted, { stored: 1, filtered: 1 });

  assert.deepEqual(await (await fetch(`${base}/session/${session}`)).json(), {
    status: "ready",
    questions: ["인생 게임 OST 하나를 고른다면?"],
  });
  await client.close();
});

test("all-unsafe submission → empty; unknown session → tool error and 404", async () => {
  const { session } = await (await fetch(`${base}/session`, { method: "POST", body: JSON.stringify({ word: "커피" }) })).json();
  const client = await connectMcp();
  await client.callTool({ name: "submit_questions", arguments: { session, questions: ["결혼은 하셨나요?"] } });
  assert.equal((await (await fetch(`${base}/session/${session}`)).json()).status, "empty");

  const missing = await client.callTool({ name: "get_request", arguments: { session: "ZZZZ" } });
  assert.equal(missing.isError, true);
  assert.equal((await fetch(`${base}/session/ZZZZ`)).status, 404);
  await client.close();
});

test("invalid word → 400", async () => {
  const res = await fetch(`${base}/session`, { method: "POST", body: JSON.stringify({ word: "  " }) });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "INVALID_WORD");
});
