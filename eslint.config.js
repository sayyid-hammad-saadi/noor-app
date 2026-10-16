// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

// Colors live only in src/theme. Everywhere else must read them from theme tokens.
const COLOR_LITERAL =
  '^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\\(.*\\))$';
const NAMED_COLOR =
  '^(white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|teal|navy|gold|silver|maroon|olive|lime|aqua|fuchsia|cyan|magenta)$';
const colorMessage = 'Hard-coded colors are not allowed. Use a token from useTheme().colors.';

module.exports = defineConfig([
  expoConfig,
  prettierRecommended,
  {
    ignores: ['dist/*', '.expo/*', 'android/*', 'ios/*', 'expo-env.d.ts'],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['src/theme/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=/${COLOR_LITERAL}/]`, message: colorMessage },
        { selector: `TemplateElement[value.raw=/${COLOR_LITERAL}/]`, message: colorMessage },
        {
          selector: `Property[key.name=/[cC]olor$|^(fill|stroke|backgroundColor|borderColor|tintColor)$/] > Literal[value=/${NAMED_COLOR}/i]`,
          message: colorMessage,
        },
        {
          selector: `JSXAttribute[name.name=/[cC]olor$|^(fill|stroke)$/] > Literal[value=/${NAMED_COLOR}/i]`,
          message: colorMessage,
        },
      ],
    },
  },
]);
