import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";

export const providerFlags = {
  github: Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
  google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
};

const providers: Provider[] = [];
if (providerFlags.github) providers.push(GitHub({ authorization: { params: { scope: "read:user user:email public_repo" } } }));
if (providerFlags.google) providers.push(Google);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? "architect-2-demo-only-secret-change-me",
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "github" && account.access_token) token.ghToken = account.access_token;
      if (account?.provider) token.provider = account.provider;
      return token;
    },
    async session({ session, token }) {
      (session as { provider?: string }).provider = token.provider as string | undefined;
      return session;
    },
  },
});
