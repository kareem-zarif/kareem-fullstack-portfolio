import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

const oAuthConfig = {
  issuer: 'https://localhost:44356/',
  redirectUri: baseUrl,
  clientId: 'kareem_fullstack_portfolio_App',
  responseType: 'code',
  scope: 'offline_access kareem_fullstack_portfolio',
  requireHttps: true,
};

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'kareem_fullstack_portfolio',
  },
  oAuthConfig,
  apis: {
    default: {
      url: 'https://localhost:44356',
      rootNamespace: 'kareem_fullstack_portfolio',
    },
    AbpAccountPublic: {
      url: oAuthConfig.issuer,
      rootNamespace: 'AbpAccountPublic',
    },
  },
  remoteEnv: {
    url: '/getEnvConfig',
    mergeStrategy: 'deepmerge'
  }
} as Environment;
