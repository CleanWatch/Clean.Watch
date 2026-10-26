# CleanWatch

오버워치 배틀태그로 커뮤니티 신고 현황을 조회하고, 로그인한 이용자가 신고를 접수하는 서비스입니다.
Blizzard Entertainment와 무관한 비공식 커뮤니티 서비스입니다.

https://cleanwatch.cloud

## 하는 일

- 배틀태그를 검색하면 누적 신고 횟수와 최근 신고 시점을 보여 줍니다.
- 홈에서 신고가 많은 배틀태그 상위 5개와 누적 통계를, `/ranking`에서 전체 순위를 볼 수 있습니다.
- 로그인한 이용자는 배틀태그를 신고할 수 있습니다. 같은 배틀태그는 24시간에 한 번 다시 신고할 수 있습니다.
- 마이페이지에서 내 신고 내역을 보고 프로필을 수정합니다. 배틀태그를 등록하면 오버워치 프로필과 경쟁전 티어도 보입니다.
- 이메일 또는 Discord 계정으로 로그인합니다.
- 관리자는 접수된 신고를 열람하고 삭제할 수 있습니다.

## 신고 횟수는 "몇 명"입니다

공개되는 숫자는 신고 건수가 아니라 신고한 사람 수입니다. 한 사람이 같은 배틀태그를 여러 번
신고해도 1로 세고, 신고를 삭제할 때도 그 사람의 마지막 신고가 지워질 때만 숫자를 줄입니다.
한 사람이 숫자를 부풀릴 수 있으면 배틀태그에 붙은 숫자가 근거를 잃기 때문입니다.

신고는 이용자의 주장이며 운영자가 사실 여부를 검증한 것이 아닙니다. 자세한 내용은 이용약관을 참고하세요.

## 기술 스택

- 프론트엔드: React 19, TypeScript, Vite 8, React Router, TanStack Query, Zustand, Tailwind CSS
- 백엔드: Vercel Serverless Functions(`api/`), Firebase(Authentication, Cloud Firestore, App Check, Admin SDK)
- 외부 서비스: OverFast API(오버워치 프로필·티어), Discord OAuth2, Cloudflare Turnstile(봇 방어)
- CI: GitHub Actions(린트·타입 검사·빌드), 배포 후 스모크 테스트

## 구조

```text
api/             Vercel Serverless Functions. DB 쓰기와 외부 API 호출을 맡습니다.
src/             프론트엔드
firestore.rules  Firestore 보안 규칙. Firebase 콘솔에 붙여넣어 게시합니다.
vercel.json      보안 헤더(CSP 등)와 배포 설정
```

DB 쓰기는 모두 `api/`를 거칩니다. Firestore 규칙은 문서 하나만 보기 때문에 "중복 검사를 거쳤는지"를
표현할 수 없습니다. 그래서 클라이언트의 쓰기는 규칙에서 막고, 서버가 트랜잭션으로 검사한 뒤
Admin SDK로 씁니다.

## 실행

```bash
npm ci
vercel dev
```

`npm run dev`는 프론트엔드만 띄워서 API 호출이 모두 실패하므로 `vercel dev`를 씁니다. 처음에는
Vercel 로그인과 프로젝트 연결이 필요할 수 있습니다. 필요한 환경 변수는 `.env.example`에 있습니다.

로컬에서도 운영 Firebase에 연결되므로, 회원가입이나 신고 폼을 제출하면 실제 데이터가 생깁니다.

변경한 뒤에는 `npm run lint`와 `npm run build`가 통과하는지 확인합니다.

## 기여

브랜치를 만들어 PR을 올리고, CI를 통과하면 머지합니다. `main`에는 직접 푸시하지 않습니다.
규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)에 있습니다.

## 팀

| GitHub                                                 | 역할                                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| **[@pandemoniummm](https://github.com/pandemoniummm)** | 프론트엔드 리드, 아키텍처 총괄. TypeScript 이주, 보안 아키텍처 재설계, CSP   |
| [@Ryanghyeon](https://github.com/Ryanghyeon)           | 백엔드·인프라 초기 세팅. Admin SDK 구조, OAuth 콜백 라우팅, Vercel 초기 배포 |
| [@ininin0423](https://github.com/ininin0423)           | 프론트엔드 UI 서포트. 초기 UI 컴포넌트, App Check 연동                       |
