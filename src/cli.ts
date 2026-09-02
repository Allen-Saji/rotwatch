import { runScan, reportToJson } from "./index.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] !== "scan" || !args[1]) {
    process.stderr.write("usage: rotwatch scan <dir>\n");
    process.exit(2);
  }

  const report = await runScan({ dir: args[1] });
  process.stdout.write(await reportToJson(report));
  process.stdout.write("\n");
}

main().catch((err) => {
  process.stderr.write(`rotwatch: ${(err as Error).message}\n`);
  process.exit(1);
});
