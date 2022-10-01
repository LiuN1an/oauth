const twitter = {
  name: "twitter",
  config: {
    authorization: {
      url: "https://twitter.com/i/oauth2/authorize",
      query: {
        scope: "users.read tweet.read offline.access",
      },
    },
    token: { url: "https://api.twitter.com/2/oauth2/token" },
    userInfo: {
      url: "https://api.twitter.com/2/users/me",
      query: { "user.fields": "profile_image_url" },
    },
    clientId: process.env.TWITTER_ID,
    clientSecret: process.env.TWITTER_SECRET,
    callbackUrl: process.env.TWITTER_CALLBACKURL,
    /**
     * 自定义从user_end_point服务器拿到的用户数据
     */
    profile(props) {
      const { data } = props;
      return {
        id: data?.id,
        name: data?.name,
        // NOTE: E-mail is currently unsupported by OAuth 2 Twitter.
        email: data?.email,
        image: data?.profile_image_url,
      };
    },
  },
};

const discord = {
  name: "discord",
  config: {
    authorization: {
      url: "https://discord.com/api/oauth2/authorize",
      query: {
        scope: "email identify",
      },
    },
    token: { url: "https://discord.com/api/oauth2/token" },
    userInfo: { url: "https://discord.com/api/users/@me" },
    clientId: process.env.DISCORD_ID,
    clientSecret: process.env.DISCORD_SECRET,
    callbackUrl: process.env.DISCORD_CALLBACKURL,
    profile(profile: any) {
      if (profile.avatar === null) {
        const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
        profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
      } else {
        const format = profile.avatar?.startsWith("a_") ? "gif" : "png";
        profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
      }
      return {
        id: profile.id,
        name: profile.username,
        email: profile.email,
        image: profile.image_url,
      };
    },
  },
};

const instagram = {
  name: "instagram",
  config: {
    authorization: {
      url: "https://api.instagram.com/oauth/authorize",
      query: {
        scope: "user_profile,user_media",
      },
    },
    token: { url: "https://api.instagram.com/oauth/access_token" },
    userInfo: {
      url: "https://graph.instagram.com/me",
      query: { fields: "id,username,account_type,name" },
    },
    client: {
      token_endpoint_auth_method: "client_secret_post",
    },
    clientId: process.env.INSTAGRAM_ID,
    clientSecret: process.env.INSTAGRAM_SECRET,
    callbackUrl: process.env.INSTAGRAM_CALLBACKURL,
    async profile(profile: any) {
      return {
        id: profile.id,
        name: profile.username,
        email: null,
        image: null,
      };
    },
  },
};

export { twitter, discord, instagram };
