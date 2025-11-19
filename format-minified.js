#!/usr/bin/env node

/**
 * Minified JavaScript 파일에 줄바꿈을 추가하여 읽기 쉽게 포맷합니다.
 * 완전한 beautify는 아니고, 주요 구문 뒤에 줄바꿈만 추가합니다.
 */

const fs = require("fs");
const path = require("path");

// 명령행 인자 처리
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("사용법: node format-minified.js <input-file> [output-file]");
  console.log(
    "예시: node format-minified.js references/MxtModularConfigurator-9.6.0.min.js"
  );
  console.log("");
  console.log(
    "output-file을 지정하지 않으면 [input-file].formatted.js로 저장됩니다."
  );
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace(/\.js$/, ".formatted.js");

console.log(`입력 파일: ${inputFile}`);
console.log(`출력 파일: ${outputFile}`);

// 파일 읽기
let content;
try {
  content = fs.readFileSync(inputFile, "utf8");
  console.log(`파일 크기: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
} catch (error) {
  console.error("파일을 읽을 수 없습니다:", error.message);
  process.exit(1);
}

console.log("포맷팅 중...");

// 빠른 포맷팅 (문자 단위 처리)
function fastFormat(code) {
  let result = "";
  let stringChars = [];
  let inRegex = false;
  let line = 1;

  function addLine() {
    line += 1;
    console.log("line" + line);
  }

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prevChar = i > 0 ? code[i - 1] : "";
    const prev2Char = i > 1 ? code[i - 2] : "";
    const nextChar = i < code.length - 1 ? code[i + 1] : "";

    // 이스케이프된 문자는 스킵
    if (prevChar === "\\" && prev2Char !== "\\") {
      result += char;
      continue;
    }

    // regex 시작 종료 감지
    if (
      (prevChar === "=" || prevChar === ",") &&
      char === "/" &&
      !stringChars.length &&
      !inRegex
    ) {
      inRegex = true;
      result += char;
      continue;
    } else if (inRegex && char === "/" && prevChar !== "\\") {
      inRegex = false;
      result += char;
      continue;
    }

    // 문자열 시작/종료 감지
    if ((char === '"' || char === "'" || char === "`") && !inRegex) {
      // 문자열 끝
      if (stringChars.length > 0) {
        if (stringChars[stringChars.length - 1] === char) {
          stringChars.pop();
        }
      } else {
        stringChars.push(char);
      }
      result += char;
      continue;
    }
    const inString = stringChars.length > 0;

    // 문자열 내부면 그냥 추가
    if (inString || inRegex) {
      result += char;
      continue;
    }

    // 문자열 외부에서만 줄바꿈 추가
    result += char;

    // 세미콜론 뒤 (for문 내부 제외)
    if (char === ";" && nextChar !== ")" && nextChar !== ";") {
      result += "\n";
      addLine();
    }

    // 중괄호 열기 뒤
    else if (char === "{" && nextChar !== "}" && nextChar !== "\n") {
      result += "\n";
      addLine();
    }

    // 중괄호 닫기 뒤
    else if (
      char === "}" &&
      nextChar !== ")" &&
      nextChar !== "," &&
      nextChar !== ";" &&
      nextChar !== "}"
    ) {
      result += "\n";
      addLine();
    }

    // webpack 모듈 구분자 (숫자:함수 패턴)
  }

  // 연속된 빈 줄 제거 (3개 이상은 2개로)
  result = result.replace(/\n{3,}/g, "\n\n");

  return result;
}

// 포맷팅 실행
console.time("포맷팅 시간");
const formatted = fastFormat(content);
console.timeEnd("포맷팅 시간");

console.log(`포맷팅 완료!`);
console.log(`원본 줄 수: ~1줄`);
console.log(
  `포맷팅 후 줄 수: ${formatted.split("\n").length.toLocaleString()}줄`
);

// 파일 저장
try {
  fs.writeFileSync(outputFile, formatted, "utf8");
  console.log(`\n✓ 파일이 저장되었습니다: ${outputFile}`);
  console.log(`파일 크기: ${(formatted.length / 1024 / 1024).toFixed(2)} MB`);
} catch (error) {
  console.error("파일을 저장할 수 없습니다:", error.message);
  process.exit(1);
}

console.log("\n완료!");
