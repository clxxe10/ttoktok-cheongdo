# 똑똑 1차 제출 TRD

## 1. 기술 범위

현재 구현은 별도 프레임워크나 빌드 도구 없이 브라우저에서 바로 실행할 수 있는 정적 웹 앱이다.

- `index.html`: 모든 화면 섹션과 접근성 텍스트
- `styles.css`: 모바일 우선 레이아웃, 반응형 스타일, 카드와 글로우 비주얼
- `script.js`: 상태 순환, 화면 전환, 고정 데모 흐름, 입력 결과 표시
- `PRD.md`: 제품 요구사항과 데모 범위
- `TRD.md`: 기술 구조와 확장 계획
- `.gitignore`: 로컬 설정과 생성 파일 제외 규칙

## 2. 현재 화면 전환 방식

여러 페이지 파일을 만들지 않고 하나의 HTML 안에 `.screen` 섹션을 둔다. JavaScript의 `showScreen(screenId)`가 각 섹션의 `hidden` 속성과 활성 클래스를 변경해 화면을 전환한다.

현재 화면:

- `home-screen`: 상태 선택, 오늘의 곁, 보호자 화면 진입
- `symptom-screen`: 불편한 부위, 통증 느낌, 추가 설명 입력
- `symptom-result-screen`: 증상 요약 및 저장/보호자 알림 준비
- `memo-screen`: 메모 입력, 고정 예시 정리, 저장
- `help-screen`: 보호자 도움 요청 준비
- `guardian-screen`: 오늘 상태, 최근 기록, 간단한 달력

상태 흐름은 `script.js`의 `statuses` 배열과 `currentStatusIndex`로 관리한다. 증상 선택 버튼은 `#symptom-flow`의 이벤트 위임으로 처리하고, 선택된 버튼에는 `is-selected` 클래스를 적용한다.

## 3. 실행 및 검증

```bash
python3 -m http.server 4178
```

브라우저에서 `http://127.0.0.1:4178/`을 열어 확인한다.

JavaScript 문법 검증:

```bash
node --check script.js
```

## 4. 이후 확장 위치

### API 폴더

실제 서버 연동을 시작할 때 루트에 `api/` 폴더를 추가한다. 다음과 같은 책임으로 분리하는 것을 권장한다.

- `api/routes/`: 안부, 증상 기록, 메모, 보호자 조회 API
- `api/services/`: 저장·조회·알림 서비스
- `api/schemas/`: 요청/응답 데이터 검증 스키마
- `api/config/`: 환경 변수 로딩과 런타임 설정

현재 프런트엔드의 `script.js`는 고정 데모 값을 사용한다. API 연결 시 화면 전환 함수와 렌더링 함수는 유지하고, 저장 및 조회 동작을 `fetch` 기반 서비스 함수로 교체한다.

### Copilot SDK / Microsoft Agent Framework

AI 기능은 아직 구현하지 않았다. 다음 단계에서 아래 위치를 검토한다.

- `api/services/ai-summary-service`: 증상·메모를 요약하는 서버 측 경계
- `api/services/caregiver-recommendation-service`: 보호자 확인 행동 추천 경계
- `api/prompts/`: 프롬프트와 출력 형식 버전 관리
- `api/schemas/ai/`: AI 결과를 화면에 전달하기 전 검증하는 스키마

Copilot SDK 또는 Microsoft Agent Framework의 실제 선택, 인증 방식, 모델 연결, 비용·지연시간 기준은 확인 필요 사항이다. 브라우저에서 직접 API 키를 사용하지 않고 서버 측에서만 호출한다.

## 5. 보안 원칙

- API 키, 토큰, 개인정보를 소스 코드와 브라우저 JavaScript에 넣지 않는다.
- 비밀 값은 `.env` 또는 실행 환경의 보안 설정으로만 주입한다.
- 사용자 입력은 서버 저장 전 길이·형식·허용 범위를 검증한다.
- 사용자 입력을 HTML로 직접 삽입하지 않고 텍스트 노드로 렌더링한다.
- 보호자 데이터는 인증과 권한 확인 후 본인에게 허용된 기록만 반환한다.
- AI 결과는 의료 진단이나 긴급 판단으로 표시하지 않는다.
- 실제 알림과 계정 연결을 추가할 때 감사 로그와 실패 상태를 명확히 남긴다.
- HTTPS, CORS, rate limit, 로그 내 개인정보 마스킹은 API 도입 시 확인한다.

## 6. 미구현 항목의 처리 원칙

AI 요약, 보호자 행동 추천, 로그인, DB, 실제 알림, Azure 배포는 현재 정적 데모의 완료 기능으로 간주하지 않는다. 구현 전까지는 문서와 시연 화면에서 `다음 단계`, `고정 예시`, `확인 필요`로 구분한다.
