# GDPR API compatibility

The GDPR API requires the user to allow actions on their data. Let's take downloading profile data as an example.

1. User clicks the download button
2. User is redirected to Tunnistus
3. User is redirected back to Helsinki profile UI and the download action is completed

In essence, we need to request the authorization code in the UI. Once this code is generated, it must be provided within the download profile query and delete profile mutation when these requests are sent to the profile backend. The backend can then use this code to make requests to all the other services for data or deletion.

## Technical explanation

This flow introduces one difficult step--the exit and re-entry into the profile UI application. This makes the download and deletion code flows more difficult to handle. In comparison, these actions were previously completed with callbacks and promises--which make use of the fact that the "same SPA session" is retained throughout the user action. After we transition into fetching the authorization code, this assumption no longer holds, but instead the application is "hard refreshed" at least once.

Within this application, this behaviour has been managed with the help of `GdprAuthorizationCodeManagerCallback`, `actionQueue`, `actionQueueStorage` and `authCodeRedirectionHandler`.

## Technical flow

Here I've explained how the application should act in more technical detail. Developers can make use of this explanation to get a better sense of how the features relying on `authorization code` should work. I'll take the download flow as an example, but the delete flow is mostly the same.

1. User logs in
2. User clicks download my information button
   1. Download button is disabled and its label is changed
   1. Tunnistus authorize URL is built in `authCodeRedirectionHandler`
   1. User is redirected to Tunnistus
3. User is redirected back into the application into address `<origin>/gdpr-callback`
   1. Route is handled by `GdprAuthorizationCodeManagerCallback`
      1. Previous action queue is loaded from session data and started by `actionQueue` and`actionQueueStorage`.
      1. User is redirected to the page the invoked download.
4. User lands back on the profile index page based on the redirect.
   1. The code is used to call `downloadProfile`
