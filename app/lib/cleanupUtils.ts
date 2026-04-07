
/**
 * Utilidades para limpiar recursos externos (GitHub y Notion)
 * cuando se elimina una sesión/chat.
 */

/**
 * Extrae el owner y repo de una URL de GitHub
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleanUrl = url.replace(/\/$/, "");
    const parts = cleanUrl.split("github.com/")[1]?.split("/");
    if (parts && parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch (e) {
    console.error("Error parseando URL de GitHub:", e);
  }
  return null;
}

/**
 * Extrae el ID de una página de Notion de su URL
 */
export function parseNotionId(url: string): string | null {
  try {
    // Las URLs de Notion suelen terminar en un hash de 32 caracteres
    const matches = url.match(/[a-f0-9]{32}/);
    return matches ? matches[0] : null;
  } catch (e) {
    console.error("Error parseando ID de Notion:", e);
  }
  return null;
}

/**
 * Elimina un repositorio de GitHub
 */
export async function deleteGitHubRepo(token: string, repoUrl: string) {
  const info = parseGitHubUrl(repoUrl);
  if (!info || !token) return;

  console.log(`[Cleanup] Eliminando repo GitHub: ${info.owner}/${info.repo}`);
  
  try {
    const response = await fetch(`https://api.github.com/repos/${info.owner}/${info.repo}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn(`[Cleanup] No se pudo eliminar repo GitHub: ${err}`);
    } else {
      console.log(`[Cleanup] Repo GitHub eliminado con éxito`);
    }
  } catch (e) {
    console.error("[Cleanup] Error llamando a API de GitHub:", e);
  }
}

/**
 * Archiva una página de Notion
 */
export async function archiveNotionPage(token: string, pageUrl: string) {
  const pageId = parseNotionId(pageUrl);
  if (!pageId || !token) return;

  console.log(`[Cleanup] Archivando página Notion: ${pageId}`);

  try {
    // Nota: Notion API v1 requiere el header Notion-Version
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({ archived: true })
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn(`[Cleanup] No se pudo archivar página Notion: ${err}`);
    } else {
      console.log(`[Cleanup] Página Notion archivada con éxito`);
    }
  } catch (e) {
    console.error("[Cleanup] Error llamando a API de Notion:", e);
  }
}
