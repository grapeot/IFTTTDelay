import { request } from "undici";

export type IftttFormBody = {
  value1?: unknown;
  value2?: unknown;
  value3?: unknown;
};

export function buildIftttUrl(event: string, key: string) {
  return `https://maker.ifttt.com/trigger/${event}/with/key/${key}`;
}

export async function triggerIfttt(event: string, key: string, body: IftttFormBody) {
  const url = buildIftttUrl(event, key);

  const form = new URLSearchParams();
  if (body.value1 !== undefined) form.set("value1", String(body.value1));
  if (body.value2 !== undefined) form.set("value2", String(body.value2));
  if (body.value3 !== undefined) form.set("value3", String(body.value3));

  await request(url, {
    method: "POST",
    body: form as any,
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
}

