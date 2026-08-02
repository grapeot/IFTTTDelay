import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import supertest from "supertest";
import { buildApp } from "../src/app";
import { TimerStore } from "../src/timerStore";

describe("app routes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("GET / returns health JSON", async () => {
    const app = await buildApp({
      trigger: vi.fn().mockResolvedValue(undefined),
      decideDusk: vi.fn().mockReturnValue({ sunsetTime: new Date(), shouldTrigger: false }),
    });
    await app.ready();
    const res = await supertest(app.server).get("/");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    await app.close();
  });

  it("/cancel requires key and event", async () => {
    const app = await buildApp();
    await app.ready();
    const res = await supertest(app.server).get("/cancel");
    expect(res.text).toContain("must specify key and event");
    await app.close();
  });

  it("/delay requires t, key, event", async () => {
    const app = await buildApp();
    await app.ready();
    const res = await supertest(app.server).get("/delay?event=e&key=k");
    expect(res.text).toContain("must specify t");
    await app.close();
  });

  it("/delay triggers IFTTT after delay and removes timer", async () => {
    const timerStore = new TimerStore();
    const trigger = vi.fn().mockResolvedValue(undefined);

    const app = await buildApp({
      timerStore,
      trigger,
    });
    await app.ready();

    const res = await supertest(app.server).post("/delay?t=0.01&event=evt&key=kk").send({
      Value1: "a",
      Value2: "b",
      Value3: "c",
    });
    expect(res.status).toBe(200);
    expect(res.text).toContain("Request recorded");

    expect(timerStore.getTimers("kk", "evt").length).toBe(1);
    vi.advanceTimersByTime(0.01 * 60 * 1000);
    await vi.runOnlyPendingTimersAsync();

    expect(trigger).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveBeenCalledWith("evt", "kk", { value1: "a", value2: "b", value3: "c" });
    expect(timerStore.getTimers("kk", "evt")).toEqual([]);

    await app.close();
  });

  it("/delay reset=1 cancels existing timers", async () => {
    const timerStore = new TimerStore();
    const trigger = vi.fn().mockResolvedValue(undefined);
    const app = await buildApp({ timerStore, trigger });
    await app.ready();

    await supertest(app.server).get("/delay?t=10&event=evt&key=kk");
    await supertest(app.server).get("/delay?t=0.01&event=evt&key=kk&reset=1");

    expect(timerStore.getTimers("kk", "evt").length).toBe(1);
    vi.advanceTimersByTime(0.01 * 60 * 1000);
    await vi.runOnlyPendingTimersAsync();
    expect(trigger).toHaveBeenCalledTimes(1);

    await app.close();
  });

  it("/dusk triggers when shouldTrigger is true", async () => {
    const trigger = vi.fn().mockResolvedValue(undefined);
    const decideDusk = vi.fn().mockReturnValue({ sunsetTime: new Date("2020-01-01T00:00:00Z"), shouldTrigger: true });

    const app = await buildApp({ trigger, decideDusk });
    await app.ready();
    const res = await supertest(app.server).get("/dusk?key=k&lat=1&lon=2&event=e");
    expect(res.text).toContain("Triggered");
    expect(trigger).toHaveBeenCalledTimes(1);
    await app.close();
  });
});

