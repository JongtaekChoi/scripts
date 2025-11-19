# scripts

script 모음

## task-timer

### 개요

오래걸리는 작업을 시작할 때 `$task-timer some-task [arguments...]` 로 시작하면 작업이 끝나면 끝난시간을 표시하고 완료되었습니다라는 사운드를 출력.
`.zshrc` 또는 `.bashrc`에 path 추가하여 사용

## format-minified

### 개요

Minified JavaScript 파일에 줄바꿈을 추가하여 읽기 쉽게 포맷합니다.

### 사용법

```bash
node format-minified.js <input-file> [output-file]
```

예시:

```bash
node format-minified.js some-minified.min.js
```

output-file을 지정하지 않으면 `[input-file].formatted.js`로 저장됩니다.
