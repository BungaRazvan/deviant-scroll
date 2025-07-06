import { clsx, type ClassValue } from "clsx";
import { AuthOptions } from "next-auth";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const authOptions: AuthOptions = {
  providers: [
    {
      name: "DeviantArt",
      id: "deviantart",
      type: "oauth",
      clientId: process.env.DEVIANTART_CLIENT_ID,
      clientSecret: process.env.DEVIANTART_CLIENT_SECRET,
      authorization: {
        url: "https://www.deviantart.com/oauth2/authorize",
        params: {
          scope: "user browse gallery collection",
          client_id: process.env.DEVIANTART_CLIENT_ID,
          response_type: "code",
        },
      },
      token: {
        async request(context) {
          const currentTime = new Date();

          const client_id = process.env.DEVIANTART_CLIENT_ID as string;
          const client_secret = process.env.DEVIANTART_CLIENT_SECRET as string;
          const code = context.params.code as string;
          const redirect_uri = process.env.DEVIANTART_REDIRECT_URI as string;
          const grant_type = "authorization_code";

          const response = await fetch(
            "https://www.deviantart.com/oauth2/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                client_id,
                client_secret,
                code,
                redirect_uri,
                grant_type,
              }),
            }
          );

          const data = await response.json();

          return {
            tokens: {
              access_token: data.access_token,
              token_type: data.token_type,
              refresh_token: data.refresh_token,
              scope: data.scope,
              expires_at: currentTime.getTime() + data.expires_in * 1000,
            },
          };
        },
      },
      userinfo: {
        async request({ tokens }) {
          const response = await fetch(
            "https://www.deviantart.com/api/v1/oauth2/user/whoami",
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            }
          );

          const user = await response.json();

          return user;
        },
      },
      profile(profile, tokens) {
        return {
          id: profile.userid,
          name: profile.username,
          email: null,
          image: profile.usericon,
        };
      },
    },
  ],
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.expiresAt = account.expires_at;
        token.refreshToken = account.refresh_token;
      }

      // Check if the token is expired
      if (
        !account &&
        token.expiresAt &&
        // @ts-ignore
        Date.now() > token.expiresAt - 60_000
      ) {
        try {
          const client_id = process.env.DEVIANTART_CLIENT_ID!;
          const client_secret = process.env.DEVIANTART_CLIENT_SECRET!;
          const grant_type = "refresh_token";
          const refresh_token = token.refreshToken as string;

          const response = await fetch(
            "https://www.deviantart.com/oauth2/token",
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                client_id,
                client_secret,
                grant_type,
                refresh_token,
              }),
            }
          );

          const refreshedTokens = await response.json();

          if (!response.ok) {
            throw new Error("Failed to refresh access token");
          }
          return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Keep the old refresh token if not returned
          };
        } catch (error) {
          console.error("Error refreshing access token:", error);
          return { ...token, error: "RefreshTokenError" };
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.error === "RefreshTokenError") {
        return null; // Forces logout if token refresh fails
      }

      // @ts-ignore
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
