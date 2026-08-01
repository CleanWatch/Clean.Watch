import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

// tseslint.config()는 ESLint 10이 defineConfig()를 코어에 넣으면서 deprecated 됐습니다.
// tseslint import 자체는 configs.recommended 때문에 계속 필요합니다.
export default defineConfig([
  // 빌드 결과물 폴더는 린트 검사에서 제외
  { ignores: ['dist'] },
  {
    // JS, TS 공식 권장 규칙 일괄 적용 (배열 전개 구문)
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],

    // 린트 적용할 파일 확장자 지정
    files: ['**/*.{ts,tsx}'],

    // 언어 환경 설정 (브라우저 전역 변수 허용 등)
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    // 사용할 외부 플러그인 등록
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    // 세부 규칙 커스텀
    rules: {
      ...reactHooks.configs.recommended.rules,

      // 컴포넌트 파일에서 컴포넌트가 아닌 값을 함께 export하면
      // Fast Refresh가 동작하지 않고 전체 새로고침이 걸립니다.
      // allowConstantExport: 상수 export는 HMR에 지장이 없으므로 허용
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // 다른 모든 규칙 중 코드 스타일 관련 사항 덮어쓰기
  eslintConfigPrettier,
]);
