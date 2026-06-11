import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that are fully public — no auth required
const isPublicRoute = createRouteMatcher([
  '/',
  '/dashboard(.*)',
  '/calendar(.*)',
  '/todos(.*)',
  '/reminders(.*)',
  '/notes(.*)',
  '/budget(.*)',
  '/habits(.*)',
  '/pomodoro(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook/clerk(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Only protect explicitly private routes (future: /settings, /api/private etc.)
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
