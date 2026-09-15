# QR Link

URL을 QR 코드로 생성하고, QR 코드 이미지에서 URL 또는 텍스트를 읽는 반응형 정적 웹 앱입니다.

## 목표와 주요 기능

- URL 입력 후 고해상도 QR 코드 생성
- 생성한 QR 코드를 PNG로 저장
- QR 이미지(PNG/JPG/WEBP/GIF) 업로드 및 드래그 앤 드롭 분석
- QR에서 읽은 URL 열기 및 내용 복사
- 라이트/다크 모드와 사용자 선택 저장
- Lucide 아이콘 기반의 일관된 UI
- 브라우저 내부 처리로 입력 URL 및 업로드 이미지의 외부 전송 방지
- 데스크톱/태블릿/모바일 반응형 레이아웃

## 실행 경로

- `/` 또는 `/index.html`: QR 생성 및 이미지 읽기 메인 화면
- URL 파라미터: 없음

## 기술 구성

- HTML5, CSS3, Vanilla JavaScript
- [QRCode.js](https://github.com/davidshimjs/qrcodejs): QR 코드 생성
- [jsQR](https://github.com/cozmo/jsQR): 업로드 이미지 QR 디코딩
- [Lucide](https://lucide.dev/): 전체 UI 아이콘
- Google Fonts: Manrope, Noto Sans KR
- JavaScript 의존성은 `js/vendor/`에 버전 고정 파일로 포함

## 데이터 모델 및 저장소

- 서버 데이터베이스 및 Table API를 사용하지 않습니다.
- `localStorage`
  - `qr-theme`: 사용자가 선택한 `light` 또는 `dark` 테마
- 업로드 이미지는 브라우저 메모리에서만 처리되며 서버에 저장하거나 전송하지 않습니다.

## 공개 URL 및 API

- 프로덕션 URL: 아직 배포되지 않음
- 외부 애플리케이션 API: 없음
- Google Fonts만 런타임에 로드하며 JavaScript 의존성은 저장소에서 제공합니다.

## 현재 완료된 기능

- QR 생성, PNG 저장, URL 복사
- 이미지 선택/드롭, QR 디코딩, URL 열기 및 복사
- 잘못된 URL, 파일 형식/크기, QR 미검출 오류 안내
- 라이트/다크 테마 전환 및 저장
- 키보드 접근성과 ARIA 레이블

## 보안 점검 및 적용 사항

- 비밀키, API 키, 인증 토큰 및 사용자 계정 정보 없음
- JavaScript 외부 공급망 위험을 줄이기 위해 Lucide, QRCode.js, jsQR을 로컬 파일로 고정
- CSP(Content Security Policy)로 스크립트·이미지·연결 출처 제한
- QR에서 읽은 링크는 `http`/`https`만 활성화하여 `javascript:`, `data:` 등 위험 스킴 차단
- 업로드 MIME 유형을 PNG/JPEG/WEBP로 제한하고 10MB 및 2,500만 픽셀 상한 적용
- 사용자 제공 문자열은 `textContent`로만 출력하여 DOM 기반 XSS 방지
- 외부 링크에 `noopener noreferrer` 및 문서 전체 `no-referrer` 정책 적용
- 민감 파일 커밋 방지를 위한 `.gitignore` 및 신고 절차를 담은 `SECURITY.md` 포함
- 배포 플랫폼의 HTTP 보안 헤더는 `SECURITY.md` 참고

## 아직 구현되지 않은 기능

- 카메라를 이용한 실시간 QR 스캔
- QR 색상/로고/오류 보정 수준 사용자 설정
- 생성 및 스캔 기록 저장
- 여러 QR 코드 일괄 처리

## 권장 다음 단계

1. 카메라 권한 기반 실시간 스캐너 추가
2. QR 디자인 사용자 설정 기능 추가
3. 오프라인 사용을 위한 PWA 적용
4. 실제 기기 및 다양한 QR 이미지에 대한 교차 브라우저 테스트 확대
