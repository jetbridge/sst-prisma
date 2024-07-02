import { fixupConfigRules } from "@eslint/compat";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...fixupConfigRules(compat.extends(
    "../.eslintrc.yml",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
)), {
    languageOptions: {
        globals: {
            ...globals.browser,
            ...Object.fromEntries(Object.entries(globals.node).map(([key]) => [key, "off"])),
        },
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "@typescript-eslint/no-empty-interface": "off",
        "react/prop-types": 0,
        "react/destructuring-assignment": 0,
        "react/no-unescaped-entities": 1,
        "react/require-default-props": 0,
        "react/jsx-props-no-spreading": 0,
        "react/jsx-no-useless-fragment": 1,
        "react/jsx-curly-brace-presence": 1,
        "react/no-unused-prop-types": 1,
        "react/button-has-type": 0,
        "react/jsx-no-duplicate-props": 0,

        "react/jsx-filename-extension": [1, {
            extensions: [".tsx", ".jsx"],
        }],
    },
}];