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

  if (hostname === "admin.magsengineeringlimited.com") {
    const { sessionClaims } = await auth();
    
    if (sessionClaims?.role !== "admin") {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (!url.pathname.startsWith("/admin")) {
      const adminUrl = new URL(`/admin${url.pathname === "/" ? "" : url.pathname}`, req.url);
      return NextResponse.rewrite(adminUrl);
    }
    
    return NextResponse.next();
  }

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