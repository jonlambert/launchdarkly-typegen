interface TemplateArgs {
  flags: { key: string; type: string; description?: string }[];
  environments: string[];
  flagInterfaceName: string;
  envTypeName: string;
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

      return `  ${comment}'${flag.key}': boolean;`;
    })
    .join('\n');

  return `export interface ${flagInterfaceName} {
${flagLines}
}

export type AppFlag = keyof ${flagInterfaceName};

export type ${envTypeName} = ${envs};
`;
}
