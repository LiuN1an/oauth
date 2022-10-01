# oauth

Based on openid-client, take advantage of search params of state to customize state in callback url

## Simple mechanisation

- To return authorization url to the client browser from server in `getAuthUrl` method, then the client will open a url not in our project's domain

- Use the authorization code mode and make users grant it, we will get code from returned callback url writed in our domain from **oauth's grant server**

- We check the state in callback url and get the code, then we could send request to **oauth's token end point server** to get access_token and someone else which can allow private server to get the information of the account in a limited time

- We take the token to request **oauth's user end point server** to get the users' information which is scoped in the first step, it's claimed in the scope params in authorization url

## Why do this

A project need to custom login flow in oauth's situation, so it requires the custom params when the redirect url has worked
