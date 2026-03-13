# 실행 계획 — Jiyu Han Portfolio

> **기준일:** 2026-03-11
> **최종 업데이트:** 2026-03-14
> **현재 버전:** 0.1.0

---

## 현재 상태 요약

| 영역 | 완성도 | 비고 |
|------|--------|------|
| 홈 페이지 | ✅ 완성 | 마스크·오디오·애니메이션 동작 |
| 프로젝트 그리드 | ✅ 완성 | 5개 프로젝트 목록 |
| Let it Jazz | ✅ 완성 | YouTube API 연동 |
| Beyond with Humanity | ✅ 완성 | 패럴랙스 갤러리 |
| Moving | ✅ 완성 | 4개 WebGL/Canvas 시각화 |
| Nostalgia | ✅ 완성 | 3D 룩북·음악·캐러셀 |
| SEO / 메타데이터 | ✅ 완성 | 전 페이지 title·description·OG 적용 완료 |
| 접근성 | ✅ 완성 | alt 텍스트 전수 확인, 모션 접근성 대응 완료 |
| 성능 최적화 | ✅ 완성 | 이미지 최적화·번들 정리·동적 import 완료 |
| 콘텐츠 작성 | ❌ 없음 | About·프로젝트 설명 없음 |
| README | ✅ 완성 | 프로젝트 소개·실행 방법·환경변수 설명 작성 |

---

## Phase 1 — 품질 기반 다지기 ✅ 완료 (2026-03-14)

목표: 배포된 사이트의 품질·안정성 확보

### 1-1. SEO / 메타데이터 완성
- [x] 모든 페이지에 고유한 `<title>` 설정
- [x] 모든 페이지 `<meta description>` 작성 (140자 이내)
- [x] OpenGraph 이미지(`og:image`) 각 프로젝트별 1장 준비 및 적용
- [x] `public/robots.txt` 생성
- [x] `sitemap.xml` 생성 — `src/app/sitemap.ts` (Next.js App Router 방식)
- [x] `metadataBase` 설정 (`jiyu-han-portfolio.vercel.app`)
- [x] 오타 수정: "Portfoilo" → "Portfolio"

### 1-2. 이미지 접근성
- [x] `<img>` 및 Next.js `<Image>` 태그 전수 확인 → 의미 있는 `alt` 작성
- [x] 장식용 이미지는 `alt=""` 명시 (해당 없음 — 전부 의미 있는 이미지)

### 1-3. 에러 방어
- [x] YouTube API 실패 시 fallback UI 구현 (tracks 빈 배열 시 에러 메시지)
- [x] Let it Jazz: 재생목록이 비었을 때 빈 화면 방지
- [x] WebGL 미지원 브라우저 감지 → 안내 메시지 표시 (OceanWaves, FlowmapHero)

### 1-4. README 업데이트
- [x] 프로젝트 소개, 로컬 실행 방법, 환경변수 설명 작성
- [x] `.env.local.example` 파일 생성 (`YOUTUBE_API_KEY=` 포함)

**완료 기준:** Lighthouse SEO 점수 90+, 콘솔 에러 0개

---

## Phase 2 — 콘텐츠 보완 (1–2주)

목표: 방문자에게 "나는 누구인가"를 명확히 전달

### 2-1. About 섹션 또는 페이지
- [ ] `/about` 페이지 신설 또는 홈 하단 섹션 추가 검토
- [ ] 자기소개 텍스트 작성 (경력, 전문 분야, 접근 방식)
- [ ] 프로필 이미지 또는 아이덴티티 비주얼 추가

### 2-2. 프로젝트별 설명 콘텐츠
각 프로젝트 페이지에 다음 정보 추가:
- [ ] **Let it Jazz** — 프로젝트 배경, 사용 기술, 제작 의도
- [ ] **Beyond with Humanity** — AI 아트워크 시리즈 소개, 사용 도구
- [ ] **Moving** — 미디어 아트 작품 설명, 각 시각화별 인터랙션 안내
- [ ] **Nostalgia** — 브랜드 컨셉, 디자인 프로세스

### 2-3. 연락처 개선
- [ ] 이메일 클릭 시 자동완성 되는 mailto 링크 확인
- [ ] Contact Form 추가 여부 결정 (Formspree, Resend 등)

**완료 기준:** 각 프로젝트 페이지에 최소 100자 이상 설명 텍스트 존재

---

## Phase 3 — 성능 최적화 ✅ 완료 (2026-03-14)

목표: Core Web Vitals 통과 수준 달성

### 3-1. 이미지 최적화
- [x] `next.config.ts`에 `formats: ["image/avif", "image/webp"]` 추가 — Next.js Image가 자동 변환
- [x] Next.js `<Image>` 컴포넌트 이미 전 페이지 적용 완료 (native `<img>` 없음)
- [x] `sizes` prop 추가 — Let it Jazz 썸네일(`240px`) 누락분 보완
- [x] `priority` 속성을 LCP 이미지(프로젝트 그리드 첫 번째 썸네일)에 적용
- [ ] `public/images/` 폴더 내 JPG/PNG 소스 파일 WebP 변환 (Vercel Image Optimization이 런타임에 처리하므로 낮은 우선순위)

### 3-2. 번들 최적화
- [x] 미사용 Three.js 컴포넌트 5개 삭제 (`hero-3d-text`, `glide-typography`, `shader-lines`, `sphere-animation`, `spinning-orbit`) — ~2.2MB+ 절감
- [x] `ocean-waves.tsx`: `import * as THREE` → named imports로 교체 (tree-shaking 적용)
- [x] Moving 페이지 WebGL 컴포넌트 4개 `next/dynamic` + `ssr: false`로 code-split
- [ ] `next build` 후 번들 분석 (`@next/bundle-analyzer`) — 추후 검증
- [ ] Swiper 미사용 모듈 추가 제거 — 현재 `EffectCoverflow`만 사용 중, 추가 정리 여지 있음

### 3-3. 렌더링 전략
- [x] 전 프로젝트 페이지 SSG 확인 (`○ Static` 빌드 출력)
- [x] `let-it-jazz` ISR revalidate 1시간 유지
- [x] Moving·Nostalgia 페이지: `"use client"` 분리 → 서버 컴포넌트 래퍼에서 metadata export
- [x] WebGL 컴포넌트 `next/dynamic` SSR 비활성화 (클라이언트 컴포넌트 내부에서 처리)

### 3-4. 모션 접근성
- [x] `nostalgia.css`: `@media (prefers-reduced-motion: reduce)` 추가 — `will-change`, `transition` 비활성화
- [x] `beyond-with-humanity.css`: hover scale 트랜지션 비활성화
- [x] `beyond-with-humanity-client.tsx`: `useReducedMotion()` — 패럴랙스 스크롤 비활성화
- [x] `nostalgia-client.tsx`: `useReducedMotion()` — ZoomGallery 스케일/이동, Lookbook 3D 트랜스폼, 드래그 회전 모두 비활성화

**완료 기준:** Lighthouse Performance 80+, LCP < 2.5초

---

## Phase 4 — 기능 확장 (1개월 이후, 선택)

목표: 재방문 유도 및 커리어 활용도 증대

### 4-1. 이력서/CV 다운로드
- [ ] PDF 이력서 `public/` 에 업로드
- [ ] 홈 또는 About 페이지에 다운로드 버튼 추가

### 4-2. 다국어 지원
- [ ] `next-intl` 또는 `next-i18next` 도입 검토
- [ ] 한국어 / 영어 2개 언어 지원

### 4-3. Analytics
- [ ] Vercel Analytics 활성화 (무료 플랜)
- [ ] 주요 이벤트 트래킹: 프로젝트 클릭, 이메일 클릭, 음악 재생

### 4-4. 신규 프로젝트 추가
- [ ] LinkStash 상세 페이지 내부 구현 (`/projects/linkstash`)
- [ ] 새 프로젝트 작업 시 프로젝트 그리드 업데이트

### 4-5. 블로그/노트 (선택)
- [ ] Brunch 아티클 RSS 또는 직접 MDX 기반 글 섹션 검토

---

## 우선순위 요약

```
[완료]  Phase 1 — SEO, 에러 방어, README
[1–2주] Phase 2 — About, 프로젝트 설명 콘텐츠
[완료]  Phase 3 — 이미지·번들 최적화, 접근성
[1개월+] Phase 4 — CV 다운로드, 다국어, Analytics
```

---

## 기술 부채 목록

| 항목 | 내용 | 우선순위 | 상태 |
|------|------|----------|------|
| CDN 의존 | `threejs-components` CDN 사용 (LiquidBackground) — 오프라인 미지원 | 중 | 미해결 |
| 인라인 스타일 과다 | Nostalgia 페이지 인라인 CSS-in-JS 과다 사용 | 낮음 | 미해결 |
| 소스 이미지 WebP 변환 | `public/images/` PNG 소스 파일 미변환 (Vercel이 런타임 변환하므로 실 영향 낮음) | 낮음 | 미해결 |
| 번들 분석 미실시 | `@next/bundle-analyzer`로 실제 번들 크기 검증 필요 | 낮음 | 미해결 |
| ~~미사용 컴포넌트~~ | ~~`hero-3d-text`, `glide-typography`, `shader-lines` 등 사용 안 함~~ | ~~낮음~~ | ✅ 삭제 완료 |
| ~~환경변수 예시 파일 없음~~ | ~~`.env.local.example` 미존재~~ | ~~높음~~ | ✅ 생성 완료 |
| 공통 컴포넌트 폴더 | `src/components/common/`, `project-specific/` 빈 디렉토리 | 낮음 | 미해결 |
