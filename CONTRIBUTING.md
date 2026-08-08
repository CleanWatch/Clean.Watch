# 🛠️ CleanWatch 팀 기여 가이드 (Contributing Guide)

TypeScript + Vite 환경입니다.
원활한 협업과 일관된 코드 품질을 유지하기 위해 아래 가이드를 읽고 작업을 진행해 주세요.

## 🚀 로컬 개발 환경 실행 (Getting Started)

이 프로젝트는 Vercel Serverless Function(백엔드 API)과 React(프론트엔드)가 결합된 구조입니다.
정상적인 API 통신(디스코드 로그인, 캡챠 검증 등)을 포함하여 로컬에서 테스트하려면, 일반적인 명령어 대신 **Vercel CLI**를 사용해야 합니다.

**1. Vercel CLI 전역 설치 (최초 1회)**

```bash
npm i -g vercel
```

**2. 패키지 설치**

```bash
npm i
```

**3. 로컬 서버 실행**

```bash
vercel dev
```

⚠️ 주의: npm run dev로 실행하면 프론트엔드 화면만 구동되어 API 서버 통신이 불가능합니다. 무조건 vercel dev 명령어를 사용해 주세요! (최초 실행 시 Vercel 계정 로그인 및 프로젝트 Link 과정이 필요할 수 있습니다.)

🔥 **로컬도 프로덕션 Firebase를 그대로 씁니다.** 별도의 개발용 프로젝트가 없어서,
로컬에서 회원가입 폼을 제출하면 **운영 DB에 진짜 계정이 생깁니다.** 화면 확인용으로
폼을 채울 때 주의하고, 만들었다면 마이페이지의 회원 탈퇴로 지워 주세요.

---

## 📁 상세 폴더 구조 및 역할 (Directory Structure)

- 프로젝트 최상단(Root)에는 코드 품질 유지와 빌드 환경을 위한 설정 파일들이 위치해 있습니다.

- 루트 레벨에서 백엔드(서버리스)와 프론트엔드가 물리적으로 분리되어 있습니다.

```text
📦 project-root
 ├── 📂 .github/         # GitHub Actions (CI 워크플로우 자동화)
 ├── 📂 .husky/          # Git 훅 (커밋 전 린트 및 코드 포맷팅 자동 검사)
 ├── 📂 .vscode/         # 팀 공통 에디터 설정 (추천 확장 프로그램 및 세팅)
 ├── 📂 api/             # Vercel Serverless Functions (백엔드 로직)
 ├── 📂 src/             # 프론트엔드 소스 코드 (React + TypeScript)
 ├── 📂 public/          # 그대로 배포되는 정적 파일 (파비콘, OG 이미지)
 ├── 📜 index.html       # SPA 진입점 (title, meta, OG 태그)
 ├── 📜 firestore.rules  # Firestore 보안 규칙 (콘솔이 아닌 여기서 관리)
 ├── 📜 vercel.json      # 배포 설정 (보안 헤더, 함수 옵션) — 아래 CSP 항목 참고
 ├── 📜 eslint.config.js # 팀 공통 린트(Lint) 규칙
 ├── 📜 .prettierrc      # 팀 공통 코드 포맷팅 규칙
 ├── 📜 tsconfig.*.json  # TypeScript 환경 분리 설정 (app: 프론트, node: 빌드/서버)
 ├── 📜 vite.config.ts   # Vite 빌드 도구 설정 파일
 ├── 📜 renovate.json5   # 의존성 패키지 자동 업데이트 봇 설정
 └── 📜 package.json     # 프로젝트 의존성 및 스크립트 관리
```

### 1. `api/` (Vercel Serverless Functions)

여러 문서에 걸치거나 선행 검사가 필요해서 브라우저에 맡길 수 없는 작업을 담당합니다. **DB 쓰기는 전부 여기를 거칩니다.**

- `_lib/`: 공용 모듈 (Admin SDK 초기화, ID 토큰 검증, OverFast 클라이언트).
- `auth/discord/`: Discord OAuth 인가·콜백 (토큰 교환, 커스텀 토큰 발급).
- `reports/`: 신고 접수·삭제 (중복 검사 + 랭킹 카운트 갱신을 한 트랜잭션으로).
- `stats/`: OverFast API 프록시 (프로필·경쟁전 티어 조회).
- `users/`: 닉네임·배틀태그 중복 검사.
- `account/`: 회원 탈퇴 (신고 익명화 → 문서 삭제 → 계정 삭제).
- `verify-captcha.ts`: Cloudflare Turnstile 토큰 검증.

### 2. `src/` (Frontend React App)

- `api/`: Axios 인스턴스 및 백엔드 엔드포인트 호출 함수 (서버 통신 계층).
- `components/`: 재사용 가능한 UI 컴포넌트 (`common/`, `Layout/` 분리).
- `hooks/`: 커스텀 훅. (서버 상태 관리를 위한 React Query 로직은 `queries/` 폴더 내 작성).
- `pages/`: 라우터에 연결되는 각 화면 단위 컴포넌트 (Home, Login, MyPage 등).
- `router/`: 라우팅 설정 파일 (`AsyncBoundary` 적용).
- `store/`: Zustand를 활용한 클라이언트 전역 상태 관리 (`useAuthStore` 등).
- `types/`: 공통으로 사용되는 TypeScript 도메인 타입 및 인터페이스.
- `utils/`: 공통 유틸리티 함수 (`cn.ts`, 정규식 유효성 검사 등).

**Tip**: _자잘한 설정 파일(package-lock.json, .gitignore 등)은 생략되었으며, 코드 작성 시 eslint.config.js와 .prettierrc의 룰이 .husky를 통해 커밋 단계에서 강제 적용됩니다._

---

## 🔒 CSP 헤더가 `cleanwatch.cloud`에만 붙는 이유

`vercel.json`의 `Content-Security-Policy`는 **호스트 조건이 걸려 있습니다.**

```json
"has": [{ "type": "host", "value": "cleanwatch.cloud" }]
```

JSON에는 주석을 못 달아 여기 적습니다. **일부러 이렇게 한 것이니 조건을 지우지 마세요.**

`vercel dev`도 `vercel.json`을 읽는데, Vite 개발 서버는 **인라인 스크립트**(React 새로고침
프리앰블)와 **blob 워커**를 씁니다. 조건 없이 걸면 그 둘이 차단되어 **로컬 화면이 통째로
하얘집니다.** 프로덕션 빌드에는 인라인 스크립트도 blob도 없어서 영향이 없습니다.

`vercel dev`는 `has` 조건을 평가하지 않으므로 로컬에는 CSP가 붙지 않고, 프로덕션에서만
적용됩니다.

⚠️ **이 구조는 "붙지 않는 쪽"으로 실패합니다.** 조건이 어긋나면 사이트가 죽는 대신 CSP가
조용히 사라집니다. 그러니 `vercel.json`을 고친 뒤에는 **배포된 주소에서 헤더를 직접
확인하세요.**

```bash
curl -sI https://cleanwatch.cloud/ | grep -i content-security-policy
```

허용 목록을 늘려야 할 일이 생기면(외부 이미지·스크립트 추가 등) **`Report-Only`로 먼저
배포해 위반을 확인한 뒤** 강제로 바꾸는 순서를 지켜주세요.

---

## 🌿 브랜치 전략 (Branching)

**무조건 브랜치 → PR → CI → 머지.** `main` 직행은 하지 않습니다.

`cleanwatch.cloud`가 붙으면서 **`main`이 곧 공개 서비스**가 됐습니다. 게다가 배포 후
스모크 테스트는 **프로덕션 배포가 끝난 뒤에** 돌기 때문에, `main`에 바로 푸시하면
순서가 이렇게 됩니다.

```
푸시 → 배포 → 사용자가 봄 → 그다음 스모크가 "깨졌다"고 알려줌
```

브랜치를 파면 CI가 **머지 전에** 걸러 줍니다. 브랜치·푸시·PR·머지까지 2분이면 됩니다.

- 브랜치 이름은 커밋 컨벤션과 같은 접두어를 씁니다 — `feat/`, `fix/`, `chore/`, `docs/`
- 유일한 예외는 **프로덕션이 이미 깨져 있을 때의 핫픽스**입니다. 사이트가 죽어 있는데
  절차를 지키느라 망설이는 건 본말전도라, 그때는 `main` 직행이 맞습니다

---

## 🛡️ 개발 컨벤션 (Conventions)

### 1. TypeScript Strict Mode

현재 프로젝트는 `tsconfig.json`을 통해 매우 엄격한 타입 검사를 강제하고 있습니다.

- **`any` 사용 지양:** 타입을 알기 어려운 경우 `any` 대신 `unknown`을 사용하거나 팀 리뷰를 요청해 주세요.
- **인터페이스 활용:** 새로운 API 응답 데이터나 컴포넌트 Props는 반드시 `src/types/` 내부에 타입을 정의해 주세요.

### 2. 상태 관리의 분리

- **서버 상태 (Data Fetching):** `src/hooks/queries/` 내부에서 React Query를 활용하여 캐싱 및 상태를 관리합니다.
- **클라이언트 상태 (UI State):** `src/store/` 내부에서 Zustand를 활용하여 관리합니다.

### 3. 절대 경로 사용

프론트엔드(`src/`) 내부에서는 `../../components/` 같은 상대 경로 대신 `@/components/` 형태의 절대 경로를 사용합니다.

---

## ⚙️ 코드 품질 (Code Quality)

- **Husky & Lint-staged:** 커밋(`git commit`) 시 자동으로 ESLint와 Prettier 검사가 실행됩니다. 코드 포맷팅 에러가 있다면 커밋이 거절될 수 있습니다.
- **GitHub Actions (CI):** `main`으로 Pull Request를 열거나 `main`에 푸시되면 `ci.yml`이 돌면서 린트 → 타입 검사 → 빌드를 수행합니다. 에러나 노란 줄(Warning)은 로컬에서 미리 해결 후 푸시해 주세요.
- **스모크 테스트:** 프로덕션 배포가 **성공한 뒤에** `smoke.yml`이 실제 엔드포인트를 호출합니다. 빌드는 통과하는데 배포에서만 죽는 문제(`.ts` 확장자 import, ESM 호환, SPA 폴백 등)를 잡기 위한 것으로, CI가 전부 초록이어도 여기서 빨간불이 날 수 있습니다.
