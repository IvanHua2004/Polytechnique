import { defineConfig } from 'vite';

const PORT = 3000;

export default defineConfig({
    root: 'src',
    server: {
        port: PORT,
        open: true
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true
    }
});
