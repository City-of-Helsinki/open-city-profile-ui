# Helsinki-profile / OmaHelsinki / Citizen-profile UI

UI for citizen-profile.

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

| Name                                  | Description                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| `REACT_APP_HELSINKI_ACCOUNT_AMR`      | Authentication method reference for Helsinki account. </br> **default:** `helsinki_tunnus` |
| `REACT_APP_OIDC_AUTHORITY`            | This is the URL to tunnistamo.                                                             |
| `REACT_APP_OIDC_CLIENT_ID`            | ID of the client that has to be configured in tunnistamo.                                  |
| `REACT_APP_OIDC_SCOPE`                | Which scopes the app requires.                                                             |
| `REACT_APP_PROFILE_AUDIENCE`          | Name of the api-token that client uses profile-api with.                                   |
| `REACT_APP_PROFILE_BE_GDPR_CLIENT_ID` | Client id used when getting gdpr authentication token for connected services               |
| `REACT_APP_PROFILE_GRAPHQL`           | URL to the profile graphql.                                                                |
| `REACT_APP_SENTRY_DSN`                | Sentry public dns-key.                                                                     |
| `REACT_APP_OIDC_RESPONSE_TYPE`        | Which response type to require.                                                            |
| `REACT_APP_KEYCLOAK_GDPR_CLIENT_ID`   | Client id for getting auth codes from keycloak                                             |
| `REACT_APP_KEYCLOAK_AUTHORITY`        | Url to Keycloak. The openid config is fetched from this url                                |

## Setting up local development environment with Docker

### Set tunnistamo hostname

Add the following line to your hosts file (`/etc/hosts` on mac and linux):

    127.0.0.1 tunnistamo-backend

### Create a new OAuth app on GitHub

Go to https://github.com/settings/developers/ and add a new app with the following settings:

- Application name: can be anything, e.g. local tunnistamo
- Homepage URL: http://tunnistamo-backend:8000
- Authorization callback URL: http://tunnistamo-backend:8000/accounts/github/login/callback/

Save. You'll need the created **Client ID** and **Client Secret** for configuring tunnistamo in the next step.

### Install local tunnistamo

Clone https://github.com/City-of-Helsinki/tunnistamo/.

Follow the instructions for setting up tunnistamo locally. Before running `docker-compose up` set the following settings in tunnistamo roots `docker-compose.env.yaml`:

- SOCIAL_AUTH_GITHUB_KEY: **Client ID** from the GitHub OAuth app
- SOCIAL_AUTH_GITHUB_SECRET: **Client Secret** from the GitHub OAuth app

Run `docker-compose up`

After container is up and running, few things need to be set up at http://localhost:8000/admin

**OIDC client**

The ID of this client must be the same as set in the REACT_APP_OIDC_CLIENT_ID environment variable.

Requires the following things:

- Response types - 'code' OR 'id_token token'
- Redirect URIs (app-url is where the UI is running, e.g. http://localhost:3000 for development) - {app-url}/callback, {app-url}/silent_renew
- Client ID - the name as noted above
- Login methods - which providers can be used to authenticate, should have at least GitHub enabled for development.

**API Scopes**

The scopes this app uses are set with the REACT_APP_OIDC_SCOPE environment variable.

### Install local open-city-profile

Clone https://github.com/City-of-Helsinki/open-city-profile/.

1. Create a `docker-compose.env.yaml` file in the project folder:

   - Use `docker-compose.env.yaml.example` as a base, it does not need any changes
     for getting the project running.
   - Change `DEBUG` and the rest of the Django settings if needed.
     - `TOKEN_AUTH_*`, settings for [tunnistamo](https://github.com/City-of-Helsinki/tunnistamo) authentication service
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

The graphql-backend for development is located at https://profiili-api.test.kuva.hel.ninja/graphql/, it has graphiql installed so you can browse it in your browser!

## Learn More

To learn more about specific choices in this repository, you can browse the [docs](/docs).
