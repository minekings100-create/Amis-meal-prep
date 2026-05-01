import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // React 19's new rule flags every hydration-marker pattern (`useEffect(() => setMounted(true), [])`)
      // and prop-sync pattern. We use these intentionally for SSR-safe rendering and prop→state mirroring;
      // refactoring all of them to useSyncExternalStore is more churn than the rule is worth right now.
      // Re-enable per-file with eslint-disable when adopting cleaner patterns.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
