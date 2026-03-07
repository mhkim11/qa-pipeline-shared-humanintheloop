import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import checkFile from 'eslint-plugin-check-file';

export default tseslint.config({
  extends: [js.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier, eslintPluginPrettierRecommended],
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: {
      React: true,
      google: true,
      mount: true,
      mountWithRouter: true,
      shallow: true,
      shallowWithRouter: true,
      context: true,
      expect: true,
      jsdom: true,
      JSX: true,
    },
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
    },
  },

  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
    import: importPlugin,
    'check-file': checkFile,
  },
  ignores: [
    'public/**/*',
    'dist/**/*',
    'build/**/*',
    'src/lib/**/*',
    'src/types/**/*',
    'src/__mocks__/**/*',
    'node_modules/**/*',
    'coverage/**/*',
    'cypress/**/*',
    'babel.config.js',
    'tailwind.config.js',
    'postcss.config.cjs',
    'vite.config.ts',
    'jest.config.cjs',
    'jest.setup.ts',
    'jest.polyfills.js',
    'cypress.config.js',
    'send-notion.js',
  ],
  rules: {
    'tailwindcss/no-custom-classname': 'off',
    'tailwindcss/enforces-shorthand': 'off',
    'prettier/prettier': [
      'error',
      {
        semi: true,
        tabWidth: 2,
        printWidth: 140,
        singleQuote: true,
        trailingComma: 'all',
        jsxSingleQuote: true,
        bracketSpacing: true,
        plugins: ['prettier-plugin-tailwindcss'],
        tailwindConfig: './tailwind.config.js',
        tailwindFunctions: ['classnames', 'clsx', 'ctl', 'cn', 'tw', 'cva'],
      },
    ], // ! prettier 설정
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        leadingUnderscore: 'allow',
        custom: {
          regex: '^I[A-Z]',
          match: true,
        },
      },

      {
        selector: 'typeLike',
        format: ['PascalCase'],
        leadingUnderscore: 'allow',
        prefix: ['T'],
      },
      {
        selector: 'class',
        format: ['PascalCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: ['variable', 'function', 'objectLiteralProperty', 'objectLiteralMethod'],
        types: ['function'],
        format: ['PascalCase', 'UPPER_CASE', 'camelCase'],
        leadingUnderscore: 'allow',
      },
      // {
      //   selector: ['variable'],
      //   format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
      //   leadingUnderscore: 'allow',
      // },
      {
        selector: 'memberLike',
        modifiers: ['private'],
        format: ['camelCase'],
        leadingUnderscore: 'require',
      },
    ],

    'check-file/filename-naming-convention': [
      'error',
      {
        '**/*.{ts,jsx,tsx}': 'KEBAB_CASE',
      },
      { ignoreMiddleExtensions: true },
    ],
    'check-file/folder-naming-convention': [
      'error',
      {
        'src/!{__tests__,__mocks__}/**/': 'KEBAB_CASE',
      },
    ],

    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '@styled/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@hooks/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@stores/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@atoms/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@query/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@apis/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@type/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@components/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@pages/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@constants/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@assets/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@lib/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react', '@query', '@type', '@apis', '@stores'],
        distinctGroup: false,
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    // ! import 를 사용할 때 경로를 정렬하지 않으면 경고를 발생시킵니다.
    'no-restricted-imports': [
      'error',
      {
        patterns: ['*/templates/*', '../', './'],
        paths: [
          {
            name: 'lodash-es',
            importNames: ['chain'],
            message: 'Do not use `_.chain` and `chain` it with `_.flow` instead.',
          },
        ],
      },
    ],
    'spaced-comment': ['warn', 'always', { markers: ['/'] }],
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
    '@typescript-eslint/dot-notation': ['error', { allowKeywords: true }],
    '@typescript-eslint/no-empty-function': ['warn', { allow: ['methods'] }],

    // ! 사용되지 않는 변수에 대한 경고를 무시합니다.
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'no-shadow': ['error', { builtinGlobals: false, hoist: 'functions', allow: [], ignoreOnInitialization: false }],
    quotes: ['error', 'single', { allowTemplateLiterals: true }], // ! 따옴표 사용 & 템플릿 리터럴만 허용
    'no-duplicate-imports': 'error', // ! 중복된 import 를 사용하면 에러를 발생시킵니다.
    // ! ts-ignore, ts-expect-error, ts-nocheck, ts-check 를 사용하면 에러를 발생시킵니다.
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': 'allow-with-description',
        'ts-check': 'allow-with-description',
        minimumDescriptionLength: 3,
      },
    ],
    '@typescript-eslint/no-use-before-define': 'error', // ! 변수를 선언하기 전에 사용하면 에러를 발생시킵니다.
    'react-hooks/rules-of-hooks': 'error', // ! react hooks 를 사용하지 않으면 에러를 발생시킵니다.
    'react-hooks/exhaustive-deps': 'warn', // ! useEffect 에서 의존성 배열 경고,에러를 발생시키지 않습니다.
    'react/prop-types': 'off', // ! prop-types 를 사용하지 않아도 경고를 발생시키지 않습니다.
    'react/display-name': 'off', // ! displayName 을 사용하지 않아도 경고를 발생시키지 않습니다.
    'react/jsx-props-no-spreading': 'off', // ! props 를 전달할 때 spread 연산자를 사용하지 않아도 경고를 발생시키지 않습니다.

    // ------------------ 에러 , 경고 모음 끝 ------------------

    'react/react-in-jsx-scope': 'off', // ? react import 를 안해도 에러 안뜨게 합니다
    '@typescript-eslint/no-explicit-any': 'off', // ? any 타입을 사용해도 경고를 안뜨게 합니다
    'no-unused-vars': 'off', // ? 사용되지 않는 변수에 대한 경고를 무시합니다.
    camelcase: 'off', // ? 카멜케이스를 사용하지 않아도 경고를 발생시키지 않습니다.
    '@typescript-eslint/no-var-requires': 'off', // ? require 를 사용해도 경고를 발생시키지 않습니다.

    '@typescript-eslint/explicit-member-accessibility': 'off', // ? 클래스 멤버 접근 제한자를 사용하지 않아도 경고를 발생시키지 않습니다.
    '@typescript-eslint/no-parameter-properties': 'off', // ? 생성자의 매개변수에 접근 제한자를 사용하지 않아도 경고를 발생시키지 않습니다.
    '@typescript-eslint/explicit-module-boundary-types': 'off', // ? 모듈의 반환 타입을 명시하지 않아도 경고를 발생시키지 않습니다.
  },
});
