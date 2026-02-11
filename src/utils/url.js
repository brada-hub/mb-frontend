/**
 * getCleanUrl - Normaliza URLs de archivos dinámicos (imágenes, PDFs, audios)
 * para que siempre apunten al backend correcto, ya sea en local o producción.
 */
export const getCleanUrl = (url) => {
    if (!url) return '';
    
    // Si la URL ya empieza con la base actual del backend, no hacemos nada
    const apiBase = import.meta.env.VITE_API_URL || '';
    const backendBase = apiBase.endsWith('/api') ? apiBase.replace('/api', '') : apiBase;

    // Extraer solo el path si es una URL absoluta (posiblemente con dominio viejo/incorrecto)
    let path = '';
    try {
        if (url.startsWith('http')) {
            const urlObj = new URL(url);
            path = urlObj.pathname + urlObj.search;
        } else {
            // Ya es un path relativo
            path = url.startsWith('/') ? url : '/' + url;
        }
    } catch (e) {
        path = url;
    }

    // Prevenir duplicación si el path ya incluye la base
    if (backendBase && path.startsWith(backendBase)) {
        return path;
    }

    return backendBase + path;
};
