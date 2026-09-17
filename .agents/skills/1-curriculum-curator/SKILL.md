---
name: curriculum-curator
description: Manage, validate, and expand the 2022 Korean elementary mathematics curriculum (1~6학년 전 과정), formula formatting in KaTeX, and deck categorization across 5 domains.
---

# Curriculum Curator Skill

This skill guides the agent in maintaining, generating, and validating math flashcard decks for Korean elementary school education (초등 1~6학년).

## 1. Domain & Unit Classification Reference
All cards must be classified into one of the 5 official national curriculum domains:
1. `수와 연산` (Numbers & Operations)
2. `도형` (Geometry)
3. `측정` (Measurement)
4. `규칙성` (Patterns & Relationships)
5. `자료와 가능성` (Data & Probability)

## 2. Card Schema & Validation Rules
Every card in the curriculum must adhere to this JSON structure:
```json
{
  "id": "elem-5-1-ch2-01",
  "grade": 5,
  "semester": 1,
  "unit": "2. 약수와 배수",
  "domain": "수와 연산",
  "tags": ["약수", "공약수", "최대공약수"],
  "front": {
    "ko": "약수(Divisor)란 무엇인가요?",
    "en": "What is a divisor?"
  },
  "back": {
    "ko": "어떤 수를 나누어떨어지게 하는 수입니다.\n\n예: $6$의 약수는 $1, 2, 3, 6$",
    "en": "A number that divides into another number with no remainder.\n\nE.g.: Divisors of $6$ are $1, 2, 3, 6$"
  },
  "review": {
    "interval": 0,
    "repetitions": 0,
    "easeFactor": 2.5,
    "dueDate": "YYYY-MM-DD"
  }
}
```

## 3. Math KaTeX Formatting Rules
- Wrap inline math in single dollar signs `$ ... $` (e.g. `$2 \times 3 = 6$`).
- Wrap display/block math in double dollar signs `$$ ... $$` (e.g. `$$\frac{1}{2} + \frac{1}{4} = \frac{3}{4}$$`).
- Use `\text{...}` inside KaTeX for any units or Hangul annotations (e.g. `$5\text{ cm}$`).
- Test that all formulas render without LaTeX syntax errors before committing.
