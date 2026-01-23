import { buildApp } from "./app";

async function main() {
  const port = Number(process.env.PORT ?? "3002");
  const host = process.env.HOST ?? "0.0.0.0";

  const app = await buildApp();
  await app.listen({ port, host });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

