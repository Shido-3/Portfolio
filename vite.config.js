import { defineConfig } from "vite";

export default defineConfig({
    base: "./2D-Portfolio", // Makes it so that the server hosting can read the code
    build: {
        minify: "terser", // Code shrinker, makes javascript files smaller in size
    },
});