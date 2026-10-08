export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: "database" },
  providers: [],
  callbacks: {
    async session({ session, user, token }) {
      if (session?.user && user?.id) {
        session.user.id = user.id;
      } else if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
};
