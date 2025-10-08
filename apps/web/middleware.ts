import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // If it's a public route, allow access
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access protected route
  if (!userId) {
    return NextResponse.redirect(new URL('https://accounts.sparkchat.shivraj-kolekar.in/sign-up', req.url))
  }

  // User is authenticated, allow access
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
