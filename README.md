# Helsinki-profile / OmaHelsinki / Citizen-profile UI

UI for citizen-profile - This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Environments

Test: https://omahelsinki.test.kuva.hel.ninja/

Staging: None

Production: None

## Development

If running on Linux or MacOS, easiest way is to just run the app without docker. Any semi-new version of node should probably work, the docker-image is set to use node 12.

Run `yarn` to install dependencies, start app with `yarn start`.

The graphql-backend for development is located at https://helsinkiprofile.test.kuva.hel.ninja/graphql/, it has graphiql installed so you can browse it in your browser!

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

## Running with docker

If you really must, you can run this app with docker locally.

Run `docker-compose up` to start the app in docker.

`docker-compose down` stops the container.

## Environment variables

Since this app uses react-scripts (Create React App) the env-files work a bit differently to what people are used to. Read more about them [here](https://create-react-app.dev/docs/adding-custom-environment-variables).

The following envs are used:

- REACT_APP_OIDC_AUTHORITY - this is the URL to tunnistamo
- REACT_APP_OIDC_CLIENT_ID - ID of the client that has to be configured in tunnistamo
- REACT_APP_PROFILE_AUDIENCE - name of the api-token that client uses profile-api with
- REACT_APP_PROFILE_GRAPHQL - URL to the profile graphql
- REACT_APP_OIDC_SCOPE - which scopes the app requires
- REACT_APP_SENTRY_DSN - not yet used


## Tunnistamo configuration

This app uses tunnistamo for authentication. Tunnistamo needs to have the following things set up:

**OIDC client**

The ID of this client must be the same as set in the REACT_APP_OIDC_CLIENT_ID environment variable.

Requires the following things:
- Response types - id_token token
- Redirect URIs (app-url is where the UI is running, e.g. http://localhost:3000 for development) - {app-url}/callback, {app-url}/silent_renew
- Client ID - the name as noted above
- Login methods - which providers can be used to authenticate, should have at least GitHub enabled for development.

**API Scopes**

The scopes this app uses are set with the REACT_APP_OIDC_SCOPE environment variable.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
