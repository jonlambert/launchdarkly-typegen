#!/usr/bin/env node
import { getAllEnvironments, getAllFlags } from "./client";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { template } from "./template";
import { config } from "dotenv";

import cac from "cac";
import { existsSync } from "node:fs";
import {
  object,
  optional,
  string,
  parse as validate,
  boolean,
  safeParse,
} from "valibot";

const cli = cac("launchdarkly-typegen");

config({ path: resolve(process.cwd(), ".env") });

cli.option(
  "--output [file]",
  "Path to generated file (default: output to stdout)"
);
cli.option("--project [project]", "LaunchDarkly project key", {
  default: "default",
});
cli.option(
  "--flag-interface-name [name]",
  "Name of the generated flag interface",
  {
    default: "AppFlagSet",
  }
);
cli.option(
  "--env-type-name [name]",
  "Name of the generated environment union type",
  { default: "FlagEnvironment" }
);
cli.option(
  "--api-key [key]",
  "LaunchDarkly API key (if not set, will attempt to use LAUNCHDARKLY_API_KEY from the environment)"
);
cli.help();

const optionsSchema = object({
  output: optional(string()),
  project: string(),
  flagInterfaceName: string(),
  envTypeName: string(),
  apiKey: optional(string()),
  help: optional(boolean(), false),
});

async function main() {
  const { options: rawOptions } = cli.parse();
  const optionsResult = safeParse(optionsSchema, rawOptions);

  if (!optionsResult.success) {
    console.log("Invalid arguments: ", optionsResult.issues.map(issue => `${issue.input}: ${issue.message}`).join(', '));
    cli.outputHelp();
    return;
  }

  const options = optionsResult.output;

  if (options.help) return;

  const [envs, flags] = await Promise.all([
    getAllEnvironments(options.project, options.apiKey),
    getAllFlags(options.project, options.apiKey),
  ]);

  const rendered = template({
    flags: flags.items,
    environments: envs.items.map((env) => env.key),
    envTypeName: options.envTypeName,
    flagInterfaceName: options.flagInterfaceName,
  });

  if (options.output) {
    const path = resolve(process.cwd(), options.output);
    const dir = dirname(path);

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(path, rendered);
    console.log(
      `${flags.items.length} flag(s), ${envs.items.length} env(s) saved to ${path}`
    );
  } else {
    console.log(rendered);
  }
}

main();
