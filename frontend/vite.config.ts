import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  
  return {
    // Configuration de base pour les chemins des ressources
    base: isProduction ? '/' : '/',
    publicDir: 'public',
    
    // Configuration du serveur de développement
    server: {
      host: '0.0.0.0',
      port: 3000, // Port pour le développement
      strictPort: true,
      open: true,
      proxy: {
        // Redirection des requêtes API vers le backend
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          ws: true,
          // Ne pas réécrire le chemin pour le développement
          // Le backend attend les requêtes avec le préfixe /api
        },
      },
    },
    // Configuration pour la construction de production
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
    },
    // Définir les variables d'environnement accessibles côté client
    define: {
      'process.env': {
        VITE_API_URL: JSON.stringify(env.VITE_API_URL || '/api'),
        NODE_ENV: JSON.stringify(mode),
      },
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
