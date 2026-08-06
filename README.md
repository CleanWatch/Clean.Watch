# 🚨 CleanWatch (오버워치 커뮤니티 신고 플랫폼)

> 오버워치 유저들의 건전한 게임 환경을 위한 배틀태그 기반 악성 유저 신고 및 전적 조회 서비스입니다.

### 🔗 [cleanwatch.cloud](https://cleanwatch.cloud)

<br>

## 🎮 주요 기능

- 🔥 **배틀태그 전과 조회 (Killer Feature):** 배틀태그(예: 홍길동#1234) 검색 한 번으로 해당 유저의 누적 신고 횟수와 신고 사유(트롤링, 비인가 프로그램 사용 등)를 조회하는 검색 시스템
- **신고 접수 및 방어 로직:** 카테고리별 세부 신고 기능. 중복 신고 검사와 랭킹 카운트 갱신을 서버 트랜잭션으로 묶어, 검사를 건너뛴 신고나 카운트만 오른 상태가 생기지 않도록 처리
- **오버워치 전적 연동:** 등록한 배틀태그의 프로필과 경쟁전 티어를 마이페이지에 표시. OverFast API를 서버에서 대신 호출해 CORS와 레이트 리밋을 사용자에게 떠넘기지 않음
- **디스코드 연동 로그인:** Discord OAuth2 기반 간편 로그인. 인가 코드 교환을 서버에서 처리하고 `state` 파라미터로 CSRF 방어
- **마이페이지:** 대시보드(프로필·전적), 내 신고 내역, 프로필 설정(닉네임·배틀태그·회원 탈퇴)
- **관리자 대시보드:** 신고 내역 열람 및 삭제. 권한 검사는 서버와 보안 규칙 양쪽에서 수행

<br>

## 🛠 기술 스택 및 API

**Frontend & Build**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
<br>

**State Management & Styling**

![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=ReactQuery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
<br>

**Backend & Database**

![Firebase](https://img.shields.io/badge/firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

Firebase Authentication · Cloud Firestore · **App Check** · Admin SDK (서버리스 함수)

**Deployment & CI**

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

Vercel Serverless Functions · 푸시마다 린트·타입체크·빌드, 배포 후 실제 엔드포인트를 때리는 스모크 테스트

**3rd Party API & Libraries**

![OverFast API](https://img.shields.io/badge/OverFast_API-F99E1A?style=for-the-badge&logo=overwatch&logoColor=white)
![Discord OAuth2](https://img.shields.io/badge/Discord_OAuth2-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Cloudflare Turnstile](https://img.shields.io/badge/Cloudflare_Turnstile-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Sonner](https://img.shields.io/badge/Sonner-000000?style=for-the-badge&logo=react&logoColor=white)

- **OverFast API** — 오버워치 프로필·경쟁전 티어 조회. 서버리스 함수를 통해서만 호출합니다
- **Discord OAuth2** — 소셜 로그인. 토큰 교환은 서버에서 처리합니다
- **Cloudflare Turnstile** — 회원가입·비밀번호 재설정 봇 방어
- **Sonner** — 토스트 알림. 화면을 막고 맥락을 지우는 `alert()`를 전부 걷어냈습니다

<br>

## 📂 아키텍처 (Architecture)

```text
📦 project-root
├── 📂 api/                  # Vercel Serverless Functions — DB 쓰기와 외부 API 호출을 전담
│   ├── 📂 _lib/             #   공용: Admin SDK 초기화, 토큰 검증, OverFast 클라이언트
│   ├── 📂 auth/discord/     #   OAuth 인가·콜백 (토큰 교환, 커스텀 토큰 발급)
│   ├── 📂 reports/          #   신고 접수·삭제 (중복 검사 + 카운트 갱신을 트랜잭션으로)
│   ├── 📂 stats/            #   OverFast 프록시 (본인 전적 조회)
│   ├── 📂 users/            #   닉네임·배틀태그 중복 검사
│   └── 📂 account/          #   회원 탈퇴 (신고 익명화 → 문서 삭제 → 계정 삭제)
├── 📂 src/                  # 프론트엔드 (React + TS)
│   ├── 📂 api/              #   통신 계층. 인터셉터가 ID 토큰을 자동으로 첨부
│   ├── 📂 pages/            #   화면 단위. 로직은 페이지별 hooks/로 분리
│   ├── 📂 components/       #   공용 UI (common/) · 머리말·꼬리말 (Layout/)
│   ├── 📂 hooks/queries/    #   React Query 훅 (서버 상태)
│   ├── 📂 store/            #   Zustand (클라이언트 전역 상태)
│   └── 📂 router/           #   AsyncBoundary 기반 에러/서스펜스 처리
├── 📄 firestore.rules       # 보안 규칙 (버전 관리 대상)
└── 📄 vercel.json           # 배포 설정 (보안 헤더)
```

**왜 쓰기를 서버로 몰았나** — 브라우저에서 Firestore를 직접 쓰면, 보안 규칙이 유일한
방어선이 됩니다. 그런데 규칙은 **문서 하나만** 보기 때문에 "이 쓰기가 중복 검사를 거쳤는지",
"짝이 되는 문서가 함께 생겼는지"를 표현할 수 없습니다.

그래서 여러 문서에 걸치거나 선행 검사가 필요한 작업은 전부 `api/`로 옮기고,
클라이언트 쓰기는 규칙에서 차단했습니다. 서버는 Admin SDK를 쓰므로 규칙을 우회합니다.

## 🔒 보안 설계

세 겹이 각각 다른 질문에 답합니다. 하나로는 못 막는 것들이 있어서 겹쳤습니다.

| 층                 | 확인하는 것       | 구현                                                                                                           |
| ------------------ | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| **Firestore 규칙** | **누가** 요청했나 | 기본 전체 차단, 본인 문서만 읽기·수정, `role` 자가 승격 차단, `reports`·`battletags` 클라이언트 쓰기 전면 차단 |
| **서버 이관**      | 검사를 **거쳤나** | 중복 검사와 쓰기를 한 트랜잭션으로. `uid`는 항상 검증된 ID 토큰에서만                                          |
| **App Check**      | **어디서** 왔나   | reCAPTCHA v3로 앱 증명. Firestore와 Auth 모두 적용                                                             |

**규칙만으로 부족한 이유** — 정상 로그인한 사용자가 정상적인 형태의 쓰기를 반복하는 것은
규칙 입장에서 전부 합법입니다. 그래서 순서와 짝을 강제하는 일은 서버가, 요청 출처를
가리는 일은 App Check가 맡습니다.

그 밖에:

- 인증 상태에 따라 갈리는 실패(토큰 없음 / 권한 없음 / 상류 장애 / 상류 없음)는
  **서로 다른 상태 코드와 문구**로 내려보냅니다. 하나로 뭉치면 "잠시 후 다시 시도"라는
  누구에게도 도움이 안 되는 안내만 남습니다
- 브라우저에 노출되는 공개값(Firebase 웹 설정, 사이트 키)과 진짜 비밀(Admin SDK 개인 키,
  OAuth 시크릿)을 분리해 관리합니다. `.env.example`에 어느 쪽인지 명시해 두었습니다
- 응답 헤더로 `X-Frame-Options: DENY`(피싱용 iframe 삽입 차단)와
  `X-Content-Type-Options: nosniff`(MIME 스니핑 차단)를 내려보냅니다 — `vercel.json`

## 👥 팀원 역할 분담

<table>
  <tr>
    <th>GitHub</th>
    <th>담당 역할 및 구현 내용</th>
  </tr>
  <tr>
    <td valign="top"><a href="https://github.com/pandemoniummm">@pandemoniummm</a></td>
    <td>
      <strong>프론트엔드 리드 · 아키텍처 총괄</strong><br>
      <br>
      <strong>1. 레거시 JS → TypeScript 전환</strong><br>
      • 자체 TS/Vite 보일러플레이트 구축, 라우터·상태 관리·API 계층 재설계<br>
      • 페이지에 뭉쳐 있던 로직을 Custom Hook으로 분리 (Login · Register · MyPage · Report)<br>
      • Husky · ESLint · Prettier로 컨벤션 고정, <code>React.lazy</code> + 청크 분할로 초기 로딩 최적화<br>
      <br>
      <strong>2. 보안 아키텍처 재설계</strong><br>
      • DB 쓰기를 전량 서버리스로 이관. 중복 검사와 카운트 갱신을 <strong>한 트랜잭션</strong>으로 묶어,
        검사를 건너뛴 신고나 한쪽만 반영된 상태가 생길 수 없게 재구성<br>
      • Firestore 보안 규칙 재작성 및 버전 관리 편입 —
        전체 공개였던 <code>users</code> 읽기 차단, <code>role</code> 자가 승격 차단<br>
      • Firebase App Check(reCAPTCHA v3) 도입. 규칙·서버 검사로는 판별할 수 없는
        <strong>요청 출처</strong>를 검증<br>
      <br>
      <strong>3. 기능 및 안정화</strong><br>
      • OverFast API 프록시 및 마이페이지 전적 카드<br>
      • Discord OAuth 파이프라인 완성(<code>state</code> CSRF 방어), 회원 탈퇴, Turnstile 캡챠 정상화<br>
      • 배포 후 실제 엔드포인트를 호출하는 스모크 테스트 —
        빌드는 통과하는데 배포에서만 죽는 문제를 잡기 위해<br>
      <br>
      <strong>4. 서비스 공개 및 마감</strong><br>
      • 커스텀 도메인 <code>cleanwatch.cloud</code> 연결 —
        DNS·OAuth 콜백·App Check 도메인까지 이관<br>
      • 실패 화면 체계화 — 404·401·403·렌더 에러를 공용 <code>ErrorState</code>로 통합하고,
        에러 경계를 라우트별로 분리해 페이지를 옮기면 저절로 복구되게<br>
      • 화면을 막고 맥락을 지우던 <code>alert()</code> 15곳을 토스트로 교체, 공용 헤더 도입<br>
      • 파비콘·OG 이미지·<code>lang</code>·응답 헤더 등 공개 전 마감
    </td>
  </tr>
  <tr>
    <td valign="top"><a href="https://github.com/Ryanghyeon">@Ryanghyeon</a></td>
    <td>
      <strong>백엔드/인프라 초기 세팅</strong><br>
      • 프로젝트 초기 환경 구성 및 Firebase Admin SDK 아키텍처 설계<br>
      • Discord OAuth 콜백 API 라우팅 및 인증 서버 연동 초기 뼈대 작성<br>
      • Vercel 초기 배포 환경 설정 및 환경변수 관리
    </td>
  </tr>
  <tr>
    <td valign="top"><a href="https://github.com/ininin0423">@ininin0423</a></td>
    <td>
      <strong>프론트엔드 UI 서포트 및 보안 설정</strong><br>
      • 주요 도메인(Login, Ranking, Admin) 초기 UI 컴포넌트 구성<br>
      • Firebase App Check(ReCaptcha V3) 연동을 통한 클라이언트 보안 설정 보조<br>
      • 프로젝트 패키지 의존성 및 Firebase 설정 파일 관리
    </td>
  </tr>
</table>
