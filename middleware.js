import NextAuth from "next-auth";
import { authConfig } from "./lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = ['/login', '/register', '/'].includes(nextUrl.pathname);
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  if (isApiAuthRoute) {
    return null;
  }

  if (isApiRoute) {
    if (!isLoggedIn) {
      return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
    }
    return null;
  }

  if (isPublicRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', nextUrl));
    }
    return null;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  return null;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
