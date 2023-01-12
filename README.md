# ZoomOAuth
Simple OAuth app using Zoom API with refresh token logic. App will print out the user's profile information in JSON format. 

Follow Zoom documentation to create an OAuth app where credentials will be generated

[OAuth apps with Zoom](https://marketplace.zoom.us/docs/guides/auth/oauth/)

[Create OAuth APP](https://marketplace.zoom.us/docs/guides/build/oauth-app/)


# Add scopes
For this app you will need to add the proper scopes. The only scope we will need is the scope to read user profile information.

To request data,we'll need to add that scope to our app. Click + Add Scopes and add "View your user information" (`user:read meeting:read meeting:write`). Click Done and continue on to the Installation page.

# Set up app locally
Clone and install the app and it's dependencies. We'll be using Express for a basic Node.js server, dotenv for our credentials, axios to make HTTP requests React for frontend and cookie-session to store session variables

`git clone https://github.com/cordelljenkins1914/OAuth.git`

`cd OAuth && npm install`

Run Server:

`npm start`

# Set up dotenv file

Create a .env file in which to store your PORT, access credentials, and Redirect URL.


`touch .env`

Copy the following into this file, which we'll add your own values to:

```
PORT=
CLIENT_ID=
CLIENT_SECRET=
REDIRECTURI=
```


