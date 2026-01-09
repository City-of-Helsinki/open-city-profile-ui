# Helsinki-profile / OmaHelsinki / Citizen-profile UI

UI for citizen-profile. Testing!

## Environments

Dev: https://profiili.dev.hel.ninja/

Test: https://profiili.test.hel.ninja/

Production: https://profiili.hel.fi

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

https://vitejs.dev/guide/cli.html#vite

Scripts generates first environment variables to `public/env-config.js` with `scripts/update-runtime-env.ts`, which contains the
actual used variables when running the app. App is not using default `process.env` way to refer of variables but
`window._env_` object.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://vitest.dev/guide/) for more information.

Scripts generates first environment variables to `public/env-config.js` with `scripts/update-runtime-env.ts`, which contains the
actual used variables when running the app. App is not using default `process.env` way to refer of variables but
`window._env_` object.

### `yarn test:e2e`

Runs end-to-end tests using [Playwright](https://playwright.dev).

It is recommended to run these tests to ensure the overall functionality and user experience of the application.

The tests use the following environment variables to configure the URLs of different components or services that they interact with:

    LINKED_EVENTS_URL
    PROFILE_URL
    PROFILE_API_URL
    EXAMPLE_APP_URL
    TUNNISTUS_URL

Please ensure these environment variables are correctly set in your environment before running the tests.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles app in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [build](https://vitejs.dev/guide/cli.html#build) for more information.

Note that running built application locally you need to generate also `public/env-config.js` file. It can be done with
`yarn update-runtime-env`. By default it's generated for development environment if no `NODE_ENV` is set.

### `yarn codegen`

Generate static types for GraphQL queries by using the schema from the backend server.

### `yarn update-translations`

Fetches translation data from our Google Spreadsheet and updates translation files. See `.env` for configuration.

You still need to update tests and add the translation files to the git repository manually.

### `yarn update-runtime-env`

Generates variable object used when app is running. Generated object is stored at `public/env-config.js` and available
as `window._env_` object.

Generation uses values from either
[environment variables or files](https://vitejs.dev/guide/env-and-mode.html).

At the production deployment same generation is done with [`env.sh`](scripts/env.sh).

### `yarn update-country-codes`

Fetches country calling codes and generates src/i18n/countryCallingCodes.json file. See scripts/update-country-calling-codes.ts for more information.

## Environment variables

| Name                                | Description                                                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `REACT_APP_HELSINKI_ACCOUNT_AMR`    | Authentication method reference for Helsinki account. </br> **default:** `helsinki_tunnus`                      |
| `REACT_APP_KEYCLOAK_GDPR_CLIENT_ID` | Client id used when getting gdpr authentication token for connected services                                    |
| `REACT_APP_OIDC_AUTHORITY`          | This is the URL to tunnistus.                                                                                   |
| `REACT_APP_OIDC_CLIENT_ID`          | ID of the client that has to be configured in keycloak.                                                         |
| `REACT_APP_OIDC_SCOPE`              | Which scopes the app requires.                                                                                  |
| `REACT_APP_PROFILE_AUDIENCE`        | Name of the api-token that client uses profile-api with.                                                        |
| `REACT_APP_PROFILE_GRAPHQL`         | URL to the profile graphql.                                                                                     |
| `REACT_APP_SENTRY_DSN`              | Sentry DSN url                                       |
| `REACT_APP_SENTRY_ENVIRONMENT`      | Sentry Environment configuration                      |
| `REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS` | Any urls we want to match the trace with |
| `REACT_APP_SENTRY_TRACES_SAMPLE_RATE` | Trace sample rate, affects amount of span generated |
| `REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE` | Replay configuration, needs the replay plugin for sentry |
| `REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE`| Replay configuration, needs the replay plugin for sentry |
| `REACT_APP_OIDC_RESPONSE_TYPE`      | Which response type to require.                                                                                 |
| `REACT_APP_KEYCLOAK_GDPR_CLIENT_ID` | Client id for getting auth codes from keycloak                                                                  |
| `REACT_APP_KEYCLOAK_AUTHORITY`      | Url to Keycloak. The openid config is fetched from this url                                                     |
| `REACT_APP_MFA_ENABLED`             | Show multi factor authentication section in ui                                                                  |

## Setting up local development environment with Docker

### Install local open-city-profile

Clone https://github.com/City-of-Helsinki/open-city-profile/.

1. Create a `docker-compose.env.yaml` file in the project folder:

   - Use `docker-compose.env.yaml.example` as a base, it does not need any changes
     for getting the project running.
   - Change `DEBUG` and the rest of the Django settings if needed.
     - `TOKEN_AUTH_*`, settings for [keycloak](https://dev.azure.com/City-of-Helsinki/helsinki-tunnistus/) authentication service
   - Set entrypoint/startup variables according to taste.

     - `CREATE_SUPERUSER`, creates a superuser with credentials `admin`:`admin` (admin@example.com)
     - `APPLY_MIGRATIONS`, applies migrations on startup
     - `BOOTSTRAP_DIVISIONS`, bootstrap data import for divisions

2. Run `docker-compose up`

### open-city-profile-ui

If running on Linux or MacOS, easiest way is to just run the app without docker. Any semi-new version of node should probably work, the docker-image is set to use node 14.

`docker-compose up` starts the container.

OR

Run `yarn` to install dependencies, start app with `yarn start`.

The graphql-backend for development is located at https://profile-api.dev.hel.ninja/graphql/, it has graphiql installed so you can browse it in your browser!
