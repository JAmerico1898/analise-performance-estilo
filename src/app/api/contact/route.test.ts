import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

function req(body: unknown): Request {
  return new Request("http://test/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects empty message with 400", async () => {
    const res = await POST(req({ message: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 when credentials missing", async () => {
    const prevT = process.env.PUSHOVER_TOKEN;
    const prevU = process.env.PUSHOVER_USER;
    delete process.env.PUSHOVER_TOKEN;
    delete process.env.PUSHOVER_USER;
    const res = await POST(req({ message: "hello" }));
    expect(res.status).toBe(500);
    if (prevT) process.env.PUSHOVER_TOKEN = prevT;
    if (prevU) process.env.PUSHOVER_USER = prevU;
  });

  it("posts to Pushover when credentials exist", async () => {
    process.env.PUSHOVER_TOKEN = "tok";
    process.env.PUSHOVER_USER = "usr";
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ status: 1 }), { status: 200 }));
    const res = await POST(req({ name: "jose", email: "j@a.com", message: "oi" }));
    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith(
      "https://api.pushover.net/1/messages.json",
      expect.objectContaining({ method: "POST" })
    );
  });
});
