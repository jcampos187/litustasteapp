import nextConfig from "eslint-config-next";
import tseslint from "typescript-eslint";

const config = [
  // Spread the Next.js recommended flat config
  ...nextConfig,

  // Project-specific overrides
  {
    // Explicitly declare the @typescript-eslint plugin so rules work in flat config
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Allow img elements (we use them intentionally for simple images)
      "@next/next/no-img-element": "off",

      // Warn on unused vars (auto-fixable)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      // Allow console.error and console.warn in API routes
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // Override the ignores to match the project structure
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },
];

export default config;
