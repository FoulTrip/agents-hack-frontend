import { auth } from './auth';
import { NextResponse } from 'next/server';

/**
 * Proxy middleware de autenticación para Next.js 16
 * Maneja la protección de rutas y redirecciones basadas en el estado de autenticación
 */
export default auth((req) => {
    const { pathname } = req.nextUrl;
    const session = req.auth;
    const isLoggedIn = !!session?.user;

    console.log(`[Proxy] Path: ${pathname} | User: ${session?.user?.email}`);

    // Rutas públicas que no requieren autenticación (excluimos '/' para forzar el login)
    const publicRoutes = ['/auth/signin', '/auth/signup', '/business', '/manifest.webmanifest'];
    const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith('/business/')
    );

    // Redirección si ya está logueado y trata de entrar a login/signup
    if (isPublicRoute && isLoggedIn && (pathname.startsWith('/auth/'))) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Manejo de la raíz / - Redirigir a login si no hay sesión
    if (pathname === '/') {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/auth/signin', req.url));
        }
        // Si está logueado, permitir el acceso a / si es el dashboard principal
        return NextResponse.next();
    }

    // Protección de rutas privadas (Chat, Panel, etc.)
    if (!isPublicRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        /*
         * Coincide con todas las rutas excepto:
         * - api (rutas de API)
         * - _next/static (archivos estáticos)
         * - _next/image (optimización de imágenes)
         * - favicon.ico, manifestation.webmanifest, robots.txt, sitemap.xml
         * - Archivos estáticos
         */
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};