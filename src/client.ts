import axios from 'axios';
import invariant from 'tiny-invariant';
import { array, literal, object, optional, parse, string } from 'valibot';

function getApiKeyFromEnv() {
  invariant(
    process.env.LAUNCHDARKLY_API_KEY,
    'LAUNCHDARKLY_API_KEY must be in the environment'
  );

  return process.env.LAUNCHDARKLY_API_KEY;
}

function getApiKey(apiKey: string | undefined) {
  return apiKey ?? getApiKeyFromEnv();
}

export const getLaunchDarklyFlagsResponse = object({
  items: array(
    object({
      kind: literal('boolean'),
      key: string(),
      description: optional(string()),
    })
  ),
});

export const getLaunchDarklyEnvironmentsResponse = object({
  items: array(object({ key: string() })),
});

export async function getAllFlags(projectKey: string, apiKey?: string) {
  const response = await getClient(getApiKey(apiKey)).get(
    `/v2/flags/${projectKey}?limit=100`
  );
  return parse(getLaunchDarklyFlagsResponse, response.data);
}

export async function getAllEnvironments(projectKey: string, apiKey?: string) {
  const response = await getClient(getApiKey(apiKey)).get(
    `/v2/projects/${projectKey}/environments?limit=100`
  );
  return parse(getLaunchDarklyEnvironmentsResponse, response.data);
}

function getClient(apiKey: string) {
  return axios.create({
    headers: { Authorization: apiKey },
    baseURL: 'https://app.launchdarkly.com/api',
  });
}
