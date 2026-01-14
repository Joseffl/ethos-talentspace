// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/api(.*)",
//   "/courses/:courseId/lessons/:lessonId",
//   "/products(.*)",
// ]);

// const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// export default clerkMiddleware(async (auth, req) => {
//   if (isAdminRoute(req)) {
//     const user = await auth.protect();
//     if (user.sessionClaims.role !== "admin") {
//       return new NextResponse(null, { status: 404 });
//     }
//   }

//   if (!isPublicRoute(req)) {
//     await auth.protect();
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };


// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/api/webhooks(.*)", 
//   "/courses/:courseId/lessons/:lessonId",
//   "/products(.*)",
// ]);

// export default clerkMiddleware(async (auth, req) => {
//   const url = req.nextUrl;
//   const hostname = req.headers.get("host") || "";

//   if (hostname === "admin.magsengineeringlimited.com") {
//     const { sessionClaims } = await auth();
    
//     if (sessionClaims?.role !== "admin") {
//       return new NextResponse("Not Found", { status: 404 });
//     }

//     if (!url.pathname.startsWith("/admin")) {
//       const adminUrl = new URL(`/admin${url.pathname === "/" ? "" : url.pathname}`, req.url);
//       return NextResponse.rewrite(adminUrl);
//     }
    
//     return NextResponse.next();
//   }

//   if (!isPublicRoute(req)) {
//     await auth.protect();
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", 
  "/courses/:courseId/lessons/:lessonId",
  "/products(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // 1. Handle Admin Subdomain Logic
  if (hostname === "admin.magsengineeringlimited.com") {
    const { userId, sessionClaims, redirectToSignIn } = await auth();

    // If NOT logged in, send them to the login page
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    
    // If logged in but NOT an admin, show 404
    // Note: sessionClaims.role is available due to your typeOverrides
    if (sessionClaims?.role !== "admin") {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Rewrite logic: ensures 'admin.example.com/dashboard' maps to '/admin/dashboard'
    if (!url.pathname.startsWith("/admin")) {
      const adminPath = url.pathname === "/" ? "" : url.pathname;
      const adminUrl = new URL(`/admin${adminPath}`, req.url);
      return NextResponse.rewrite(adminUrl);
    }
    
    return NextResponse.next();
  }

  // 2. Handle Protection for Main Domain/Dashboard
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};