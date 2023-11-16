import { LaunchDarklyFlag } from './client';

interface TemplateArgs {
  flags: LaunchDarklyFlag[];
  environments: string[];
  flagInterfaceName: string;
  envTypeName: string;
}

export function renderFlagType(flag: LaunchDarklyFlag) {
  if (flag.kind === 'boolean') return 'boolean';

  return flag.variations
    .map((variation) => `{ name: '${variation.name}', value: unknown }`)
    .join(' | ');
}

export function template({
  flags,
  environments,
  flagInterfaceName,
  envTypeName,
}: TemplateArgs) {
  const envs = environments.map((env) => `'${env}'`).join(' | ');
  const flagLines = flags
    .map((flag) => {
      const comment = flag.description
        ? `/**
   * ${flag.description}
   */
  `
        : '';

      return `  ${comment}'${flag.key}': ${renderFlagType(flag)};`;
    })
    .join('\n');

  return `export interface ${flagInterfaceName} {
${flagLines}
}

export type AppFlag = keyof ${flagInterfaceName};

export type ${envTypeName} = ${envs};
`;
}
