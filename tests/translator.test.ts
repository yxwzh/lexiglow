import { describe, expect, test } from "vitest";

import {
  parseGoogleTranslateResponse,
  parseLlmTranslationResponse,
  parseSentenceAnalysisResponse,
  sanitizeTranslatorSettings,
} from "../src/shared/translator";

describe("google response parsing", () => {
  test("joins translation segments", () => {
    const payload = [[["你好", "hello", null, null, 10]], null, "en"];
    expect(parseGoogleTranslateResponse(payload)).toBe("你好");
  });

  test("returns empty string for unexpected payloads", () => {
    expect(parseGoogleTranslateResponse({})).toBe("");
  });
});

describe("llm response parsing", () => {
  test("reads structured word and sentence translations", () => {
    expect(
      parseLlmTranslationResponse('{"word":"收到的","sentence":"我们昨天收到了你的包裹。"}'),
    ).toEqual({
      translation: "收到的",
      sentenceTranslation: "我们昨天收到了你的包裹。",
    });
  });

  test("falls back to plain text when response is not json", () => {
    expect(parseLlmTranslationResponse("收到的")).toEqual({
      translation: "收到的",
    });
  });

  test("defaults llm display mode to word", () => {
    expect(sanitizeTranslatorSettings({}).llmDisplayMode).toBe("word");
  });
});

describe("sentence analysis parsing", () => {
  test("reads structured analysis payload", () => {
    expect(
      parseSentenceAnalysisResponse(
        '{"translation":"尽管实验失败了，团队仍然决定继续。","structure":"主句是 team decided，although 引导让步状语从句。","analysisSteps":["先抓主句主干，主语是 team，谓语是 decided。","再看 although 引导的让步状语从句，交代背景。","最后补足 to continue 这个不定式，说明决定的内容。"],"highlights":[{"text":"Although","category":"conjunction"},{"text":"team","category":"subject"},{"text":"decided","category":"predicate"},{"text":"continue","category":"nonfinite"}]}',
      ),
    ).toEqual({
      translation: "尽管实验失败了，团队仍然决定继续。",
      structure: "主句是 team decided，although 引导让步状语从句。",
      analysisSteps: [
        "先抓主句主干，主语是 team，谓语是 decided。",
        "再看 although 引导的让步状语从句，交代背景。",
        "最后补足 to continue 这个不定式，说明决定的内容。",
      ],
      highlights: [
        { text: "Although", category: "conjunction" },
        { text: "team", category: "subject" },
        { text: "decided", category: "predicate" },
        { text: "continue", category: "nonfinite" },
      ],
    });
  });
});
