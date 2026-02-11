/**
 * getCleanUrl - Versión de Producción Final.
 * Maneja tanto archivos nuevos (Subidos por App) como viejos (Movidos a storage/recursos).
 */
export const getCleanUrl = (url) => {
    if (!url) return '';
    
    const backendDomain = 'https://api.simba.xpertiaplus.com';

    // 1. Limpieza de dominios y duplicados
    let path = url
        .replace(/https?:\/\/simba\.xpertiaplus\.com/g, '')
        .replace(/https?:\/\/api\.simba\.xpertiaplus\.com\/api/g, '')
        .replace(/https?:\/\/api\.simba\.xpertiaplus\.com/g, '')
        .replace('http://localhost:8000', '')
        .replace(/^\/?public\//, '/')
        .trim();

    // 2. MAPEO DE LEGACY (Traductor de carpetas)
    // Si la DB pide la ruta vieja, la mandamos a la carpeta física oficial en storage
    if (path.includes('partituras/caporal')) {
        path = path.replace('/partituras/caporal', '/storage/recursos');
    }

    // 3. Normalizar el prefijo /api/storage/ que a veces Laravel guarda
    path = path.replace('/api/storage/', '/storage/');

    // Aseguramos que empiece con una sola barra
    if (!path.startsWith('/')) path = '/' + path;

    // Retornamos URL absoluta para evitar que el navegador use el dominio del frontend
    return backendDomain + path;
};
