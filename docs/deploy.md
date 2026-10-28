# 레일맵 웹 데모 올리기

> **지금 상태 (2026-10-28)**: 웹 데모가 **GitHub Pages**로 올라가 있어요 → https://kutanxx.github.io/railmap/
> 저장소는 https://github.com/kutanxx/railmap (공개)이고, `main`에 커밋을 올리면(push) 1~2분 뒤 저절로 새 버전이 올라가요.
> 아래 "방법 1"(Netlify)은 다른 곳에 따로 올리고 싶을 때만 보면 돼요.

레일맵은 서버가 필요 없는 "정적 사이트"예요. `npm run build`로 만든 `dist` 폴더의 파일만 인터넷에 올리면, 링크 하나로 누구나 브라우저에서 할 수 있어요. 저장은 각자 브라우저에 되므로 서버나 데이터베이스가 필요 없어요.

> **정적 사이트**: 미리 만들어 둔 파일(HTML, JS, CSS)을 그대로 보여주기만 하는 사이트. 무료로 올릴 곳이 많다.

## 0. 먼저 내 컴퓨터에서 확인하기

```bash
npm run build
```

```bash
npm run preview
```

터미널에 나온 주소(보통 `http://localhost:4173`)를 브라우저로 열어 아래를 확인해요.

- 시작 화면이 나오고, 서울과 솔내 지방이 둘 다 열리나요?
- 처음 열면 튜토리얼 말풍선이 나오나요?
- 오른쪽 아래에 지도 출처 표기(서울: "OpenFreeMap © OpenMapTiles Data from OpenStreetMap", 솔내: "가상 지도 · 글꼴 OpenFreeMap")가 보이나요?

확인했으면 터미널에서 Ctrl+C로 끕니다.

## 방법 1. Netlify Drop (GitHub 없이 끌어다 놓기, 다른 곳에 따로 올릴 때)

GitHub 없이 폴더를 끌어다 놓기만 하면 돼요.

1. 위의 `npm run build`를 해서 `dist` 폴더를 만든다. (`C:\projects\railmap\dist`)
2. 브라우저에서 <https://app.netlify.com/drop> 을 연다.
3. 무료 계정으로 가입·로그인한다. 로그인하지 않고 올린 사이트는 잠시 뒤 지워질 수 있다.
4. 탐색기에서 `dist` 폴더를 통째로 화면의 상자 안에 끌어다 놓는다.
5. 잠시 뒤 `https://무작위이름.netlify.app` 같은 주소가 나온다. 이 주소가 공유할 링크다.
6. (선택) 사이트 설정 → Site name에서 주소 앞부분을 `railmap-demo`처럼 바꿀 수 있다.

**고친 뒤 다시 올릴 때**: `npm run build`를 다시 하고, Netlify의 그 사이트 화면 → Deploys에서 새 `dist` 폴더를 다시 끌어다 놓는다.

## 방법 2. GitHub Pages (커밋할 때마다 저절로)

GitHub에 저장소를 올려 두면, `main`에 커밋을 올릴 때마다 저절로 새로 만들어 올려요. 설정 파일(`.github/workflows/deploy.yml`)은 이미 들어 있어요.

1. <https://github.com> 에 가입하고, 새 저장소(예: `railmap`)를 만든다. 공개(Public)로 만들어야 무료로 Pages를 쓸 수 있다.
2. 저장소 화면에 나오는 안내대로 이 폴더를 연결하고 올린다. (예: `git remote add origin https://github.com/아이디/railmap.git` 다음 `git push -u origin main`)
3. 저장소 → Settings → Pages → "Build and deployment"의 Source를 **GitHub Actions**로 고른다.
4. 저장소 → Actions 탭에서 "웹 데모 올리기"가 초록색으로 끝나면, `https://아이디.github.io/railmap/` 이 링크가 된다.

`vite.config.js`에 `base: './'`를 넣어 두어서, 이렇게 폴더(`/railmap/`) 아래에 올려도 열려요.

## 알아둘 점

- **지도 자료**: 실제 도시 지도(10곳)와 글꼴은 OpenFreeMap에서 받아 와요. 가입·키 없이 쓸 수 있는 무료 서비스라 데모에 그대로 써도 되지만, 사람이 아주 많이 몰리는 서비스로 키울 때는 OpenFreeMap 안내를 다시 확인해요.
- **출처 표기**: 오른쪽 아래 출처 표기는 지우면 안 돼요 (OpenStreetMap 이용 조건).
- **저장**: 게임 저장은 각자의 브라우저에 돼요. 다른 컴퓨터로 옮기려면 [내보내기]로 파일을 받아 [불러오기] 하면 돼요.
- **크기**: 처음 열 때 받는 파일이 약 0.5MB(압축)이고, 솔내 지방을 고르면 지도 자료 약 0.1MB를 더 받아요.

## 링크 미리보기 (카카오톡·디스코드에 주소를 붙일 때 나오는 카드)

- 제목·설명·그림 주소는 `index.html` 맨 위 `og:`로 시작하는 줄들에 있어요.
- 그림은 `public/og-image.png` (1200×630)예요. 서울 노선망 위에 제목 판을 얹은 그림이에요.
- 그림 주소는 데모 주소를 그대로 적어야 해요 (`https://kutanxx.github.io/railmap/og-image.png`). 다른 곳(Netlify 등)으로 옮기면 이 주소도 바꿔요.
- 카카오톡은 미리보기를 한동안 기억해요. 바꾼 뒤에도 예전 카드가 나오면 [카카오 공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 주소를 넣고 "캐시 초기화"를 눌러요.
