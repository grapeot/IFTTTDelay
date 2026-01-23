export type TimerId = NodeJS.Timeout;

export class TimerStore {
  private readonly timers = new Map<string, TimerId[]>();

  private key(key: string, event: string) {
    return `${key}_${event}`;
  }

  addTimer(key: string, event: string, id: TimerId) {
    const dictKey = this.key(key, event);
    const list = this.timers.get(dictKey) ?? [];
    list.push(id);
    this.timers.set(dictKey, list);
  }

  removeAllTimers(key: string, event: string) {
    const dictKey = this.key(key, event);
    const list = this.timers.get(dictKey) ?? [];
    for (const id of list) {
      clearTimeout(id);
    }
    this.timers.set(dictKey, []);
  }

  removeTimer(key: string, event: string, id: TimerId) {
    const dictKey = this.key(key, event);
    const list = this.timers.get(dictKey);
    if (!list) {
      // Keep legacy behavior: warn, don't throw.
      // eslint-disable-next-line no-console
      console.log(`[Warning] Failed to remove ${id} from ${dictKey}. `);
      return;
    }
    this.timers.set(
      dictKey,
      list.filter((x) => x !== id),
    );
    clearTimeout(id);
  }

  getTimers(key: string, event: string) {
    return (this.timers.get(this.key(key, event)) ?? []).slice();
  }
}

