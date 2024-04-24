export default defineConfig({
    base: "./", // Makes it so that the server hosting can read the code
    build: {
        minify: "terser", // Code shrinker, makes javascript files smaller in size
    },
});