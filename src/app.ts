import Fastify, { type FastifyInstance } from "fastify";
import formbody from "@fastify/formbody";
import { TimerStore } from "./timerStore";
import { decideDuskTrigger } from "./dusk";
import { triggerIfttt, type IftttFormBody } from "./iftttClient";

export type AppDeps = {
  timerStore?: TimerStore;
  trigger?: (event: string, key: string, body: IftttFormBody) => Promise<void>;
  decideDusk?: (now: Date, lat: number, lon: number) => { sunsetTime: Date; shouldTrigger: boolean };
};

function pickBodyValues(body: unknown): IftttFormBody {
  const obj = (body ?? {}) as Record<string, unknown>;
  return {
    value1: obj.Value1,
    value2: obj.Value2,
    value3: obj.Value3,
  };
}

export async function buildApp(deps: AppDeps = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  await app.register(formbody);

  const timerStore = deps.timerStore ?? new TimerStore();
  const trigger = deps.trigger ?? triggerIfttt;
  const decideDusk = deps.decideDusk ?? decideDuskTrigger;

  app.get("/dusk", async (req, reply) => {
    const { key, lat, lon, event } = req.query as Record<string, string | undefined>;
    const parsedLat = parseFloat(String(lat));
    const parsedLon = parseFloat(String(lon));
    const now = new Date();

    const { sunsetTime, shouldTrigger } = decideDusk(now, parsedLat, parsedLon);
    let triggered = false;

    if (shouldTrigger) {
      await trigger(String(event), String(key), {});
      triggered = true;
    }

    return reply.send(
      `Request recorded. Sunset time = ${sunsetTime}. ${triggered ? "Triggered. " : "Not triggered."}`,
    );
  });

  app.route({
    method: ["GET", "POST"],
    url: "/cancel",
    handler: async (req, reply) => {
      const { key, event } = req.query as Record<string, string | undefined>;
      if (key === undefined || event === undefined) {
        return reply.send("Error: must specify key and event in the URL.");
      }
      timerStore.removeAllTimers(key, event);
      return reply.send(`All future times for { key = ${key}, event = ${event} } are removed. `);
    },
  });

  app.route({
    method: ["GET", "POST"],
    url: "/delay",
    handler: async (req, reply) => {
      const q = req.query as Record<string, string | undefined>;
      const delay = parseFloat(String(q.t));
      const key = q.key;
      const event = q.event;
      const reset = q.reset === "1";

      if (q.t === undefined || key === undefined || event === undefined) {
        return reply.send("Error: must specify t (for delay time) and key and event in the URL.");
      }

      const maxSupportedDelay = 2 ** 31 - 1;
      if (delay * 60 * 1000 > maxSupportedDelay) {
        return reply.send(
          `Error: Delay time cannot exceed ${maxSupportedDelay / 60 / 1000} minutes.`,
        );
      }

      const bodyToSend = pickBodyValues(req.body);

      const timerId = setTimeout(async () => {
        try {
          await trigger(event, key, bodyToSend);
        } finally {
          timerStore.removeTimer(key, event, timerId);
        }
      }, delay * 60 * 1000);

      if (reset) {
        timerStore.removeAllTimers(key, event);
      }
      timerStore.addTimer(key, event, timerId);

      return reply.send(
        `Request recorded. Delay = ${delay} minutes, event = ${event}, key = ${key}, reset = ${reset}`,
      );
    },
  });

  app.get("/", async (_req, reply) => {
    return reply.status(200).send({ status: "ok", msg: "You've reached the API root. Service is running." });
  });

  return app;
}

