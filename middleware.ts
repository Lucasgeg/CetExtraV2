"use server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

// Définition des routes publiques selon l'environnement
const basePublicRoutes = [
  "/", // Accueil
  "/blog(.*)", // Blog et sous-routes
  "/about(.*)", // À propos et sous-routes
  "/sign-in(.*)", // Connexion et sous-routes
  "/api/blog(.*)", // API du blog et sous-routes
  "/api/address(.*)", // API du blog et sous-routes
  "/public(.*)", // Ressources publiques
  "/sitemap(.*)", // Sitemap
  "/robots.txt"
];

// Les routes publiques additionnelles pour dev/rec
const devPublicRoutes = ["/sign-up(.*)", "/api/users/sign-up"];

const protectedRoutes = [
  "/company(.*)", // Routes de l'entreprise
  "/extra(.*)", // Routes de l'extra
  "/api/mission(.*)",
  "/api/missions(.*)",
  "/api/blog/send-mail(.*)" // API pour envoyer des emails
];

// Détection de l'environnement
const isProd = process.env.VERCEL_ENV === "production";

// Création du matcher selon l'environnement
const isPublicRoute = createRouteMatcher(
  isProd ? basePublicRoutes : [...basePublicRoutes, ...devPublicRoutes]
);

const isProtectedRoute = createRouteMatcher(protectedRoutes);

const isAdminRoute = createRouteMatcher(["/blog/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  if (isAdminRoute(request)) {
    await auth.protect();

    if (userId !== process.env.ADMIN_USER_ID) {
      notFound();
    }
  } else if (isProd) {
    // En production, seules les routes de base sont publiques
    if (!isPublicRoute(request)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (isProtectedRoute(request)) {
      await auth.protect(); // Redirige vers /sign-in si non connecté
    }
    const { pathname } = request.nextUrl;
    if (userId && pathname === "/") {
      const isFromAuth =
        request.headers.get("referer")?.includes("/sign-in") ||
        request.headers.get("referer")?.includes("/sign-up");

      if (isFromAuth) {
        if (sessionClaims?.publicMetadata.role === "company") {
          return NextResponse.redirect(new URL("/company", request.url));
        }
        if (sessionClaims?.publicMetadata.role === "extra") {
          return NextResponse.redirect(new URL("/extra", request.url));
        }
      }
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};
