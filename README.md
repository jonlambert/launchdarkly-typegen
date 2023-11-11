# LaunchDarkly TypeScript Generator

Type-safe flag evaluations for LaunchDarkly.

_Note: This is a third-party tool with no affiliation to LaunchDarkly._

## Introduction

This CLI tool will fetch flags from a LaunchDarkly project and render them to a TypeScript definition.

The output can then be imported across your application to give build-time checks to your flag evaluations.

## Example

```ts
export interface AppFlagSet {
  'feature-one': boolean;
  'feature-two': boolean;
}

export type AppFlag = keyof AppFlagSet;

export type FlagEnvironment = 'staging' | 'production';
```

## Installation

```bash
npm install -D launchdarkly-typegen
```

## Usage

```bash
launchdarkly-gen

Usage:
  $ launchdarkly-gen <command> [options]

Options:
  --output [file]               Path to generated file (default: output to stdout)
  --project [project]           LaunchDarkly project key (default: default)
  --flag-interface-name [name]  Name of the generated flag interface (default: AppFlagSet)
  --env-type-name [name]        Name of the generated environment union type (default: FlagEnvironment)
  --api-key [key]               LaunchDarkly API key (if not set, will attempt to use LAUNCHDARKLY_API_KEY from the environment)
  -h, --help                    Display this message

```

## TODO

- [x] Fetch flag keys and their types
- [x] Fetch environment keys
- [ ] Support >100 flags/environments
- [ ] Support non-boolean flag types
