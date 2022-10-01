const { encrypt } = require("./utils/crypto");
const { Issuer, generators } = require("openid-client");

/**
 * 可以用于为对应的provider添加对应的钩子函数
 */
class OAuthHooks {
  constructor() {}
}

class OAuthCore {
  providers = new Map();

  issuers = new Map();

  clients = new Map();

  hooks = new OAuthHooks();

  authorization(name) {
    if (this.providers.has(name)) {
      return this.providers.get(name)["authorization"].query || {};
    }
    return {};
  }

  callbackUrl(name) {
    if (this.providers.has(name)) {
      return this.providers.get(name)["callbackUrl"] || "";
    }
    return "";
  }

  userinfo(name) {
    if (this.providers.has(name)) {
      return this.providers.get(name)["userInfo"]?.query || {};
    }
    return {};
  }

  secret(name) {
    if (this.providers.has(name)) {
      return {
        client_id: this.providers.get(name)["clientId"],
        client_secret: this.providers.get(name)["clientSecret"],
      };
    }
    return {};
  }

  idToken(name) {
    if (this.providers.has(name)) {
      return Boolean(this.providers.get(name).idToken);
    }
    return false;
  }

  profileParsers(name: string): (profile: any, token: any) => any {
    if (this.providers.has(name)) {
      return this.providers.get(name)["profile"];
    }
    return () => ({});
  }

  client(name: string) {
    return this.clients.get(name);
  }

  constructor(_secret) {
    this._secret = _secret; // 密钥
  }

  async addProvider(provider) {
    const { name, config } = provider;
    this.providers.set(name, config);
    const {
      authorization,
      token,
      userInfo,
      clientId,
      clientSecret,
      callbackUrl,
      wellKnown,
    } = provider.config;

    if (
      authorization &&
      token &&
      userInfo &&
      clientId &&
      clientSecret &&
      callbackUrl &&
      wellKnown
    ) {
      let issuer;
      if (wellKnown) {
        issuer = await Issuer.discover(wellKnown);
      } else {
        issuer = new Issuer({
          issuer: provider.name,
          authorization_endpoint: authorization.url,
          token_endpoint: token.url,
          userinfo_endpoint: userInfo.url,
        });
      }
      const client = new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [callbackUrl],
        ...(provider.config?.client || {}),
      });
      client[custom.clock_tolerance] = 10;
      this.issuers.set(provider.name, issuer);
      this.clients.set(provider.name, client);
    }
  }

  async addProviders(providers) {
    for (const provider of providers) {
      await this.addProvider(provider);
    }
  }

  async getAuthUrl(name, query) {
    if (this.clients.has(name)) {
      const client = this.clients.get(name);
      const searchParams = this.#buildExtra(query);
      const url = client.authorizationUrl({
        ...this.authorization(name),
        ...searchParams,
      });
      return { url, searchParams };
    }
  }

  /**
   * 可以通过query向state中添加自定义的传参
   */
  #buildExtra(query) {
    let searchParams = {};

    const state = encrypt(JSON.stringify(query), this._secret);
    searchParams.state = state;

    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    searchParams.code_challenge = code_challenge;
    searchParams.code_challenge_method = this._secret;

    return searchParams;
  }
}

export { OAuthCore };
