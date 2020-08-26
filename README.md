# Helsinki-profile / OmaHelsinki / Citizen-profile UI

UI for citizen-profile - This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Environments

Test: https://profiili.test.kuva.hel.ninja/

Production: https://profiili.prod.kuva.hel.ninja/

## Issues board

https://helsinkisolutionoffice.atlassian.net/projects/OM/issues/?filter=allissues&=

## CI

The test-environment is built automatically from `develop`-branch.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn codegen`

Generate static types for GraphQL queries by using the schema from the backend server.

### `yarn update-translations`

Fetches translation data from our Google Spreadsheet and updates translation files. See `.env` for configuration.

You still need to update tests and add the translation files to the git repository manually.


## Environment variables

Since this app uses react-scripts (Create React App) the env-files work a bit differently to what people are used to. Read more about them [here](https://create-react-app.dev/docs/adding-custom-environment-variables).

The following envs are used:

| Name  | Description |
| --- | ------------- |
| `REACT_APP_HELSINKI_ACCOUNT_AMR` | Authentication method reference for Helsinki account. </br> **default:** `helusername` |
| `REACT_APP_IPD_MANAGEMENT_URL_HELSINKI_ACCOUNT` | Account management url for Helsinki account. </br> **default:** `https://salasana.hel.ninja/auth/realms/helsinki-salasana/account` |
| `REACT_APP_IPD_MANAGEMENT_URL_GITHUB` | Account management url for GitHub. </br> **default:** `https://github.com/settings/profile` |
| `REACT_APP_IPD_MANAGEMENT_URL_GOOGLE` | Account management url for Google. </br> **default:** `https://myaccount.google.com` |
| `REACT_APP_IPD_MANAGEMENT_URL_FACEBOOK` | Account management url for Facebook.  </br> **default:** `http://facebook.com/settings` |
| `REACT_APP_IPD_MANAGEMENT_URL_YLE` | Account management url for Yle. </br> **default:** `https://tunnus.yle.fi/#omat-tiedot` |
| `REACT_APP_OIDC_AUTHORITY` | This is the URL to tunnistamo. |
| `REACT_APP_OIDC_CLIENT_ID` | ID of the client that has to be configured in tunnistamo. |
| `REACT_APP_OIDC_SCOPE` | Which scopes the app requires. |
| `REACT_APP_PROFILE_AUDIENCE` | Name of the api-token that client uses profile-api with. |
| `REACT_APP_PROFILE_GRAPHQL` | URL to the profile graphql. |
| `REACT_APP_SENTRY_DSN` | Sentry public dns-key. |


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
- Response types - id_token token
- Redirect URIs (app-url is where the UI is running, e.g. http://localhost:3000 for development) - {app-url}/callback, {app-url}/silent_renew
- Client ID - the name as noted above
- Login methods - which providers can be used to authenticate, should have at least GitHub enabled for development.

**API Scopes**

The scopes this app uses are set with the REACT_APP_OIDC_SCOPE environment variable.

### Install local open-city-profile
Clone https://github.com/City-of-Helsinki/open-city-profile/.

1. Create a `docker-compose.env.yaml` file in the project folder:
   * Use `docker-compose.env.yaml.example` as a base, it does not need any changes
     for getting the project running.
   * Change `DEBUG` and the rest of the Django settings if needed.
     * `TOKEN_AUTH_*`, settings for [tunnistamo](https://github.com/City-of-Helsinki/tunnistamo) authentication service
   * Set entrypoint/startup variables according to taste.
     * `CREATE_SUPERUSER`, creates a superuser with credentials `admin`:`admin` (admin@example.com)
     * `APPLY_MIGRATIONS`, applies migrations on startup
     * `BOOTSTRAP_DIVISIONS`, bootstrap data import for divisions
     
2. Run `docker-compose up`

### open-city-profile-ui

If running on Linux or MacOS, easiest way is to just run the app without docker. Any semi-new version of node should probably work, the docker-image is set to use node 12.

`docker-compose up` starts the container.

OR

Run `yarn` to install dependencies, start app with `yarn start`.

The graphql-backend for development is located at https://profiili-api.test.kuva.hel.ninja/graphql/, it has graphiql installed so you can browse it in your browser!

## Learn More

To learn more about specific choices in this repository, you can browse the [docs](/docs).

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
