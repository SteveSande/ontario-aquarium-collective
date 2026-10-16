// @ts-check
import { defineConfig, envField } from "astro/config";

// https://astro.build/config
export default defineConfig({
    env: {
        schema: {
            API_URL: envField.string({
                context: "server",
                access: "public",
            }),
        },
    },
});
