/**
 * Central place where raw environment variables are turned into typed
 * configuration. Loaded by ConfigModule.forRoot({ load: [config] }) so it can
 * be consumed anywhere through ConfigService.
 */
export default () => ({
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200',

  STORAGE: {
    DIR: process.env.STORAGE_DIR ?? './storage/documents',
    MAX_UPLOAD_MB: parseInt(process.env.MAX_UPLOAD_MB ?? '25', 10),
  },

  SESSION: {
    COOKIE_NAME: 'tidalis_session',
    JWT_SECRET: process.env.JWT_SECRET ?? 'change_me_dev_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '8h',
  },

  MCP: {
    API_KEY: process.env.MCP_API_KEY ?? '',
  },

  SAML: {
    SP_ENTITY_ID: process.env.SAML_SP_ENTITY_ID ?? 'urn:tidalis:project-references',
    ISSUER: process.env.SAML_ISSUER ?? process.env.SAML_SP_ENTITY_ID ?? 'urn:tidalis:project-references',
    IDP_ENTITY_ID: process.env.SAML_IDP_ENTITY_ID ?? '',
    IDP_SSO_URL: process.env.SAML_IDP_SSO_URL ?? '',
    IDP_CERT: process.env.SAML_IDP_CERT ?? '',
    CALLBACK_URL: process.env.SAML_CALLBACK_URL ?? 'http://localhost:3000/api/auth/saml/callback',
    NAME_ATTRIBUTE: process.env.SAML_NAME_ATTRIBUTE ?? '',
  },

  // Local development escape hatch - see .env.example. Never enable in production.
  AUTH_DISABLED: process.env.AUTH_DISABLED === 'true',
  DEV_USER_EMAIL: process.env.DEV_USER_EMAIL ?? 'dev@tidalis.com',

  LOGGING: {
    SQL: process.env.LOG_SQL === 'true',
  },
});

/**
 * True when enough SAML settings are present to actually register the strategy.
 * Checked at boot so the application still starts (with a warning) when the
 * real IdP metadata has not been supplied yet.
 */
export function isSamlConfigured(): boolean {
  return Boolean(process.env.SAML_IDP_SSO_URL && process.env.SAML_IDP_CERT);
}
