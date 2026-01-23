import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { TimerStore } from "../src/timerStore";

describe("TimerStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("addTimer creates and appends", () => {
    const store = new TimerStore();
    const a = setTimeout(() => {}, 1);
    const b = setTimeout(() => {}, 1);
    store.addTimer("k", "e", a);
    store.addTimer("k", "e", b);
    expect(store.getTimers("k", "e")).toEqual([a, b]);
  });

  it("removeAllTimers clears all timeouts and empties list", () => {
    const store = new TimerStore();
    const spy = vi.spyOn(globalThis, "clearTimeout");
    const a = setTimeout(() => {}, 1);
    const b = setTimeout(() => {}, 1);
    store.addTimer("k", "e", a);
    store.addTimer("k", "e", b);

    store.removeAllTimers("k", "e");

    expect(spy).toHaveBeenCalledWith(a);
    expect(spy).toHaveBeenCalledWith(b);
    expect(store.getTimers("k", "e")).toEqual([]);
  });

  it("removeTimer removes one timeout and clears it", () => {
    const store = new TimerStore();
    const spy = vi.spyOn(globalThis, "clearTimeout");
    const a = setTimeout(() => {}, 1);
    const b = setTimeout(() => {}, 1);
    store.addTimer("k", "e", a);
    store.addTimer("k", "e", b);

    store.removeTimer("k", "e", a);

    expect(spy).toHaveBeenCalledWith(a);
    expect(store.getTimers("k", "e")).toEqual([b]);
  });

  it("removeTimer warns but does not throw when key missing", () => {
    const store = new TimerStore();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const a = setTimeout(() => {}, 1);
    expect(() => store.removeTimer("missing", "e", a)).not.toThrow();
    expect(log).toHaveBeenCalled();
  });
});

