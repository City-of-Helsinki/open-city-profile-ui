function pickProfileApiToken(obj: Record<string, string>): string {
  return obj[process.env.REACT_APP_PROFILE_AUDIENCE as string];
}

export default pickProfileApiToken;
