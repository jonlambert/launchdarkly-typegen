import { GITHUB_ISSUE_URL } from './constants';

export class LaunchDarklyClientError extends Error {
  constructor() {
    super('There was an error reaching the LaunchDarkly API');
  }
}

export class LaunchDarklyUnexpectedResponse extends Error {
  constructor() {
    super(
      `The API response from LaunchDarkly was in an unexpected shape. Please open an issue: ${GITHUB_ISSUE_URL}`
    );
  }
}
