function pickProfileApiToken(obj: Record<string, string>): string {
  return obj[window._env_.REACT_APP_PROFILE_AUDIENCE as string];
}

export default pickProfileApiToken;
