import axios, { AxiosError } from 'axios';
import {
  array,
  literal,
  number,
  object,
  optional,
  string,
  union,
  unknown,
  Output,
  safeParse,
} from 'valibot';
import {
  LaunchDarklyAuthorizationError,
  CommandMissingAuthKeyError,
  LaunchDarklyUnexpectedResponse,
} from './errors';
import { LAUNCHDARKLY_BASE_URL, LAUNCHDARKLY_API_VERSION } from './constants';

function getApiKeyFromEnv() {
  if (!process.env.LAUNCHDARKLY_API_KEY) {
    throw new CommandMissingAuthKeyError();
  }

  return process.env.LAUNCHDARKLY_API_KEY;
}

function getApiKey(apiKey: string | undefined) {
  return apiKey ?? getApiKeyFromEnv();
}

const flagSchema = union([
  object({
    kind: literal('boolean'),
    key: string(),
    description: optional(string()),
    name: string(),
  }),
  object({
    kind: literal('multivariate'),
    key: string(),
    description: optional(string()),
    name: string(),
    variations: array(object({ name: string(), value: unknown() })),
  }),
]);

export type LaunchDarklyFlag = Output<typeof flagSchema>;

export const getLaunchDarklyFlagsResponse = object({
  items: array(flagSchema),
  totalCount: number(),
});

export const getLaunchDarklyEnvironmentsResponse = object({
  items: array(object({ key: string() })),
});

const FLAGS_PAGE_LIMIT = 100;

export async function getAllFlags(projectKey: string, apiKey?: string) {
  const client = getClient(getApiKey(apiKey));
  const allFlags: LaunchDarklyFlag[] = [];
  let offset = 0;
  let totalCount = 0;

  do {
    const response = await client.get(
      `/v2/flags/${projectKey}?limit=${FLAGS_PAGE_LIMIT}&offset=${offset}`,
    );

    const data = safeParse(getLaunchDarklyFlagsResponse, response.data);

    if (!data.success) {
      throw new LaunchDarklyUnexpectedResponse();
    }

    allFlags.push(...data.output.items);
    totalCount = data.output.totalCount;
    offset += FLAGS_PAGE_LIMIT;
  } while (offset < totalCount);

  return { items: allFlags };
}

export async function getAllEnvironments(projectKey: string, apiKey?: string) {
  const response = await getClient(getApiKey(apiKey)).get(
    `/v2/projects/${projectKey}/environments?limit=100`,
  );

  const data = safeParse(getLaunchDarklyEnvironmentsResponse, response.data);

  if (!data.success) {
    throw new LaunchDarklyUnexpectedResponse();
  }

  return data.output;
}

function getClient(apiKey: string) {
  const client = axios.create({
    headers: {
      Authorization: apiKey,
      'LD-API-Version': LAUNCHDARKLY_API_VERSION,
    },
    baseURL: LAUNCHDARKLY_BASE_URL,
  });

  client.interceptors.response.use(undefined, (error: AxiosError) => {
    if (error.response?.status === 401) {
      throw new LaunchDarklyAuthorizationError();
    }

    throw error;
  });

  return client;
}
