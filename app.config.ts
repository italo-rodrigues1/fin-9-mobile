const appJson = require('./app.json');

const baseConfig = appJson.expo;
const sentryOrganization = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;
const sentryUrl = process.env.SENTRY_URL || 'https://sentry.io/';

module.exports = () => ({
  ...baseConfig,
  plugins: [
    ...(baseConfig.plugins ?? []),
    ...(sentryOrganization && sentryProject
      ? [
          [
            '@sentry/react-native/expo',
            {
              organization: sentryOrganization,
              project: sentryProject,
              url: sentryUrl,
            },
          ],
        ]
      : []),
  ],
});
