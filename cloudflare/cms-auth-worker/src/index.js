const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return text("Method not allowed", 405);
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return text("Brent & Denise CMS auth worker is running.");
    }

    if (url.pathname === "/auth") {
      return redirectToGitHub(request, env);
    }

    if (url.pathname === "/callback") {
      return handleGitHubCallback(request, env);
    }

    return text("Not found", 404);
  },
};

function redirectToGitHub(request, env) {
  assertEnv(env, ["GITHUB_OAUTH_ID"]);

  const url = new URL(request.url);
  const scope = normalizeScope(url.searchParams.get("scope"), env);
  const state = buildState(url.searchParams, env);
  const redirectUri = `${url.origin}/callback`;

  const githubUrl = new URL(GITHUB_AUTHORIZE_URL);
  githubUrl.searchParams.set("client_id", env.GITHUB_OAUTH_ID);
  githubUrl.searchParams.set("redirect_uri", redirectUri);
  githubUrl.searchParams.set("scope", scope);
  githubUrl.searchParams.set("state", state);
  githubUrl.searchParams.set("allow_signup", "false");

  return Response.redirect(githubUrl.toString(), 302);
}

async function handleGitHubCallback(request, env) {
  assertEnv(env, ["GITHUB_OAUTH_ID", "GITHUB_OAUTH_SECRET"]);

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = parseState(url.searchParams.get("state"), env);

  if (error) {
    return authMessagePage("error", state.origin, {
      error,
      error_description: url.searchParams.get("error_description") || "GitHub authorization failed.",
      provider: "github",
    });
  }

  if (!code) {
    return authMessagePage("error", state.origin, {
      error: "missing_code",
      error_description: "GitHub did not return an authorization code.",
      provider: "github",
    });
  }

  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "brent-and-denise-cms-auth-worker",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_ID,
      client_secret: env.GITHUB_OAUTH_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
    return authMessagePage("error", state.origin, {
      error: tokenData.error || "token_exchange_failed",
      error_description: tokenData.error_description || "GitHub did not return an access token.",
      provider: "github",
    });
  }

  return authMessagePage("success", state.origin, {
    token: tokenData.access_token,
    provider: "github",
  });
}

function buildState(params, env) {
  return btoa(
    JSON.stringify({
      origin: allowedCmsOrigin(params.get("site_id"), env),
      provider: params.get("provider") || "github",
      ts: Date.now(),
    }),
  );
}

function parseState(value, env) {
  if (!value) {
    return { origin: env.CMS_ORIGIN || "https://brentanddenise.com" };
  }

  try {
    const parsed = JSON.parse(atob(value));
    return {
      origin: allowedCmsOrigin(parsed.origin, env),
    };
  } catch {
    return { origin: env.CMS_ORIGIN || "https://brentanddenise.com" };
  }
}

function allowedCmsOrigin(siteId, env) {
  const configuredOrigin = env.CMS_ORIGIN || "https://brentanddenise.com";

  if (!siteId) {
    return configuredOrigin;
  }

  if (siteId === "brentanddenise.com" || siteId === configuredOrigin) {
    return configuredOrigin;
  }

  try {
    const parsed = new URL(siteId);
    if (parsed.origin === configuredOrigin) {
      return configuredOrigin;
    }
  } catch {
    // Ignore malformed site_id values and fall back to the configured origin.
  }

  return configuredOrigin;
}

function normalizeScope(scope, env) {
  if (scope) {
    return scope;
  }

  return env.GITHUB_REPO_PRIVATE === "1" ? "repo" : "public_repo";
}

function authMessagePage(status, targetOrigin, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>CMS Login</title>
  </head>
  <body>
    <p>Completing CMS login...</p>
    <script>
      (function () {
        var message = ${JSON.stringify(message)};
        var targetOrigin = ${JSON.stringify(targetOrigin)};

        if (window.opener) {
          window.opener.postMessage(message, targetOrigin);
          window.close();
        } else {
          document.body.textContent = "CMS login completed. You can close this window.";
        }
      })();
    </script>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

function assertEnv(env, names) {
  const missing = names.filter((name) => !env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
}

function text(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
