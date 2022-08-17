import { withAuth } from 'next-auth/middleware';

// require authentication for certain routes

// can do custom authorization checks here
export default withAuth(
  function middleware(req) {
    console.log(req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // apply to these routes
  matcher: ['/profile/:path*'],
};
