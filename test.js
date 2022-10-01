const { profile } = require("console");
const { OAuthCore } = require("./oauth-core");
const { twitter, discord, instagram } = require("./test-providers");

const oauth = new OAuthCore("my secret");

oauth.addProviders([twitter, discord, instagram]);

/**
 * 该函数发生在redirect发生后
 */
const run = async () => {
  const name = "twitter";
  const query = {};

  const client = oauth.client(name);
  const params = {
    ...client.callbackParams({
      url: `http://n?${new URLSearchParams(query)}`,
    }),
  };

  const token = await client.oauthCallback(
    oauth.callbackUrl(name),
    params,
    {
      state, // 这里是callback回来的state的真实值
      code_verifier, // 这里是callback回来的code_verifier
    },
    {
      exchangeBody: {
        client_secret: oauth.secret(provider).client_secret,
        client_id: oauth.secret(provider).client_id,
      },
    }
  );

  profile = await client.userinfo(token, {
    params: oauth.userinfo(name),
  });

  profile = await oauth.profile(name)?.(profile, token);

  console.log(profile);
};

run();
