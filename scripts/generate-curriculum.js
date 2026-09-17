import fs from 'fs';
import path from 'path';

// Complete 2022 Revised Korean Elementary Mathematics Curriculum (12 Semesters, 68 Units)
const curriculumData = [
  // === 1학년 1학기 (5단원) ===
  {
    grade: 1,
    semester: 1,
    deckName: { ko: "초등 1학년 1학기 수학", en: "Elementary Grade 1 Semester 1" },
    units: [
      {
        unit: "1. 9까지의 수",
        domain: "수와 연산",
        tags: ["수의 순서", "수 세기", "하나 더 큰 수"],
        front: { ko: "$1$부터 $9$까지의 수에서 $5$보다 $1$ 큰 수는?", en: "Which number is $1$ greater than $5$?" },
        back: { ko: "$6$ 입니다.\n\n수 배열: $1, 2, 3, 4, 5, \\mathbf{6}, 7, 8, 9$", en: "It is $6$.\n\nSequence: $1, 2, 3, 4, 5, \\mathbf{6}, 7, 8, 9$" }
      },
      {
        unit: "2. 여러 가지 모양",
        domain: "도형",
        tags: ["상자 모양", "둥근기둥", "공 모양"],
        front: { ko: "상자 모양(직육면체)과 공 모양(구)의 가장 큰 차이점은?", en: "What is the main difference between a box shape and a ball shape?" },
        back: { ko: "상자 모양은 평평한 면이 있어 쌓을 수 있고, 공 모양은 모든 방향으로 잘 굴러갑니다.", en: "A box shape has flat faces that can be stacked; a ball shape rolls smoothly in all directions." }
      },
      {
        unit: "3. 덧셈과 뺄셈",
        domain: "수와 연산",
        tags: ["모으기와 가르기", "기초 덧셈"],
        front: { ko: "$4$와 $3$을 모으면(더하면) 얼마인가요?", en: "What is $4 + 3$?" },
        back: { ko: "$$4 + 3 = 7$$\n\n$4$에 $3$을 더하면 $7$이 됩니다.", en: "$$4 + 3 = 7$$\n\nAdding $3$ to $4$ makes $7$." }
      },
      {
        unit: "4. 비교하기",
        domain: "측정",
        tags: ["길이 비교", "무게 비교", "넓이 비교"],
        front: { ko: "길이를 비교할 때 사용하는 표현은 무엇인가요?", en: "Which terms are used to compare lengths?" },
        back: { ko: "'더 길다'와 '더 짧다'를 사용합니다.\n\n(키를 비교할 때는 '더 크다', '더 작다')", en: "'Longer' and 'shorter' are used for length comparisons." }
      },
      {
        unit: "5. 50까지의 수",
        domain: "수와 연산",
        tags: ["10개씩 묶음", "자릿값 기초"],
        front: { ko: "$10$개씩 $3$묶음과 낱개 $7$개는 얼마인가요?", en: "What number is $3$ bundles of $10$ and $7$ ones?" },
        back: { ko: "$37$ (서른일곱) 입니다.", en: "It is $37$ (thirty-seven)." }
      }
    ]
  },

  // === 1학년 2학기 (5단원) ===
  {
    grade: 1,
    semester: 2,
    deckName: { ko: "초등 1학년 2학기 수학", en: "Elementary Grade 1 Semester 2" },
    units: [
      {
        unit: "1. 100까지의 수",
        domain: "수와 연산",
        tags: ["두 자리 수", "수의 순서"],
        front: { ko: "$99$보다 $1$ 큰 수는 무엇인가요?", en: "What number is $1$ greater than $99$?" },
        back: { ko: "$100$ (백) 입니다.\n\n$10$이 $10$개 모인 수입니다.", en: "It is $100$ (one hundred), made of ten $10$s." }
      },
      {
        unit: "2. 덧셈과 뺄셈(1)",
        domain: "수와 연산",
        tags: ["받아올림 없는 덧셈", "받아내림 없는 뺄셈"],
        front: { ko: "$23 + 14$의 계산 결과는?", en: "What is $23 + 14$?" },
        back: { ko: "$$23 + 14 = 37$$\n\n십의 자리: $2+1=3$, 일의 자리: $3+4=7$", en: "$$23 + 14 = 37$$\nTens: $2+1=3$, Ones: $3+4=7$" }
      },
      {
        unit: "3. 여러 가지 모양",
        domain: "도형",
        tags: ["평면 모양", "세모", "네모", "동그라미"],
        front: { ko: "네모 모양(직사각형)의 특징은?", en: "What is the characteristic of a square/rectangle shape?" },
        back: { ko: "곧은 선으로 둘러싸여 있고, 뾰족한 곳(꼭짓점)이 $4$개 있습니다.", en: "It is enclosed by straight lines and has $4$ corners." }
      },
      {
        unit: "4. 덧셈과 뺄셈(2)",
        domain: "수와 연산",
        tags: ["10이 되는 더하기", "10을 이용한 빼기"],
        front: { ko: "$10$을 만들기 위해 $7$에 더해야 하는 수는?", en: "What number must be added to $7$ to make $10$?" },
        back: { ko: "$3$ 입니다.\n\n$$7 + 3 = 10$$", en: "It is $3$.\n\n$$7 + 3 = 10$$" }
      },
      {
        unit: "5. 시계 보기와 규칙 찾기",
        domain: "측정",
        tags: ["정각", "30분", "규칙 찾기"],
        front: { ko: "긴바늘이 $6$을 가리킬 때 시계는 몇 분인가요?", en: "How many minutes past when the long hand points to $6$?" },
        back: { ko: "$30$분 입니다.\n\n(예: 짧은바늘이 $2$와 $3$ 사이, 긴바늘이 $6$이면 $2$시 $30$분)", en: "It is $30$ minutes past (half past)." }
      }
    ]
  },

  // === 2학년 1학기 (6단원) ===
  {
    grade: 2,
    semester: 1,
    deckName: { ko: "초등 2학년 1학기 수학", en: "Elementary Grade 2 Semester 1" },
    units: [
      {
        unit: "1. 세 자리 수",
        domain: "수와 연산",
        tags: ["세 자리 수", "백의 자리", "자릿값"],
        front: { ko: "$100$이 $5$개, $10$이 $3$개, $1$이 $8$개인 수는?", en: "What number has five $100$s, three $10$s, and eight $1$s?" },
        back: { ko: "$538$ (오백삼십팔) 입니다.", en: "It is $538$." }
      },
      {
        unit: "2. 여러 가지 도형",
        domain: "도형",
        tags: ["삼각형", "사각형", "원", "꼭짓점", "변"],
        front: { ko: "삼각형의 변과 꼭짓점은 각각 몇 개인가요?", en: "How many sides and vertices does a triangle have?" },
        back: { ko: "변 $3$개, 꼭짓점 $3$개 입니다.", en: "$3$ sides and $3$ vertices." }
      },
      {
        unit: "3. 덧셈과 뺄셈",
        domain: "수와 연산",
        tags: ["받아올림", "받아내림", "두 자리 수 연산"],
        front: { ko: "$38 + 25$의 계산 결과는?", en: "What is $38 + 25$?" },
        back: { ko: "$$38 + 25 = 63$$\n\n일의 자리 $8+5=13$에서 $10$을 받아올림합니다.", en: "$$38 + 25 = 63$$\n\n$8 + 5 = 13$, carry over $10$ to tens." }
      },
      {
        unit: "4. 길이 재기",
        domain: "측정",
        tags: ["센티미터", "cm", "자 사용법"],
        front: { ko: "길이의 표준 단위인 $1\\text{ cm}$는 어떻게 읽나요?", en: "How is the unit $1\\text{ cm}$ read?" },
        back: { ko: "$1$ 센티미터라고 읽습니다.", en: "One centimeter." }
      },
      {
        unit: "5. 분류하기",
        domain: "자료와 가능성",
        tags: ["분류 기준", "분류하여 세기"],
        front: { ko: "대상을 분류할 때 가장 중요한 것은?", en: "What is most important when classifying items?" },
        back: { ko: "누가 분류하더라도 같은 결과가 나오는 '분명한 기준'을 정하는 것입니다.", en: "Setting a clear, objective criterion so that anyone gets the same result." }
      },
      {
        unit: "6. 곱셈",
        domain: "수와 연산",
        tags: ["몇씩 몇 묶음", "곱셈 기호", "배"],
        front: { ko: "$5$개씩 $4$묶음은 덧셈식과 곱셈식으로 어떻게 나타내나요?", en: "Express $4$ groups of $5$ as addition and multiplication." },
        back: { ko: "- 덧셈: $5 + 5 + 5 + 5 = 20$\n- 곱셈: $$5 \\times 4 = 20$$", en: "- Addition: $5 + 5 + 5 + 5 = 20$\n- Multiplication: $$5 \\times 4 = 20$$" }
      }
    ]
  },

  // === 2학년 2학기 (6단원) ===
  {
    grade: 2,
    semester: 2,
    deckName: { ko: "초등 2학년 2학기 수학", en: "Elementary Grade 2 Semester 2" },
    units: [
      {
        unit: "1. 네 자리 수",
        domain: "수와 연산",
        tags: ["천", "네 자리 수", "자릿값"],
        front: { ko: "$100$이 $10$개 모이면 어떤 수가 되나요?", en: "What number is made of ten $100$s?" },
        back: { ko: "$1000$ (천)이 됩니다.", en: "It becomes $1000$ (one thousand)." }
      },
      {
        unit: "2. 곱셈구구",
        domain: "수와 연산",
        tags: ["구구단", "곱셈구구 규칙"],
        front: { ko: "$8$단 곱셈구구에서 곱하는 수가 $1$ 커지면 값은 얼마씩 커지나요?", en: "In the $8$-times table, by how much does the product increase when multiplier increases by $1$?" },
        back: { ko: "$8$씩 커집니다. ($8 \\times 1 = 8, 8 \\times 2 = 16, \\dots$)", en: "It increases by $8$ each time." }
      },
      {
        unit: "3. 길이 재기",
        domain: "측정",
        tags: ["미터", "m", "길이의 합과 차"],
        front: { ko: "$1\\text{ m}$는 몇 $\\text{cm}$인가요?", en: "How many centimeters is $1\\text{ m}$?" },
        back: { ko: "$$1\\text{ m} = 100\\text{ cm}$$", en: "$$1\\text{ m} = 100\\text{ cm}$$" }
      },
      {
        unit: "4. 시각과 시간",
        domain: "측정",
        tags: ["1시간", "60분", "하루 24시간"],
        front: { ko: "$1$시간은 몇 분이고, 하루는 몇 시간인가요?", en: "How many minutes in $1$ hour, and hours in a day?" },
        back: { ko: "- $1$시간 $= 60$분\n- 하루 $= 24$시간", en: "- $1$ hour $= 60$ minutes\n- $1$ day $= 24$ hours" }
      },
      {
        unit: "5. 표와 그래프",
        domain: "자료와 가능성",
        tags: ["표", "그래프", "자료 정리"],
        front: { ko: "자료를 표와 그래프로 나타내면 어떤 장점이 있나요?", en: "What is the advantage of representing data in tables and graphs?" },
        back: { ko: "표는 전체 합계와 정확한 수량을 알기 쉽고, 그래프는 한눈에 크기를 비교하기 쉽습니다.", en: "Tables make exact numbers clear; graphs allow instant visual comparison." }
      },
      {
        unit: "6. 규칙 찾기",
        domain: "규칙성",
        tags: ["수 배열 규칙", "모양 규칙"],
        front: { ko: "수 배열 $2, 4, 6, 8, \\square$에서 빈칸에 알맞은 수와 규칙은?", en: "In $2, 4, 6, 8, \\square$, what is the missing number and rule?" },
        back: { ko: "$10$ 입니다. 규칙: $2$씩 커지는 규칙입니다.", en: "$10$. Rule: Increases by $2$ each step." }
      }
    ]
  },

  // === 3학년 1학기 (6단원) ===
  {
    grade: 3,
    semester: 1,
    deckName: { ko: "초등 3학년 1학기 수학", en: "Elementary Grade 3 Semester 1" },
    units: [
      {
        unit: "1. 덧셈과 뺄셈",
        domain: "수와 연산",
        tags: ["세 자리 수 덧셈", "세 자리 수 뺄셈"],
        front: { ko: "$457 + 286$의 계산값은?", en: "What is $457 + 286$?" },
        back: { ko: "$$457 + 286 = 743$$", en: "$$457 + 286 = 743$$" }
      },
      {
        unit: "2. 평면도형",
        domain: "도형",
        tags: ["선분", "반직선", "직선", "직각", "직사각형"],
        front: { ko: "선분, 반직선, 직선의 차이점은 무엇인가요?", en: "What is the difference between line segment, ray, and line?" },
        back: { ko: "- **선분:** 두 점을 곧게 이은 선 (양쪽 끝 있음)\n- **반직선:** 한 점에서 시작하여 한쪽으로 끝없이 늘인 선\n- **직선:** 양쪽으로 끝없이 늘인 곧은 선", en: "- **Segment:** straight line between two endpoints\n- **Ray:** starts at one point and extends infinitely in one direction\n- **Line:** extends infinitely in both directions" }
      },
      {
        unit: "3. 나눗셈",
        domain: "수와 연산",
        tags: ["나눗셈 기초", "곱셈과 나눗셈의 관계"],
        front: { ko: "$18$개의 사과를 $3$명에게 똑같이 나누어 줄 때 나눗셈식과 몫은?", en: "Express dividing $18$ apples equally among $3$ people." },
        back: { ko: "$$18 \\div 3 = 6$$\n\n몫은 $6$입니다. ($3 \\times 6 = 18$)", en: "$$18 \\div 3 = 6$$\n\nQuotient is $6$." }
      },
      {
        unit: "4. 곱셈",
        domain: "수와 연산",
        tags: ["(몇십몇)×(몇)", "두 자리 수 곱셈"],
        front: { ko: "$24 \\times 3$의 계산값은?", en: "What is $24 \\times 3$?" },
        back: { ko: "$$24 \\times 3 = 72$$\n\n$20 \\times 3 = 60, 4 \\times 3 = 12 \\rightarrow 60 + 12 = 72$", en: "$$24 \\times 3 = 72$$" }
      },
      {
        unit: "5. 길이와 시간",
        domain: "측정",
        tags: ["밀리미터", "킬로미터", "초 단위"],
        front: { ko: "$1\\text{ cm}$는 몇 $\\text{mm}$이고, $1\\text{ km}$는 몇 $\\text{m}$인가요?", en: "How many mm in $1\\text{ cm}$, and m in $1\\text{ km}$?" },
        back: { ko: "- $$1\\text{ cm} = 10\\text{ mm}$$\n- $$1\\text{ km} = 1000\\text{ m}$$", en: "- $$1\\text{ cm} = 10\\text{ mm}$$\n- $$1\\text{ km} = 1000\\text{ m}$$" }
      },
      {
        unit: "6. 분수와 소수",
        domain: "수와 연산",
        tags: ["분수 기초", "분모", "분자", "소수 첫째 자리"],
        front: { ko: "전체를 $10$으로 나눈 것 중의 $1$을 분수와 소수로 나타내면?", en: "Express $1$ out of $10$ equal parts as fraction and decimal." },
        back: { ko: "- 분수: $$\\frac{1}{10}$$\n- 소수: $$0.1$$ (영 점 일)", en: "- Fraction: $$\\frac{1}{10}$$\n- Decimal: $$0.1$$" }
      }
    ]
  },

  // === 3학년 2학기 (6단원) ===
  {
    grade: 3,
    semester: 2,
    deckName: { ko: "초등 3학년 2학기 수학", en: "Elementary Grade 3 Semester 2" },
    units: [
      {
        unit: "1. 곱셈",
        domain: "수와 연산",
        tags: ["세 자리 수 곱셈", "(두 자리 수)×(두 자리 수)"],
        front: { ko: "$35 \\times 20$의 계산값은?", en: "What is $35 \\times 20$?" },
        back: { ko: "$$35 \\times 20 = 700$$\n\n$35 \\times 2 = 70$ 뒤에 $0$을 붙입니다.", en: "$$35 \\times 20 = 700$$" }
      },
      {
        unit: "2. 나눗셈",
        domain: "수와 연산",
        tags: ["나머지가 있는 나눗셈", "검산식"],
        front: { ko: "$19 \\div 4$의 몫과 나머지는 얼마이며, 검산식은?", en: "Find quotient, remainder, and check formula for $19 \\div 4$." },
        back: { ko: "몫: $4$, 나머지: $3$\n\n검산식: $$4 \\times 4 + 3 = 19$$\n(나누는 수 $\\times$ 몫 $+$ 나머지 $=$ 나뉠 수)", en: "Quotient: $4$, Remainder: $3$\nCheck: $$4 \\times 4 + 3 = 19$$" }
      },
      {
        unit: "3. 원",
        domain: "도형",
        tags: ["원의 중심", "반지름", "지름", "컴퍼스"],
        front: { ko: "원의 반지름과 지름의 정의는 무엇인가요?", en: "What are definitions of radius and diameter of a circle?" },
        back: { ko: "- **반지름 ($r$):** 원의 중심에서 원 위의 한 점을 이은 선분\n- **지름 ($d$):** 원의 중심을 지나 원 위의 두 점을 이은 선분 ($d = 2r$)", en: "- **Radius ($r$):** segment from center to any point on circle\n- **Diameter ($d$):** segment through center connecting two points ($d = 2r$)" }
      },
      {
        unit: "4. 분수",
        domain: "수와 연산",
        tags: ["진분수", "가분수", "대분수"],
        front: { ko: "진분수, 가분수, 대분수의 구별 기준은?", en: "How are proper, improper, and mixed fractions defined?" },
        back: { ko: "- **진분수:** 분자가 분모보다 작은 분수 (예: $\\frac{2}{3}$)\n- **가분수:** 분자가 분모와 같거나 큰 분수 (예: $\\frac{5}{3}$)\n- **대분수:** 자연수와 진분수로 이루어진 분수 (예: $1\\frac{2}{3}$)", en: "- **Proper:** numerator < denominator (e.g. $\\frac{2}{3}$)\n- **Improper:** numerator $\\ge$ denominator (e.g. $\\frac{5}{3}$)\n- **Mixed:** whole number + proper fraction (e.g. $1\\frac{2}{3}$)" }
      },
      {
        unit: "5. 들이와 무게",
        domain: "측정",
        tags: ["리터", "밀리리터", "킬로그램", "그램"],
        front: { ko: "$1\\text{ L}$는 몇 $\\text{mL}$이고, $1\\text{ kg}$는 몇 $\\text{g}$인가요?", en: "How many mL in $1\\text{ L}$, and g in $1\\text{ kg}$?" },
        back: { ko: "- $$1\\text{ L} = 1000\\text{ mL}$$\n- $$1\\text{ kg} = 1000\\text{ g}$$", en: "- $$1\\text{ L} = 1000\\text{ mL}$$\n- $$1\\text{ kg} = 1000\\text{ g}$$" }
      },
      {
        unit: "6. 자료의 정리",
        domain: "자료와 가능성",
        tags: ["그림그래프", "자료 해석"],
        front: { ko: "그림그래프의 가장 큰 특징은 무엇인가요?", en: "What is the key feature of a pictograph?" },
        back: { ko: "수량을 그림 기호(큰 그림, 작은 그림)의 크기와 개수로 나타내어 크고 작음을 직관적으로 알 수 있습니다.", en: "Represents quantities using sized symbols to intuitively show magnitudes." }
      }
    ]
  },

  // === 4학년 1학기 (6단원) ===
  {
    grade: 4,
    semester: 1,
    deckName: { ko: "초등 4학년 1학기 수학", en: "Elementary Grade 4 Semester 1" },
    units: [
      {
        unit: "1. 큰 수",
        domain: "수와 연산",
        tags: ["만", "억", "조", "자릿값"],
        front: { ko: "$1$억($100,000,000$)은 $1$만이 몇 개 모인 수인가요?", en: "How many $10,000$s make $1$ hundred million ($10^8$)?" },
        back: { ko: "$1$만이 $10,000$개(만 개) 모인 수입니다.\n\n$$1\\text{억} = 10^8$$", en: "Ten thousand $10,000$s ($10^4 \\times 10^4 = 10^8$)." }
      },
      {
        unit: "2. 각도",
        domain: "도형",
        tags: ["예각", "직각", "둔각", "삼각형과 사각형 내각의 합"],
        front: { ko: "예각과 둔각의 정의는 무엇인가요?", en: "What are the definitions of acute and obtuse angles?" },
        back: { ko: "- **예각:** $0^\\circ$보다 크고 $90^\\circ$보다 작은 각\n- **둔각:** $90^\\circ$보다 크고 $180^\\circ$보다 작은 각", en: "- **Acute:** between $0^\\circ$ and $90^\\circ$\n- **Obtuse:** between $90^\\circ$ and $180^\\circ$" }
      },
      {
        unit: "3. 곱셈과 나눗셈",
        domain: "수와 연산",
        tags: ["(세 자리 수)×(두 자리 수)", "(세 자리 수)÷(두 자리 수)"],
        front: { ko: "$250 \\div 50$의 계산값은?", en: "What is $250 \\div 50$?" },
        back: { ko: "$$250 \\div 50 = 5$$\n\n$25 \\div 5 = 5$와 결과가 같습니다.", en: "$$250 \\div 50 = 5$$" }
      },
      {
        unit: "4. 평면도형의 이동",
        domain: "도형",
        tags: ["밀기", "뒤집기", "돌리기"],
        front: { ko: "도형을 시계 방향으로 $180^\\circ$ 돌리면 어떻게 되나요?", en: "What happens when rotating a shape $180^\\circ$ clockwise?" },
        back: { ko: "위쪽과 아래쪽, 왼쪽과 오른쪽의 위치가 완전히 반대가 됩니다.", en: "Top/bottom and left/right are completely reversed." }
      },
      {
        unit: "5. 막대그래프",
        domain: "자료와 가능성",
        tags: ["막대그래프", "눈금의 크기"],
        front: { ko: "막대그래프에서 눈금 한 칸의 크기를 정할 때 고려할 점은?", en: "What should be considered when choosing scale unit for a bar graph?" },
        back: { ko: "조사한 자료 중 가장 큰 수와 가장 작은 수를 보고 알맞은 눈금 크기($1, 2, 5, 10$ 등)를 정해야 합니다.", en: "Examine min and max values to choose a suitable step size ($1, 2, 5, 10$, etc.)." }
      },
      {
        unit: "6. 규칙 찾기",
        domain: "규칙성",
        tags: ["계산식 규칙", "배열의 규칙"],
        front: { ko: "$1 + 3 = 4$, $1 + 3 + 5 = 9$, $1 + 3 + 5 + 7 = 16$의 규칙은?", en: "What is the pattern in $1+3=4, 1+3+5=9, 1+3+5+7=16$?" },
        back: { ko: "$1$부터 연속된 홀수 $n$개의 합은 $$n \\times n = n^2$$ 입니다.", en: "The sum of the first $n$ odd numbers equals $$n^2$$." }
      }
    ]
  },

  // === 4학년 2학기 (6단원) ===
  {
    grade: 4,
    semester: 2,
    deckName: { ko: "초등 4학년 2학기 수학", en: "Elementary Grade 4 Semester 2" },
    units: [
      {
        unit: "1. 분수의 덧셈과 뺄셈",
        domain: "수와 연산",
        tags: ["동분모 덧셈", "동분모 뺄셈", "대분수 연산"],
        front: { ko: "분모가 같은 분수의 덧셈 방법은?", en: "How do you add fractions with the same denominator?" },
        back: { ko: "분모는 그대로 두고, 분자끼리만 더합니다.\n\n$$\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}$$", en: "Keep denominator unchanged and add numerators:\n\n$$\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}$$" }
      },
      {
        unit: "2. 삼각형",
        domain: "도형",
        tags: ["이등변삼각형", "정삼각형", "직각/예각/둔각삼각형"],
        front: { ko: "이등변삼각형과 정삼각형의 정의와 각의 성질은?", en: "What are definitions and angle properties of isosceles and equilateral triangles?" },
        back: { ko: "- **이등변삼각형:** 두 변의 길이가 같고, 두 밑각의 크기가 같음\n- **정삼각형:** 세 변의 길이가 모두 같고, 세 각이 모두 $60^\\circ$로 같음", en: "- **Isosceles:** $2$ equal sides and $2$ equal base angles\n- **Equilateral:** $3$ equal sides and all angles are $60^\\circ$" }
      },
      {
        unit: "3. 소수의 덧셈과 뺄셈",
        domain: "수와 연산",
        tags: ["소수 자릿값", "소수점 맞추기"],
        front: { ko: "소수의 덧셈과 뺄셈을 세로셈으로 계산할 때 가장 중요한 규칙은?", en: "What is the crucial rule when aligning decimal addition/subtraction vertically?" },
        back: { ko: "반드시 **소수점의 위치를 똑같이 맞추어** 같은 자릿수끼리 계산해야 합니다.", en: "Always align the decimal points vertically before adding/subtracting." }
      },
      {
        unit: "4. 사각형",
        domain: "도형",
        tags: ["사다리꼴", "평행사변형", "마름모", "직사각형", "정사각형"],
        front: { ko: "마름모(Rhombus)의 정의와 대각선 성질은?", en: "What is the definition and diagonal property of a rhombus?" },
        back: { ko: "- 정의: 네 변의 길이가 모두 같은 사각형\n- 성질: 두 대각선이 서로를 수직이등분합니다.", en: "- Definition: quadrilateral with $4$ equal sides\n- Property: diagonals bisect each other at right angles ($90^\\circ$)." }
      },
      {
        unit: "5. 꺾은선그래프",
        domain: "자료와 가능성",
        tags: ["꺾은선그래프", "변화 상태", "물결선"],
        front: { ko: "꺾은선그래프는 어떤 자료를 나타낼 때 가장 유용한가요?", en: "When is a line graph most useful?" },
        back: { ko: "시간의 흐름에 따라 연속적으로 변하는 양(기온, 키, 몸무게 등)의 변화 상태를 나타낼 때 유용합니다.", en: "Most useful for showing changes over time continuously (temperature, height, etc.)." }
      },
      {
        unit: "6. 다각형",
        domain: "도형",
        tags: ["다각형", "정다각형", "대각선"],
        front: { ko: "$n$각형의 한 꼭짓점에서 그을 수 있는 대각선의 수는?", en: "How many diagonals can be drawn from one vertex of an $n$-gon?" },
        back: { ko: "$$n - 3$$\n\n(자기 자신과 이웃한 두 꼭짓점 $3$개를 제외하기 때문입니다)", en: "$$n - 3$$\n\n(Excluding itself and its two adjacent neighbors)." }
      }
    ]
  },

  // === 5학년 1학기 (6단원) ===
  {
    grade: 5,
    semester: 1,
    deckName: { ko: "초등 5학년 1학기 수학", en: "Elementary Grade 5 Semester 1" },
    units: [
      {
        unit: "1. 자연수의 혼합 계산",
        domain: "수와 연산",
        tags: ["연산 순서", "괄호", "사칙연산 우선순위"],
        front: { ko: "덧셈, 뺄셈, 곱셈, 나눗셈, 괄호가 섞인 식의 계산 순서는?", en: "What is the order of operations when mixed with brackets and arithmetic?" },
        back: { ko: "1. 괄호 안 $((~))$을 가장 먼저 계산\n2. 곱셈($\\times$)과 나눗셈($\\div$)을 왼쪽부터 차례대로 계산\n3. 덧셈($+$)과 뺄셈($-$)을 왼쪽부터 차례대로 계산", en: "1. Inside parentheses first\n2. Multiplication & division from left to right\n3. Addition & subtraction from left to right" }
      },
      {
        unit: "2. 약수와 배수",
        domain: "수와 연산",
        tags: ["약수", "배수", "최대공약수", "최소공배수"],
        front: { ko: "두 수 $12$와 $18$의 최대공약수(GCD)와 최소공배수(LCM)는?", en: "Find GCD and LCM of $12$ and $18$." },
        back: { ko: "- 최대공약수: $$\\gcd(12, 18) = 6$$\n- 최소공배수: $$\\text{lcm}(12, 18) = 36$$", en: "- GCD: $$\\gcd(12, 18) = 6$$\n- LCM: $$\\text{lcm}(12, 18) = 36$$" }
      },
      {
        unit: "3. 규칙과 대응",
        domain: "규칙성",
        tags: ["대응 관계", "변화하는 두 양", "식 세우기"],
        front: { ko: "자전거의 바퀴 수($y$)와 자전거 대수($x$) 사이의 대응 관계식은?", en: "Express relation between number of bicycle wheels ($y$) and bicycles ($x$)." },
        back: { ko: "$$y = 2 \\times x$$\n\n(자전거 $1$대마다 바퀴가 $2$개씩 대응합니다)", en: "$$y = 2 \\times x$$\n\n(Each bicycle has $2$ wheels)." }
      },
      {
        unit: "4. 약분과 통분",
        domain: "수와 연산",
        tags: ["크기가 같은 분수", "약분", "기약분수", "통분"],
        front: { ko: "기약분수(Irreducible fraction)란 무엇인가요?", en: "What is an irreducible fraction (fraction in simplest form)?" },
        back: { ko: "분모와 분자의 공약수가 $1$뿐인 분수 (더 이상 약분할 수 없는 분수)입니다.\n\n예: $\\frac{6}{8} \\rightarrow \\frac{3}{4}$", en: "A fraction where numerator and denominator have no common divisor other than $1$." }
      },
      {
        unit: "5. 분수의 덧셈과 뺄셈",
        domain: "수와 연산",
        tags: ["이분모 덧셈", "이분모 뺄셈", "통분 연산"],
        front: { ko: "분모가 다른 분수 $\\frac{1}{2} + \\frac{1}{3}$의 계산 방법과 결과는?", en: "How do you calculate $\\frac{1}{2} + \\frac{1}{3}$?" },
        back: { ko: "분모를 최소공배수 $6$으로 통분한 후 계산합니다.\n\n$$\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$$", en: "Find common denominator ($6$):\n\n$$\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$$" }
      },
      {
        unit: "6. 다각형의 둘레와 넓이",
        domain: "측정",
        tags: ["평행사변형 넓이", "삼각형 넓이", "사다리꼴 넓이", "마름모 넓이"],
        front: { ko: "삼각형과 사다리꼴의 넓이 공식은?", en: "Formulas for area of triangle and trapezoid?" },
        back: { ko: "- **삼각형:** $$\\text{넓이} = \\frac{\\text{밑변} \\times \\text{높이}}{2}$$\n- **사다리꼴:** $$\\text{넓이} = \\frac{(\\text{윗변} + \\text{아랫변}) \\times \\text{높이}}{2}$$", en: "- **Triangle:** $$A = \\frac{b \\times h}{2}$$\n- **Trapezoid:** $$A = \\frac{(a + b) \\times h}{2}$$" }
      }
    ]
  },

  // === 5학년 2학기 (6단원) ===
  {
    grade: 5,
    semester: 2,
    deckName: { ko: "초등 5학년 2학기 수학", en: "Elementary Grade 5 Semester 2" },
    units: [
      {
        unit: "1. 수의 범위와 어림하기",
        domain: "수와 연산",
        tags: ["이상과 이하", "초과와 미만", "올림", "버림", "반올림"],
        front: { ko: "'이상/이하'와 '초과/미만'의 결정적 차이는?", en: "Difference between 'at least/at most' and 'greater than/less than'?" },
        back: { ko: "- **이상/이하:** 그 기준 수를 **포함**함 ($\\ge, \\le$)\n- **초과/미만:** 그 기준 수를 **포함하지 않음** ($>, <$)", en: "- **이상/이하:** Includes the boundary value ($\\ge, \\le$)\n- **초과/미만:** Excludes the boundary value ($>, <$)" }
      },
      {
        unit: "2. 분수의 곱셈",
        domain: "수와 연산",
        tags: ["(분수)×(자연수)", "(분수)×(분수)", "약분 계산"],
        front: { ko: "분수끼리의 곱셈 $\\frac{a}{b} \\times \\frac{c}{d}$ 계산 방법은?", en: "How do you multiply two fractions $\\frac{a}{b} \\times \\frac{c}{d}$?" },
        back: { ko: "분모는 분모끼리, 분자는 분자끼리 곱합니다.\n\n$$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$$", en: "Multiply numerators together and denominators together:\n\n$$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$$" }
      },
      {
        unit: "3. 합동과 대칭",
        domain: "도형",
        tags: ["도형의 합동", "선대칭도형", "점대칭도형"],
        front: { ko: "선대칭도형과 점대칭도형의 정의는?", en: "Definitions of line symmetric and point symmetric figures?" },
        back: { ko: "- **선대칭도형:** 한 직선(대칭축)을 접었을 때 완전히 겹치는 도형\n- **점대칭도형:** 한 점(대칭의 중심)을 중심으로 $180^\\circ$ 돌렸을 때 처음 도형과 완전히 겹치는 도형", en: "- **Line symmetry:** folds onto itself along an axis\n- **Point symmetry:** rotates $180^\\circ$ around a center point onto itself" }
      },
      {
        unit: "4. 소수의 곱셈",
        domain: "수와 연산",
        tags: ["소수점 이동", "소수의 곱셈"],
        front: { ko: "$0.3 \\times 0.4$의 계산 결과와 소수점 위치는?", en: "What is $0.3 \\times 0.4$ and how is the decimal placed?" },
        back: { ko: "$$0.3 \\times 0.4 = 0.12$$\n\n소수 첫째 자리수 2개를 곱하면 소수 둘째 자리가 됩니다. ($3 \\times 4 = 12 \\rightarrow 0.12$)", en: "$$0.3 \\times 0.4 = 0.12$$\n\nTwo 1-decimal numbers multiply to produce a 2-decimal product." }
      },
      {
        unit: "5. 직육면체",
        domain: "도형",
        tags: ["직육면체", "정육면체", "면/모서리/꼭짓점", "전개도"],
        front: { ko: "직육면체의 면, 모서리, 꼭짓점의 수는 각각 몇 개인가요?", en: "How many faces, edges, and vertices does a cuboid have?" },
        back: { ko: "- 면: $6$개\n- 모서리: $12$개\n- 꼭짓점: $8$개", en: "- Faces: $6$\n- Edges: $12$\n- Vertices: $8$" }
      },
      {
        unit: "6. 평균과 가능성",
        domain: "자료와 가능성",
        tags: ["평균 구하기", "사건이 일어날 가능성"],
        front: { ko: "자료의 평균(Mean)을 구하는 공식은?", en: "Formula to find the mean (average)?" },
        back: { ko: "$$\\text{평균} = \\frac{\\text{자료의 값의 총합}}{\\text{자료의 개수}}$$", en: "$$\\text{Mean} = \\frac{\\text{Sum of all values}}{\\text{Number of values}}$$" }
      }
    ]
  },

  // === 6학년 1학기 (6단원) ===
  {
    grade: 6,
    semester: 1,
    deckName: { ko: "초등 6학년 1학기 수학", en: "Elementary Grade 6 Semester 1" },
    units: [
      {
        unit: "1. 분수의 나눗셈",
        domain: "수와 연산",
        tags: ["(분수)÷(자연수)", "(분수)÷(분수)", "역수 곱셈"],
        front: { ko: "분수의 나눗셈 $\\frac{a}{b} \\div \\frac{c}{d}$의 계산 원리는?", en: "How do you divide fractions $\\frac{a}{b} \\div \\frac{c}{d}$?" },
        back: { ko: "나누는 분수의 분모와 분자를 바꾸어(역수) 곱합니다.\n\n$$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c} = \\frac{ad}{bc}$$", en: "Multiply by the reciprocal of the divisor fraction:\n\n$$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$$" }
      },
      {
        unit: "2. 각기둥과 각뿔",
        domain: "도형",
        tags: ["각기둥", "각뿔", "밑면", "옆면"],
        front: { ko: "$n$각기둥의 꼭짓점 수, 면의 수, 모서리의 수는?", en: "Formulas for vertices, faces, and edges of an $n$-gonal prism?" },
        back: { ko: "- **꼭짓점 수:** $$2n$$\n- **면의 수:** $$n + 2$$\n- **모서리 수:** $$3n$$", en: "- **Vertices:** $$2n$$\n- **Faces:** $$n + 2$$\n- **Edges:** $$3n$$" }
      },
      {
        unit: "3. 소수의 나눗셈",
        domain: "수와 연산",
        tags: ["(소수)÷(자연수)", "(소수)÷(소수)"],
        front: { ko: "$4.8 \\div 1.2$를 계산하는 가장 쉬운 방법은?", en: "Best way to calculate $4.8 \\div 1.2$?" },
        back: { ko: "나누는 수와 나뉠 수에 똑같이 $10$을 곱해 자연수의 나눗셈으로 바꿉니다.\n\n$$4.8 \\div 1.2 = 48 \\div 12 = 4$$", en: "Multiply both divisor and dividend by $10$:\n\n$$4.8 \\div 1.2 = 48 \\div 12 = 4$$" }
      },
      {
        unit: "4. 비와 비율",
        domain: "규칙성",
        tags: ["비", "비율", "백분율", "할인율"],
        front: { ko: "비 $A : B$에서 기준량, 비교하는 양, 비율, 백분율 공식은?", en: "Formulas for base, compared, ratio, and percentage in $A : B$?" },
        back: { ko: "- **기준량:** $B$ (뒤의 수)\n- **비교하는 양:** $A$ (앞의 수)\n- **비율:** $$\\frac{A}{B}$$\n- **백분율:** $$\\frac{A}{B} \\times 100\\;(\\%)$$", en: "- **Base:** $B$\n- **Compared:** $A$\n- **Ratio:** $$\\frac{A}{B}$$\n- **Percentage:** $$\\frac{A}{B} \\times 100\\;(\\%)$$" }
      },
      {
        unit: "5. 여러 가지 그래프",
        domain: "자료와 가능성",
        tags: ["띠그래프", "원그래프", "비율그래프"],
        front: { ko: "띠그래프와 원그래프의 공통적인 특징과 용도는?", en: "Common feature and purpose of bar and circle percentage graphs?" },
        back: { ko: "전체에 대한 각 부분의 **비율(백분율)**을 한눈에 알아보기 쉽게 나타내는 비율그래프입니다. (전체 합은 항상 $100\\%$)", en: "Proportional graphs showing parts of a whole as percentages (totaling $100\\%$)." }
      },
      {
        unit: "6. 직육면체의 부피와 겉넓이",
        domain: "측정",
        tags: ["부피 공식", "겉넓이 공식", "세제곱센티미터"],
        front: { ko: "가로 $a$, 세로 $b$, 높이 $h$인 직육면체의 부피와 겉넓이 공식은?", en: "Formulas for volume and surface area of cuboid ($a \\times b \\times h$)?" },
        back: { ko: "- **부피:** $$V = a \\times b \\times h$$\n- **겉넓이:** $$S = 2(ab + bh + ah)$$", en: "- **Volume:** $$V = a \\times b \\times h$$\n- **Surface Area:** $$S = 2(ab + bh + ah)$$" }
      }
    ]
  },

  // === 6학년 2학기 (6단원) ===
  {
    grade: 6,
    semester: 2,
    deckName: { ko: "초등 6학년 2학기 수학", en: "Elementary Grade 6 Semester 2" },
    units: [
      {
        unit: "1. 분수의 나눗셈",
        domain: "수와 연산",
        tags: ["(자연수)÷(분수)", "(분수)÷(분수) 심화"],
        front: { ko: "$6 \\div \\frac{2}{3}$의 계산값과 풀이는?", en: "Calculate $6 \\div \\frac{2}{3}$." },
        back: { ko: "$$6 \\div \\frac{2}{3} = 6 \\times \\frac{3}{2} = \\frac{18}{2} = 9$$", en: "$$6 \\div \\frac{2}{3} = 6 \\times \\frac{3}{2} = 9$$" }
      },
      {
        unit: "2. 소수의 나눗셈",
        domain: "수와 연산",
        tags: ["나누어떨어지지 않는 소수", "반올림 어림"],
        front: { ko: "$7 \\div 3$을 소수 둘째 자리까지 반올림하여 구하면?", en: "Round $7 \\div 3$ to two decimal places." },
        back: { ko: "$$7 \\div 3 = 2.333\\dots \\approx 2.33$$\n\n소수 셋째 자리($3$)에서 버림하므로 $2.33$ 입니다.", en: "$$7 \\div 3 = 2.333\\dots \\approx 2.33$$" }
      },
      {
        unit: "3. 공간과 입체",
        domain: "도형",
        tags: ["쌓기나무", "위/앞/옆 투영", "개수 세기"],
        front: { ko: "쌓기나무로 만든 모양을 평면에 나타내는 가장 확실한 방법은?", en: "Best way to represent a block structure in 2D plane?" },
        back: { ko: "위, 앞, 옆에서 본 모양을 그리고, 각 자리에 쌓인 나무의 개수(숫자)를 함께 적는 방법입니다.", en: "Drawing top, front, side views and labeling the block height count in each grid position." }
      },
      {
        unit: "4. 비례식과 비례배분",
        domain: "규칙성",
        tags: ["비례식", "외항의 곱", "내항의 곱", "비례배분"],
        front: { ko: "비례식 $A : B = C : D$의 핵심 성질과 비례배분 공식은?", en: "Core property of proportion $A : B = C : D$ and proportional distribution?" },
        back: { ko: "- **비례식 성질:** 외항의 곱 $=$ 내항의 곱\n  $$A \\times D = B \\times C$$\n- **비례배분:** 전체 $S$를 $m : n$으로 배분할 때\n  $$S \\times \\frac{m}{m+n}, \\quad S \\times \\frac{n}{m+n}$$", en: "- **Proportion:** Product of extremes equals product of means ($$A \\times D = B \\times C$$)\n- **Distribution:** $$S \\times \\frac{m}{m+n}, \\; S \\times \\frac{n}{m+n}$$" }
      },
      {
        unit: "5. 원의 넓이",
        domain: "측정",
        tags: ["원주율", "원주", "원의 넓이", "파이"],
        front: { ko: "반지름 $r$인 원의 둘레(원주)와 넓이 공식은?", en: "Formulas for circumference and area of a circle with radius $r$?" },
        back: { ko: "- **원주 (둘레):** $$l = 2 \\times \\text{반지름} \\times \\pi = 2\\pi r$$\n- **원의 넓이:** $$A = \\text{반지름} \\times \\text{반지름} \\times \\pi = \\pi r^2$$", en: "- **Circumference:** $$l = 2\\pi r$$\n- **Area:** $$A = \\pi r^2$$" }
      },
      {
        unit: "6. 원기둥·원뿔·구",
        domain: "도형",
        tags: ["회전체", "원기둥", "원뿔", "구"],
        front: { ko: "원기둥, 원뿔, 구의 공통점과 차이점은 무엇인가요?", en: "Similarities and differences between cylinder, cone, and sphere?" },
        back: { ko: "- **공통점:** 모두 평면도형(직사각형, 직각삼각형, 반원)을 한 바퀴 회전시켜 만든 '회전체'이며 둥근 면을 가짐\n- **차이점:**\n  - 원기둥: 평행한 밑면 $2$개\n  - 원뿔: 밑면 $1$개와 뾰족한 꼭짓점 $1$개\n  - 구: 모든 면이 굽은 면이며 꼭짓점과 밑면이 없음", en: "- **Similarities:** All are solids of revolution with curved surfaces.\n- **Differences:** Cylinder has $2$ parallel bases; cone has $1$ base and $1$ apex; sphere has no edges or vertices." }
      }
    ]
  }
];

// Assemble complete decks JSON
let cardCounter = 1;
const decks = curriculumData.map((d) => {
  const deckId = `deck-elem-${d.grade}-${d.semester}`;
  const cards = d.units.map((u, idx) => {
    return {
      id: `c-${d.grade}-${d.semester}-${idx + 1}`,
      grade: d.grade,
      semester: d.semester,
      unit: u.unit,
      domain: u.domain,
      tags: u.tags,
      front: u.front,
      back: u.back,
      review: {
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: ""
      }
    };
  });

  return {
    id: deckId,
    name: d.deckName,
    grade: d.grade,
    semester: d.semester,
    cards
  };
});

const output = {
  version: 2,
  lastModified: new Date().toISOString(),
  decks
};

const targetPath = path.resolve('src/data/curriculum-seed.json');
fs.writeFileSync(targetPath, JSON.stringify(output, null, 2), 'utf-8');

console.log(`Successfully generated ${decks.length} decks with ${decks.reduce((a, b) => a + b.cards.length, 0)} cards covering 68 units!`);
