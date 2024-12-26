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
          input.style.backgroundColor = "#444"; // 비활성화 스타일
          input.style.color = "#aaa";
          input.tabIndex = -1; // Tab 키로 접근 불가
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
   * 2. Minimization (Partition Refinement)
   *****************************************************/
  function minimize(table) {
    const states = Object.keys(table);
    const inputs = [0, 1];
  
    // (a) 초기 partition: (각 state의 output 벡터) 기준
    let partitions = [];
    const mapKeyToPartitionIndex = {};
  
    states.forEach((s) => {
      const outVec = inputs.map((inp) => table[s][inp].output).join(",");
      if (mapKeyToPartitionIndex[outVec] === undefined) {
        mapKeyToPartitionIndex[outVec] = partitions.length;
        partitions.push(new Set([s]));
      } else {
        partitions[mapKeyToPartitionIndex[outVec]].add(s);
      }
    });
  
    // (b) refinement
    let changed = true;
    while (changed) {
      changed = false;
      let newPartitions = [];
  
      for (let part of partitions) {
        // 대표 상태 (partition 내 임의의 하나)
        const representative = part.values().next().value;
        // signature별로 grouping
        let groupMap = {};
  
        for (let s of part) {
          let signature = inputs.map((inp) => {
            let nxt = table[s][inp].next;
            let out = table[s][inp].output;
            let nxtPartIndex = partitions.findIndex((p) => p.has(nxt));
            return `${nxtPartIndex}-${out}`;
          }).join("|");
  
          if (!groupMap[signature]) {
            groupMap[signature] = new Set([s]);
          } else {
            groupMap[signature].add(s);
          }
        }
  
        let groupValues = Object.values(groupMap);
        newPartitions.push(...groupValues);
        if (groupValues.length > 1) {
          changed = true;
        }
      }
      partitions = newPartitions;
    }
  
    // (c) 각 partition에 대표 이름(Min0, Min1, ...) 부여
    let minimizedTable = {};
    const representativeMap = {};
    let partitionIndex = 0;
  
    partitions.forEach((part) => {
      const repName = `Min${partitionIndex++}`;
      for (let s of part) {
        representativeMap[s] = repName;
      }
    });
  
    // (d) minimizedTable 구성
    for (let s of states) {
      let repS = representativeMap[s];
      if (!minimizedTable[repS]) {
        minimizedTable[repS] = {};
      }
      inputs.forEach((inp) => {
        let nxt = table[s][inp].next;
        let out = table[s][inp].output;
        let repNext = representativeMap[nxt];
        minimizedTable[repS][inp] = {
          next: repNext,
          output: out
        };
      });
    }
  
    const startState = Object.keys(minimizedTable)[0];
    return {
      minimizedTable,
      startState
    };
  }
  
  /*****************************************************
   * 3. Isomorphism Check
   *****************************************************/
  function checkIsomorphism(minA, minB) {
    const tableA = minA.minimizedTable;
    const tableB = minB.minimizedTable;
  
    const statesA = Object.keys(tableA);
    const statesB = Object.keys(tableB);
    if (statesA.length !== statesB.length) return false;
  
    // 상태 매핑: A의 상태 -> B의 상태
    let mapping = {};
    let visited = new Set();
    let queue = [];
  
    // 시작 상태 매핑
    mapping[minA.startState] = minB.startState;
    queue.push([minA.startState, minB.startState]);
  
    while (queue.length > 0) {
      let [aS, bS] = queue.shift();
      let key = `${aS}-${bS}`;
      if (visited.has(key)) continue;
      visited.add(key);
  
      // 입력 0,1에 대해 비교
      for (let inp of [0, 1]) {
        let aNext = tableA[aS][inp].next;
        let aOut = tableA[aS][inp].output;
        let bNext = tableB[bS][inp].next;
        let bOut = tableB[bS][inp].output;
  
        if (aOut !== bOut) return false;
  
        if (!mapping[aNext]) {
          // 아직 매핑이 없으면 등록
          mapping[aNext] = bNext;
          queue.push([aNext, bNext]);
        } else {
          // 기존 매핑과 다른 경우 => 불일치
          if (mapping[aNext] !== bNext) {
            return false;
          } else {
            queue.push([aNext, bNext]);
          }
        }
      }
    }
    return true;
  }
  
  /*****************************************************
   * 4. 최종 Equivalence 함수
   *****************************************************/
  function isEquivalent(P, X) {
    const minP = minimize(P);
    const minX = minimize(X);
    return checkIsomorphism(minP, minX);
  }
  
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
        if (!cell || !cell.value.trim()) return null;
        row.push(cell.value.trim());
      }
      const [state, next0, next1, out0, out1] = row;
      X[state] = {
        0: { next: next0, output: parseInt(out0, 10) },
        1: { next: next1, output: parseInt(out1, 10) },
      };
    }
    return X;
  }

  document.addEventListener("DOMContentLoaded", () => {
    validateAndCheckEquivalence(1);
    validateAndCheckEquivalence(2);
  });
  
  
  /*****************************************************
   * 6. 실시간 검증 함수
   *    - 모든 칸이 채워져 있으면 X를 만들고 isEquivalent 호출
   *    - 아니면 result=unknown
   *****************************************************/
  function validateAndCheckEquivalence(problemId) {
    const resultDiv = document.getElementById(`result${problemId}`);
    const X = buildXTableFromInput(problemId);

    if (!X) {
        resultDiv.textContent = "Unknown";
        return;
    }

    const P_or_Q = problemId === 1 ? P : Q;
    const isEq = isEquivalent(P_or_Q, X);
    const score = calculateScore(isEq, P_or_Q, X);

    // 결과 표시
    resultDiv.textContent = isEq ? "Equivalent (10점)" : `Not Equivalent (${score}점)`;
    return score;
  }

  function calculateScore(isEquivalent, P, X) {
    if (isEquivalent) {
        return 10; // 완전히 동치인 경우 10점
    }

    // 논리적 동치성을 반영한 최소화된 테이블 생성
    const minP = minimize(P).minimizedTable;
    const minX = minimize(X).minimizedTable;

    // 논리적 동치성을 위한 매핑 준비
    const inputs = [0, 1];
    let totalChecks = 0, matchingChecks = 0;

    for (const stateP in minP) {
        for (const input of inputs) {
            totalChecks++;

            const pOutput = minP[stateP][input].output;
            const pNext = minP[stateP][input].next;

            if (stateP in minX && input in minX[stateP]) {
                const xOutput = minX[stateP][input].output;
                const xNext = minX[stateP][input].next;

                // 출력 및 다음 상태가 모두 일치하면 매칭 증가
                if (pOutput === xOutput && pNext === xNext) {
                    matchingChecks++;
                }
            }
        }
    }

    // 일치율 계산 및 점수 반영
    const matchRate = matchingChecks / totalChecks;
    return Math.round(10 * matchRate * 100) / 100; // 소수 둘째 자리 반올림
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
  
  