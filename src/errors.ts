import { GITHUB_ISSUE_URL } from "./constants";

export class LaunchDarklyClientError extends Error {
  constructor() {
    super("There was an error reaching the LaunchDarkly API");
  }
}

export class CommandMissingAuthKeyError extends Error {
  constructor() {
    super(
      "LAUNCHDARKLY_API_KEY must be in the environment, set in a .env file, or supplied via --api-key"
    );
  }
}

export class LaunchDarklyUnexpectedResponse extends Error {
  constructor() {
    super(
      `The API response from LaunchDarkly was in an unexpected shape. Please open an issue: ${GITHUB_ISSUE_URL}`
    );
  }
}

export class LaunchDarklyAuthorizationError extends Error {
  constructor() {
    super(
      `Failed to authenticate with LaunchDarkly. Please check your API key.`
    );
  }
}
