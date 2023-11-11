interface TemplateArgs {
  flags: { key: string; type: string }[];
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

  return `export interface ${flagInterfaceName} {
${flags.map((flag) => `  '${flag.key}': ${flag.type};`).join('\n')}
}

export type AppFlag = keyof ${flagInterfaceName};

export type ${envTypeName} = ${envs};
`;
}
