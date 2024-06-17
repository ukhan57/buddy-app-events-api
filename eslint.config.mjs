import pluginJs from "@eslint/js";

export default [
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: { /* Define your global variables here */ } } },
  pluginJs.configs.recommended,
];
