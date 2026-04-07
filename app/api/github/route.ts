import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const accessToken = (session as any)?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoUrl = searchParams.get("url");

    if (!repoUrl) {
      return NextResponse.json({ error: "URL del repositorio es requerida" }, { status: 400 });
    }

    // Extract owner/repo
    const match = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
    if (!match) {
      return NextResponse.json({ error: "URL de GitHub inválida" }, { status: 400 });
    }

    const fullRepo = match[1].replace(/\.git$/, "");

    // Validar acceso al repo
    const headers: any = {
      Accept: "application/vnd.github.v3+json",
    };
    if (accessToken) headers.Authorization = `token ${accessToken}`;

    let response = await fetch(`https://api.github.com/repos/${fullRepo}`, { headers });

    // Si el token era inválido para GitHub (ej. es de Google) o expirado, la API de Github devuelve 401
    if (response.status === 401 && accessToken) {
      response = await fetch(`https://api.github.com/repos/${fullRepo}`, {
        headers: { Accept: "application/vnd.github.v3+json" }
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ error: errorData.message || "Error al obtener repo de GitHub" }, { status: response.status });
    }

    const repoData = await response.json();
    return NextResponse.json(repoData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
