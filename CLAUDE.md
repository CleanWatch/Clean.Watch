# CleanWatch

오버워치 배틀태그 기반 악성 유저 신고·전적 조회 서비스. 프로덕션: https://cleanwatch.cloud
React 19 + TS + Vite 8 프론트(`src/`)와 Vercel Serverless Functions(`api/`)가 한 저장소에 있고,
DB는 Firebase(Auth · Firestore · App Check)입니다.

설계 배경은 [README.md](README.md), 협업 규칙 전문은 [CONTRIBUTING.md](CONTRIBUTING.md)에 있습니다.
아래는 작업할 때 바로 걸리는 것만 추린 요약입니다.

## 명령어

- `npm run lint` — ESLint (CI 1단계)
- `npm run build` — `tsc -b`(src + api 타입 검사) 후 Vite 빌드 (CI 2단계). 별도 테스트 스위트는 없음
- `vercel dev` — API까지 포함한 로컬 실행. `npm run dev`는 프론트만 떠서 API 호출이 전부 실패함
- 커밋 시 Husky + lint-staged가 `eslint --fix`, `prettier --write`를 돌림

변경을 마치면 `npm run lint`와 `npm run build`가 둘 다 경고 없이 통과하는지 확인하세요.

## 구조와 규칙

- **DB 쓰기는 전부 `api/`를 거칩니다.** 클라이언트의 Firestore 쓰기는 `firestore.rules`에서 막혀
  있습니다. 여러 문서에 걸치거나 선행 검사가 필요한 작업을 클라이언트에 추가하지 마세요.
- `api/` 안에서 `uid`는 검증된 ID 토큰(`api/_lib/auth.ts`의 `requireUid`/`requireAdmin`)에서만 얻습니다.
  요청 본문의 uid를 믿지 않습니다.
- `api/`의 상대 import는 **`.js` 확장자**를 붙입니다 (`'../_lib/auth.js'`). `module: nodenext`이고,
  빠뜨리면 빌드는 통과해도 배포 후 스모크 테스트에서 죽습니다. `api/`에서는 `@/` 별칭을 쓸 수 없습니다.
- `src/`에서는 `@/` 절대 경로를 쓰고, 폴더마다 있는 `index.ts` 배럴로 import 합니다
  (같은 페이지 폴더 안의 `hooks/`·`components/`만 `'../hooks'`처럼 상대 경로). 새 파일은 배럴에 추가하세요.
- 서버 상태는 `src/hooks/queries/`(React Query), 클라이언트 전역 상태는 `src/store/`(Zustand).
- 새 API 응답·Props 타입은 `src/types/`에 정의합니다. `any` 대신 `unknown`을 씁니다.
- 실패는 뭉치지 않습니다: 토큰 없음 / 권한 없음 / 상류 장애 / 상류 없음을 서로 다른 상태 코드와 문구로 내립니다.
  사용자 안내는 `alert()`가 아니라 `sonner` 토스트로 띄웁니다.
- 공개 신고 횟수는 "몇 건"이 아니라 "몇 명"입니다. 재신고(24시간 롤링)는 카운트를 올리지 않고,
  삭제는 그 사람의 마지막 한 건일 때만 차감합니다. 신고 로직을 건드릴 때 이 불변식을 지키세요.
- 포맷: Prettier (작은따옴표, 세미콜론, 너비 80, Tailwind 클래스 정렬 플러그인).
- 주석은 코드만 봐서는 알 수 없는 이유만, 한국어 메모체(`~다`)로 짧게 씁니다.
  변경 이력("예전에는~"), 코드를 다시 읽어주는 설명, 파일 경로 헤더, 주석 안 마크다운 강조는 쓰지 않습니다.
  이력은 커밋 메시지와 PR에 남깁니다.

## 건드리면 안 되는 것

- `vercel.json`의 CSP 헤더에 붙은 `has: host = cleanwatch.cloud` 조건은 일부러 넣은 것입니다.
  지우면 `vercel dev` 로컬 화면이 하얘집니다. CSP 허용 목록을 늘릴 때는 `Report-Only`로 먼저 배포해야 하므로
  임의로 고치지 말고 사용자에게 확인하세요.
- **로컬도 프로덕션 Firebase를 씁니다.** 브라우저로 화면을 확인하다가 회원가입·신고 폼을 제출하면
  운영 DB에 실제 데이터가 생깁니다. 폼 제출은 사용자 확인 없이 하지 마세요.
- `.env`에는 실제 비밀값(Admin SDK 개인 키, OAuth 시크릿)이 있습니다. 읽거나 출력하지 말고, 필요한 변수
  목록은 `.env.example`을 보세요.

## Git

- `main`이 곧 공개 서비스입니다. **브랜치 → PR → CI → 머지**, `main` 직접 푸시 금지
  (예외: 프로덕션이 이미 깨진 상태의 핫픽스).
- 브랜치: `feat/`, `fix/`, `chore/`, `docs/` 접두어.
- 커밋 메시지: `type(scope): 한국어 요약` — 예) `fix(mobile): 검색 버튼이 카드 밖으로 밀려 나가던 문제`
- 원격: `CleanWatch/Clean.Watch`
