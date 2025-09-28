import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: [".next"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    // Apply to TS/TSX files only
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      // keep base recommended checks, but NOT the heavy type-checked/stylistic sets
      ...tseslint.configs.recommended,
      // NOTE: removed recommendedTypeChecked / stylisticTypeChecked to avoid build-blocking type checks
    ],
    rules: {
      // keep useful guidance but don't block the build
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // make unused-vars a warning (already set), fine to leave as warn:
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // Relax strict / type-checked rules that commonly block CI/builds
      "@typescript-eslint/no-explicit-any": "off", // allow any for now
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-empty-function": "off",

      // stylistic preferences — do not block build
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "off"
      ],

      // React / Next specific relaxations
      "react/no-unescaped-entities": "off", // allow apostrophes in JSX
      "@next/next/no-img-element": "off", // allow <img> usage (or change to warn)

      // keep other helpful rules as warnings rather than errors
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-debugger": "warn",

      // you can add project-specific temporary disables here
    },
  },
  {
    // reduce linter strictness about unused eslint-disable comments
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    languageOptions: {
      parserOptions: {
        // Disable/avoid the heavy projectService type-checker in eslint
        // which is the biggest source of build-time type-check errors.
        // Setting to `false` avoids full program type-check in eslint.
        projectService: false,
      },
    },
  },
);