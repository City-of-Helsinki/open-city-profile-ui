export type LoginClientErrorType =
  | 'INVALID_OR_EXPIRED_USER'
  | 'UNAUTHORIZED_SESSION'
  | 'API_TOKENS_FAILED'
  | 'INVALID_API_TOKENS'
  | 'API_TOKEN_NETWORK_OR_CORS_ERROR'
  | 'USER_HAS_INVALID_TOKENS'
  | 'RENEWAL_FAILED'
  | 'NO_API_TOKEN_URL';

class LoginClientError extends Error {
  constructor(
    public message: string,
    public type: LoginClientErrorType,
    public originalError?: Error | null
  ) {
    super(message);
    this.type = type;
    this.originalError = originalError;
  }
  get isInvalidUserError() {
    return this.type === 'INVALID_OR_EXPIRED_USER';
  }
  get isInvalidApiTokensError() {
    return this.type === 'INVALID_API_TOKENS';
  }
  get isApiTokensFailedError() {
    return this.type === 'API_TOKENS_FAILED';
  }
  get isMissingApiTokenUrlError() {
    return this.type === 'NO_API_TOKEN_URL';
  }
  get isApiTokenNetWorkOrCorsError() {
    return this.type === 'API_TOKEN_NETWORK_OR_CORS_ERROR';
  }
  get isInvalidApiTokenError() {
    return this.type === 'USER_HAS_INVALID_TOKENS';
  }
  get isUnauthorizedSessionError() {
    return this.type === 'UNAUTHORIZED_SESSION';
  }
  get isRenewalFailedError() {
    return this.type === 'RENEWAL_FAILED';
  }
}

export default LoginClientError;
