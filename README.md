# QR 코드 만들기

웹사이트·텍스트·Wi-Fi 정보를 QR 코드로 만드세요. 만료 기한 없이 사용할 수 있는 정적 QR을 PNG와 SVG로 저장합니다.

Production: https://nanalab.kr/qr-code/

This is a new standalone app, not a modification or redirect of a legacy application. Buildless static HTML/CSS/JavaScript, hosted on GitHub Pages. Processing dependencies are vendored locally; source files and QR values are never uploaded. Publisher tags report ordinary page activity only.

## Supported scope

- URL·한글 텍스트·Wi-Fi 지원
- PNG와 벡터 SVG 다운로드
- 회원가입·리디렉션 링크 없음

생성한 QR은 입력한 내용을 직접 담습니다. 링크 주소가 바뀌면 QR을 새로 만들어야 하며, Wi-Fi 비밀번호를 담은 코드는 공개하지 마세요.

## Validation

Install development dependencies with `npm install --ignore-scripts`, then run `npm test`. Synthetic test fixtures contain no personal material. Verify file ordering, output structure, error paths, and real browser downloads before deployment. Production has no Node.js dependency.

## Languages

Korean remains at the root. English, Japanese, Chinese, Spanish, German, French, Portuguese and Russian have static pages under `/en/`, `/ja/`, `/zh/`, `/es/`, `/de/`, `/fr/`, `/pt/`, `/ru/`. The footer links all nine versions. Each page has a self canonical and reciprocal hreflang links; the app sitemap lists all nine URLs. No language redirect discards the current file selection.

Edit `content/index.ko.html` for the Korean shell and `content/locales.json` for translations. Run `python scripts/build_locales.py` then `python scripts/check_locales.py`; use `--check` on the build script in CI. Shared processing and publisher scripts remain local to this independent app.
