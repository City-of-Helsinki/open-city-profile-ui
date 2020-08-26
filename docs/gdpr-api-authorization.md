# GDPR API compatibility

The GDPR API requires the user to allow actions on their data. Let's take downloading profile data as an example.

1) User clicks the download button
2) User is redirected to Tunnistamo which, if necessary, renders an UI the user can use to allow a set of permissions
3) User is redirected back to Helsinki profile UI and the download action is completed

In essence, we need to request the authorization code in the UI, because the user flow may contain a step that requires user input. Once this code is generated, it must be provided within the download profile query and delete profile mutation when these requests are sent to the profile backend. The backend can then use this code to make requests to all the other services for data or deletion.

## Technical explanation

This flow introduces one difficult step--the exit and re-entry into the profile UI application. This makes the download and deletion code flows more difficult to handle. In comparison, these actions were previously completed with callbacks and promises--which make use of the fact that the "same SPA session" is retained throughout the user action. After we transition into fetching the authorization code, this assumption no longer holds, but instead the application is "hard refreshed" at least once.

Within this application, this behaviour has been managed with the help of `GdprAuthorizationCodeManager`, `useActionResumer` and `useAuthorizationCode`.

### `GdprAuthorizationCodeManager`

This class is responsible for compliance with the `OpenID` protocol. It's responsible for handling the authorization flow. In this capacity it:
* Stores the application state so that it can be reused when authorization is complete
* Creates the authorization url
* Navigates to authorization url
* Interjects the authorization callback
* Saves code for use
* Reloads application state
* Deletes code and application state from store when it is no longer needed

### `useActionResumer`

This hook is an abstraction which seeks to bridge the "gap" that forms when the user is redirected to Tunnistamo and then finally back into our application. It allows other code within the application to complete actions that span a page refresh while being relatively agnostic about the method by which the application knows what action to resume when the redirection is done.

**Parameters**  

| Name  | Description |
| ------------- | ------------- |
| **`deferredAction`**  | Name of action that get _deferred_  until the redirect back into the UI. This is used as an ID which tells `useActionResumer` whether it should run the `callback` parameter.  |
| **`onActionInitialization`**  | `useActionResumer` begins the action flow by calling this function.  |
| **`callback`**  | `useActionResumer`** calls this function when the action is resumed.  |

**Humanized explanation**  
`useActionResumer` provides its user with the `startAction` function. This function can be used to invoke an action that persists over page reloads. `useActionResumer` listens with a `useEffect` in order to notice when it should complete an action. When it determines that it's a suitable time, it invokes `callback`.

**Note:**  
Currently `useActionResumer` relies on a search parameter to know whether it should invoke a `callback`. The `useEffect` that it uses to determine when an action should be completed is not hooked up to listen to changes in location. This way `useActionResumer` won't work unless the search parameter invoking it is present already when the component calling it is mounted. If the search parameter becomes available after component mount, the callback won't be invoked. Again from another perspective: `useActionResumer` uses the global `location` object to determine whether a search parameter is present. This means that it won't react to location changes completed through react-router for instance.

Using the global location is a sort of anti-pattern which would make it more risky to transition this application into a server rendered application for instance.

### `useAuthorizationCode`
Combines `GdprAuthorizationCodeManager` and `useActionResumer` into a single API that's easier to consume. Code that needs access to an authorization code can hook up to one with a call like this:

```
  const [
    startFetchingAuthorizationCode,
    isAuthorizing
  ] = useAuthorizationCode(
    'useDownloadProfile',
    handleAuthorizationCodeCallback
  );
```

## Technical flow

Here I've explained how the application should act in more technical detail. Developers can make use of this explanation to get a better sense of how the features relying on `authorization code` should work. I'll take the download flow as an example, but the delete flow is mostly the same.

1) User logs in
2) User expands panel for downloading user profile
3) User clicks download button
    1) Download button is disabled and its label is changed
    1) Current url and the download action are saved into local storage under `kuvaGdprAuthManager` prefix that's tailed by a random UUID
    1) Tunnistamo authorize URL is built
    1) User is redirected to Tunnistamo
6) User allows access to personal information in Tunnistamo
7) User is redirected back into the application into address `<origin>/gdpr-callback`
    1) It calls `GdprAuthorizationCodeManager.authorizationTokenFetchCallback`
        1) Token is saved into localStorage ready for consumption.
        1) Previous app state is restored. User is redirected to the page the invoked download on and a special search parameter is added to tell `useActionResumer` instances that the one with this id should fire its callback.
        1) Previous app state is cleared
8) User lands back on the profile index page based on the redirect.
    1) The code is consumed--it's requested from `GdprAuthorizationCodeManager` which then clears it from its memory (localStorage).
    1) The code is used to call `downloadProfile`
