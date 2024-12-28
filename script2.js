const cases_P = [
  // 패턴 없음
  { input: [0, 0, 0, 0, 0, 0, 0, 0], expectedOutput: '00000000' },
  { input: [1, 1, 1, 1, 1, 1, 1, 1], expectedOutput: '00000000' },

  // 단일 패턴 (010, 101)
  { input: [0, 1, 0], expectedOutput: '001' },
  { input: [1, 0, 1], expectedOutput: '001' },

  // 패턴이 반복적으로 나옴
  { input: [0, 1, 0, 0, 1, 0], expectedOutput: '001001' },
  { input: [1, 0, 1, 1, 0, 1], expectedOutput: '001001' },

  // 패턴이 중간에 끊어짐
  { input: [0, 1, 1, 0, 1, 0], expectedOutput: '000011' },
  { input: [1, 0, 0, 1, 0, 1], expectedOutput: '000011' },

  // 긴 입력에서 패턴이 뒤늦게 발생
  { input: [0, 0, 0, 0, 0, 1, 0, 1, 0], expectedOutput: '000000111' },
  { input: [1, 1, 1, 0, 1, 0, 1, 0, 0], expectedOutput: '000011110' },

  // 긴 입력에서 다양한 패턴 포함
  { input: [0, 1, 0, 1, 1, 0, 1, 0, 0, 1], expectedOutput: '0011001100' },
  { input: [1, 0, 1, 0, 1, 1, 0, 1, 0, 1], expectedOutput: '0011100111' },

  // 매우 긴 입력 (무작위 0, 1)
  { input: [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0], expectedOutput: '00100000011110001111' },
  { input: [1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0], expectedOutput: '00111001100001110000' },

  // 특정 패턴이 끝에 위치
  { input: [0, 0, 1, 0, 0, 1, 0], expectedOutput: '0001001' }, // '010' 후 '101' 발생
  { input: [1, 0, 1, 0, 1, 0, 1], expectedOutput: '0011111' }, // 연속된 '101' 패턴

  // 중간에 복잡하게 섞임
  { input: [0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1], expectedOutput: '000000110001' },
  { input: [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1], expectedOutput: '001000110011' },
];

const cases_Q = [
  // 패턴 없음
  { input: [0, 0, 0, 0, 0, 0], expectedOutput: '000000' }, // 모두 0
  { input: [1, 1, 1, 1, 1, 1], expectedOutput: '000000' }, // 모두 1

  // 패턴이 한번만 발생
  { input: [1, 1, 0, 0, 0], expectedOutput: '00011' }, // 간단한 패턴
  { input: [0, 1, 1, 0, 0, 0], expectedOutput: '000011' }, // 패턴 앞에 0

  // 패턴이 두 번 연속 발생
  { input: [1, 1, 0, 0, 1, 1, 0, 0], expectedOutput: '00010001' }, // 반복된 패턴
  { input: [0, 1, 1, 0, 0, 0, 1, 1, 0, 0], expectedOutput: '0000110001' }, // 앞뒤로 0

  // 패턴이 끊어짐
  { input: [1, 1, 0, 1, 0, 0, 1, 1, 0], expectedOutput: '000000000' }, // 중간에 다른 값
  { input: [0, 1, 1, 0, 1, 1, 0, 0, 0], expectedOutput: '000000011' }, // 패턴 뒤 끊어짐

  // 긴 입력에서 다양한 패턴 포함
  { input: [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0], expectedOutput: '000110001111' }, // 여러 구간에 패턴
  { input: [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0], expectedOutput: '00000110001' }, // 뒤쪽에서 패턴 발생

  // 중간에 다른 패턴 포함
  { input: [1, 1, 0, 0, 1, 1, 1, 0, 0, 0], expectedOutput: '0001000000' }, // 중간에 혼합된 값
  { input: [0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0], expectedOutput: '00000000011' }, // 끝부분에서 패턴 발생

  // 매우 긴 입력
  { input: [0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0], expectedOutput: '00001100011000000' }, // 복잡한 긴 입력
  { input: [1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0], expectedOutput: '00010000011000111' }, // 여러 값 섞임

  // 끝부분에서 패턴 발생
  { input: [0, 0, 1, 1, 0, 0, 0], expectedOutput: '0000011' }, // 간단한 끝부분 패턴
  { input: [1, 1, 0, 0, 1, 1, 0, 0, 0], expectedOutput: '000100011' }, // 끝부분에서만 발생
];

let global_currentState = "A";

/*****************************************************
 * 1. 정답 State Table (P)
 *****************************************************/
const P = {
    A: { 
      0: { next: "B", output: 0 }, 
      1: { next: "C", output: 0 } 
    },
    B: { 
      0: { next: "B", output: 0 }, 
      1: { next: "D", output: 0 } 
    },
    C: { 
      0: { next: "E", output: 0 }, 
      1: { next: "C", output: 0 } 
    },
    D: { 
      0: { next: "E", output: 1 }, 
      1: { next: "C", output: 0 } 
    },
    E: { 
      0: { next: "B", output: 0 }, 
      1: { next: "D", output: 1 } 
    }
  };
  
  const Q = {
    A: { 
      0: { next: "A", output: 0 }, 
      1: { next: "B", output: 0 } 
    },
    B: { 
      0: { next: "A", output: 0 }, 
      1: { next: "C", output: 0 } 
    },
    C: { 
      0: { next: "E", output: 0 }, 
      1: { next: "D", output: 0 } 
    },
    D: { 
      0: { next: "A", output: 0 }, 
      1: { next: "D", output: 0 } 
    },
    E: { 
      0: { next: "E", output: 1 }, 
      1: { next: "B", output: 0 } 
    }
  };

  // 동적으로 5×5 테이블 생성 함수 (초기값 포함)
  function createTable(problemId, initialValues) {
    const table = document.getElementById(`inputTable${problemId}`);
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
  
    // 테이블 헤더 생성
    const headerRow = document.createElement("tr");
    ["State", "Next if x=0", "Next if x=1", "Out if x=0", "Out if x=1"].forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
  
    // 테이블 바디 생성
    const states = Object.keys(initialValues); // 초기값의 상태 이름 가져오기
    let rowIndex = 0;
  
    for (const state of states) {
      const tr = document.createElement("tr");
  
      // 초기값 배열 생성
      const rowValues = [
        state, 
        initialValues[state][0].next, 
        initialValues[state][1].next, 
        initialValues[state][0].output, 
        initialValues[state][1].output,
      ];
  
      rowValues.forEach((value, colIndex) => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.id = `cell${problemId}_${rowIndex}_${colIndex}`;
        input.dataset.problem = problemId;
        input.dataset.row = rowIndex;
        input.dataset.col = colIndex;
        input.value = value; // 초기값 설정
  
        if (colIndex === 0) {
          // 첫 번째 열 고정 (수정 불가)
          input.readOnly = true;
          input.tabIndex = -1; // Tab 키로 접근 불가
          if (problemId === 2) {
            input.onclick = () => {
              // console.log("Clicked on state", state);
              // 원하는 작업 수행
              // console.log(state)
              global_currentState = state;
              const previouslySelected = table.querySelector(".selected-state");
              if (previouslySelected) {
                previouslySelected.classList.remove("selected-state");
              }
              validateAndCheckEquivalence(problemId)
              // 현재 클릭된 input에 selected-state 클래스 추가
              input.classList.add("selected-state");

            };
            if (state === global_currentState) {
              input.classList.add("selected-state");
            }
          }
        } else {
          // 나머지 열은 수정 가능
          input.oninput = () => validateAndCheckEquivalence(problemId);
        }
  
        td.appendChild(input);
        tr.appendChild(td);
      });
  
      tbody.appendChild(tr);
      rowIndex++;
    }
  
    // 테이블에 추가
    table.appendChild(thead);
    table.appendChild(tbody);
  }
  
  
  
  
  // 페이지 로드 시 테이블 동적 생성
  document.addEventListener("DOMContentLoaded", () => {
    // P와 Q는 초기값으로 제공
    createTable(1, P); // 첫 번째 표는 P의 초기값
    createTable(2, Q); // 두 번째 표는 Q의 초기값
  
    // 초기 검증 수행
    validateAndCheckEquivalence(1);
    validateAndCheckEquivalence(2);
  });
    
  /*****************************************************
   * 5. 사용자 입력값 -> X 테이블 생성
   *    - 5행 x 5열: 만약 한 칸이라도 비어있다면 null
   *****************************************************/
  function buildXTableFromInput(problemId) {
    const rows = 5, cols = 5;
    const X = {};
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const cell = document.getElementById(`cell${problemId}_${r}_${c}`);
        row.push(cell && cell.value.trim() ? cell.value.trim() : null);
      }
      let [state, next0, next1, out0, out1] = row;

      // State와 다음 상태를 대문자로 변환
      state = state ? state.toUpperCase() : null;
      next0 = next0 ? next0.toUpperCase() : null;
      next1 = next1 ? next1.toUpperCase() : null;

      X[state] = {
        0: { next: next0, output: parseInt(out0, 10) },
        1: { next: next1, output: parseInt(out1, 10) },
      };
    }
    return X;
  }
  
  /*****************************************************
   * 6. 실시간 검증 함수
   *    - 모든 칸이 채워져 있으면 X를 만들고 isEquivalent 호출
   *    - 아니면 result=unknown
   *****************************************************/
  function validateAndCheckEquivalence(problemId) {

    const X = buildXTableFromInput(problemId);
    if (!X) {
      // 하나라도 비어있는 칸이 있으면 결과를 unknown으로 표시
      document.getElementById(`result${problemId}`).textContent = "Unknown";
      return;
    }
    const testCases = problemId === 1 ? cases_P : cases_Q;
    const startState = problemId === 1 ? "A" : global_currentState;
    console.log(startState);
    const resultDiv = document.getElementById(`result${problemId}`);
    let totalCases = testCases.length;
    let matchedCases = 0;
  
    for (let testCase of testCases) {
      const { input, expectedOutput } = testCase;
      const actualOutput = evaluateStateMachine(X, startState, input);
      
  
      if (actualOutput === expectedOutput) {
        matchedCases++;
      }
      else {
        console.log(`Failed for input: ${input}, expected: ${expectedOutput}, got: ${actualOutput}`);
      }
    }
    console.log(matchedCases, totalCases);
  
    // 일치율 기반 점수 계산
    const score = Math.round((matchedCases / totalCases) * 10 * 10) / 10;
    resultDiv.textContent = score === 10 ? "Equivalent (10점)" : `Not Equivalent (${score}점)`;
    // return Math.round(score * 100) / 100; // 소수 둘째 자리 반올림
  }
  
  function evaluateStateMachine(X, startState, inputSequence) {
    let currentState = startState;
    let outputSequence = [];
  
    for (let input of inputSequence) {
      if (!X[currentState] || !X[currentState][input]) {
        return null; // 트랜지션이 정의되지 않은 경우
      }
  
      const transition = X[currentState][input];
      outputSequence.push(transition.output);
      currentState = transition.next;
    }
  
    return outputSequence.join(''); // 출력 시퀀스를 문자열로 반환
  }

  
  /*****************************************************
   * 7. 방향키 이동 처리
   *****************************************************/
  document.addEventListener("keydown", (e) => {
    if (!e.target.matches('input[type="text"]')) return;
    const problemId = e.target.dataset.problem;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    if (isNaN(row) || isNaN(col)) return;
  
    let newRow = row, newCol = col;
  
    switch (e.key) {
      case "ArrowUp":
        newRow = Math.max(0, row - 1);
        break;
      case "ArrowDown":
        newRow = Math.min(4, row + 1);
        break;
      case "ArrowLeft":
        // 첫 번째 열로는 이동하지 않도록 제한
        newCol = Math.max(1, col - 1);
        break;
      case "ArrowRight":
        // 다섯 번째 열까지만 이동 가능
        newCol = Math.min(4, col + 1);
        break;
      case "Tab":
        // Tab 키의 기본 동작 방지 및 커스텀 이동 처리
        e.preventDefault();
        if (!e.shiftKey) {
          // Tab (앞으로 이동)
          if (col < 4) {
            newCol = col + 1;
          } else if (row < 4) {
            newRow = row + 1;
            newCol = 1; // 다음 행의 두 번째 열로 이동
          }
        } else {
          // Shift + Tab (뒤로 이동)
          if (col > 1) {
            newCol = col - 1;
          } else if (row > 0) {
            newRow = row - 1;
            newCol = 4; // 이전 행의 다섯 번째 열로 이동
          }
        }
        break;
      default:
        return; // 다른 키는 무시
    }
  
    const nextCell = document.getElementById(`cell${problemId}_${newRow}_${newCol}`);
    if (nextCell) {
      nextCell.focus();
      setTimeout(() => nextCell.select(), 0);
    }
  });
  
  