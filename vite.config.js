// Vite 설정 (npm run dev / npm run build).
import { defineConfig } from 'vite';

export default defineConfig({
  // 만든 파일(dist/)을 어느 주소 아래에 올려도 열리게, 파일 주소를 상대 경로(./)로 쓴다
  // 예) https://아이디.github.io/railmap/ 처럼 폴더 아래에 올려도 된다
  base: './',
  build: {
    // 지도 라이브러리(MapLibre)가 커서 기본 경고(500KB)가 늘 나온다 (지금 약 1.7MB, 압축하면 0.5MB). 알고 있으니 기준을 올려 둔다
    chunkSizeWarningLimit: 2000,
  },
});
