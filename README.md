# 26기 드림이 활동가능 시간표

인천대학교 홍보대사 동아리 "드림이" 26기가 엑셀로 취합하던 팀원 시간표를 대체하는
웹 도구입니다. 각자 활동 가능한 시간을 입력하면, 전체회의 시간이나 캠퍼스투어 같은
행사에 배정할 인원을 한눈에 찾을 수 있어요.

- 시작: 이름 선택/등록
- 내 시간표: 월~일 08:00~24:00 30분 단위로 가능 시간 입력
- 전체 보기: 부서/이름 필터, 히트맵·표 보기, 이벤트 배정 도우미

## 기술 스택

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + 커스텀 디자인 토큰(라이트/다크 테마)
- Supabase(Postgres) — `dream_schedule_members` 테이블에 인원/시간표 저장

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # 아래 값으로 채워주세요
npm run dev
```

`.env.local`에는 다음 두 값이 필요합니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://pkqzdopctylvrbkvydlr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_sBlLCT0i9vrR_p1v9a6TBA_sL6YlHqT
```

브라우저에서 http://localhost:3000 을 열면 됩니다.

## Vercel 배포

1. [vercel.com](https://vercel.com)에서 이 GitHub 저장소를 Import 합니다.
2. Environment Variables에 아래 두 값을 등록합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy를 누르면 끝입니다. 배포된 URL을 카톡방에 공유하면 됩니다.

## 데이터 저장 방식

- Supabase 테이블 `public.dream_schedule_members`에 이름/부서/캠퍼스투어 여부/가능
  시간(`avail`)이 저장됩니다.
- `avail`은 `요일*100 + 슬롯` 형태의 정수 배열입니다. 요일은 0(월)~6(일), 슬롯은
  0~31로 08:00~24:00을 30분 단위로 나눈 값입니다. 예: 화요일 09:30 → `103`.
- RLS가 켜져 있지만 select/insert/update가 전부 공개(`using (true)`)된 내부용
  정책입니다. 브라우저는 본인 확인을 위해 자신의 row id를 `localStorage`
  (`dream-schedule-my-id`)에 저장해두고, 시간표 저장 시 그 id로만 update
  요청을 보냅니다 — 서버가 강제하는 인증은 아니지만, 20명 내외의 동아리 내부
  도구로서 받아들인 트레이드오프입니다.

## 참고

- 로고는 인천대학교 공식 교표를 복제한 것이 아니라, 시그니처 컬러(블루/골드)만
  참고해 새로 그린 워드마크입니다.
