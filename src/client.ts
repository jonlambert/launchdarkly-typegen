import axios, { AxiosError } from "axios";
import {
  array,
  literal,
  object,
  optional,
  string,
  union,
  unknown,
  Output,
  safeParse,
} from "valibot";
import {
  LaunchDarklyAuthorizationError,
  CommandMissingAuthKeyError,
  LaunchDarklyUnexpectedResponse,
} from "./errors";
import { LAUNCHDARKLY_BASE_URL } from "./constants";

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
    kind: literal("boolean"),
    key: string(),
    description: optional(string()),
    name: string(),
  }),
  object({
    kind: literal("multivariate"),
    key: string(),
    description: optional(string()),
    name: string(),
    variations: array(object({ name: string(), value: unknown() })),
  }),
]);

export type LaunchDarklyFlag = Output<typeof flagSchema>;

export const getLaunchDarklyFlagsResponse = object({
  items: array(flagSchema),
});

export const getLaunchDarklyEnvironmentsResponse = object({
  items: array(object({ key: string() })),
});

export async function getAllFlags(projectKey: string, apiKey?: string) {
  const response = await getClient(getApiKey(apiKey)).get(
    `/v2/flags/${projectKey}?limit=1000`
  );

  const data = safeParse(getLaunchDarklyFlagsResponse, response.data);

  if (!data.success) {
    throw new LaunchDarklyUnexpectedResponse();
  }

  return data.output;
}

export async function getAllEnvironments(projectKey: string, apiKey?: string) {
  const response = await getClient(getApiKey(apiKey)).get(
    `/v2/projects/${projectKey}/environments?limit=100`
  );

  const data = safeParse(getLaunchDarklyEnvironmentsResponse, response.data);

  if (!data.success) {
    throw new LaunchDarklyUnexpectedResponse();
  }

  return data.output;
}

function getClient(apiKey: string) {
  const client = axios.create({
    headers: { Authorization: apiKey },
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
