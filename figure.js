const BIG_CURVERTURE = 3;
const stateMachine = {
  transitions: {
    A: { 0: { next: null, output: null }, 1: { next: null, output: null } },
    B: { 0: { next: null, output: null }, 1: { next: null, output: null } },
    C: { 0: { next: null, output: null }, 1: { next: null, output: null } },
    D: { 0: { next: null, output: null }, 1: { next: null, output: null } },
    E: { 0: { next: null, output: null }, 1: { next: null, output: null } }
  },
  
  // 상태 전이 추가
  addTransition(fromState, input, nextState, output) {
    fromState = fromState.replace('state-', '');
    nextState = nextState.replace('state-', '');
    this.transitions[fromState][input] = {
      next: nextState,
      output: parseInt(output)
    };
    this.checkCompletion();
  },
  
  // 상태 전이 제거
  removeTransition(fromState, input) {
    fromState = fromState.replace('state-', '');
    this.transitions[fromState][input] = {
      next: null,
      output: null
    };
    this.checkCompletion();
  },
  
  // 전이 존재 여부 확인
  hasTransition(fromState, input) {
    fromState = fromState.replace('state-', '');
    return this.transitions[fromState][input].next !== null;
  },
  
  // 완성 여부 체크
  isComplete() {
    return Object.entries(this.transitions).every(([state, transitions]) => {
      return [0, 1].every(input => 
        transitions[input].next !== null && 
        transitions[input].output !== null
      );
    });
  },
  
  // 미완성된 전이 목록
  getMissingTransitions() {
    const missing = [];
    Object.entries(this.transitions).forEach(([state, transitions]) => {
      [0, 1].forEach(input => {
        if (!transitions[input].next || transitions[input].output === null) {
          missing.push({ state, input });
        }
      });
    });
    return missing;
  },

  checkEquivalence() {
    const resultDiv = document.querySelector('.result');
    if (!this.isComplete()) {
      return;
    }
  
    const currentMode = document.getElementById('btnP').classList.contains('active') ? 'P' : 'Q';
    
    const problemId = currentMode === 'P' ? 1 : 2;
    console.log("Problem ID:", problemId);
    const score = validateAndCheckEquivalence(this.transitions, problemId);
    
    resultDiv.textContent = score === 10 ? 'Equivalent (10점)' : `Not Equivalent (${score}점)`;
    resultDiv.style.backgroundColor = score === 10 ? '#003300' : '#330000';
    resultDiv.style.borderColor = score === 10 ? '#00ff00' : '#ff0000';
    resultDiv.style.color = score === 10 ? '#00ff00' : '#ff0000';
  },
  
  checkCompletion() {
    const isCompleted = this.isComplete();
    const resultDiv = document.querySelector('.result');
    
    if (isCompleted) {
      console.log("상태 머신 완성!", this.transitions);
      this.checkEquivalence();
      return true;
    } else {
      const missing = this.getMissingTransitions();
      console.log("미완성 전이:", missing);
      this.checkEquivalence();
      if (resultDiv) resultDiv.textContent = 'Unknown';
      return false;
    }
  }
};


function activateP() {
  document.getElementById('btnP').classList.add('active');
  document.getElementById('btnQ').classList.remove('active');
  stateMachine.checkEquivalence();
}

function activateQ() {
  document.getElementById('btnQ').classList.add('active');
  document.getElementById('btnP').classList.remove('active');
  stateMachine.checkEquivalence();
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const states = new Set(['A', 'B', 'C', 'D', 'E']);
  
  let selectedState = null;
  let ghostState = null;
  let currentLine = null;
  let isPopupOpen = false;

  // Add result div
  const resultDiv = document.createElement('div');
  resultDiv.className = 'result';
  resultDiv.textContent = 'Unknown';
  document.body.appendChild(resultDiv);
  

  // 키보드 입력 처리
  document.addEventListener("keydown", (e) => {
    if (isPopupOpen) {
      const key = e.key.toUpperCase();
      if ((key >= "A" && key <= "E") || key === "S") {
        e.preventDefault();
        return;
      }
      return;
    }

    if (e.key === "Escape") {
      cancelCurrentAction();
      return;
    }

    const key = e.key.toUpperCase();
    if (!["A", "B", "C", "D", "E", "S"].includes(key)) return;

    if (key === "S") {
      startLineDrawing();
    } else {
      startStateCreation(key);
    }
  });

  function cancelCurrentAction() {
    if (ghostState) {
      canvas.removeChild(ghostState);
      ghostState = null;
    }
    if (currentLine?.element) {
      currentLine.element.remove();
    }
    selectedState = null;
    currentLine = null;
    canvas.style.cursor = "default";
  }

  function startLineDrawing() {
    currentLine = { start: null, end: null };
    canvas.style.cursor = "crosshair";
  }

  function startStateCreation(key) {
    if (!ghostState) {
      ghostState = document.createElement("div");
      ghostState.className = "state ghost";
      canvas.appendChild(ghostState);
    }
    ghostState.textContent = key;
    selectedState = key;
    canvas.style.cursor = "none";
  }

  // 마우스 이동 처리
  canvas.addEventListener("mousemove", (e) => {
    if (ghostState) {
      updateGhostPosition(e);
    }
    if (currentLine?.start && currentLine.element) {
      updateLineDrawing(e);
    }
  });

  function updateGhostPosition(e) {
    ghostState.style.left = `${e.clientX - 30}px`;
    ghostState.style.top = `${e.clientY - 30}px`;
  }

  function updateLineDrawing(e) {
    const startState = document.getElementById(currentLine.start);
    const startRect = startState.getBoundingClientRect();
    const startX = startRect.left + startRect.width/2;
    const startY = startRect.top + startRect.height/2;
    
    const controlX = (startX + e.clientX)/2 - (e.clientY - startY)*0.2;
    const controlY = (startY + e.clientY)/2 + (e.clientX - startX)*0.2;
    
    currentLine.element.setAttribute("d",
      `M ${startX} ${startY} Q ${controlX} ${controlY} ${e.clientX} ${e.clientY}`
    );
  }

  // 상태 생성 및 선 그리기 처리
  canvas.addEventListener("click", (e) => {
    if (selectedState && !currentLine) {
      handleStateCreation(e);
    } else if (currentLine) {
      handleLineCreation(e);
    }
  });

  function handleStateCreation(e) {
    const stateId = `state-${selectedState}`;
    const existing = document.getElementById(stateId);

    if (existing) {
      moveExistingState(existing, e);
    } else {
      createNewState(stateId, e);
    }

    if (ghostState) {
      canvas.removeChild(ghostState);
      ghostState = null;
      selectedState = null;
      canvas.style.cursor = "default";
    }
  }

  function moveExistingState(state, e) {
    state.style.left = `${e.clientX - 30}px`;
    state.style.top = `${e.clientY - 30}px`;
    updateConnectedLines(state.id);
  }

  function createNewState(stateId, e) {
    const state = document.createElement("div");
    state.className = "state";
    state.id = stateId;
    state.style.left = `${e.clientX - 30}px`;
    state.style.top = `${e.clientY - 30}px`;
    state.textContent = stateId.split('-')[1];
    canvas.appendChild(state);
  }

  function handleLineCreation(e) {
    const targetState = e.target.closest(".state");
    if (!targetState) {
      cancelCurrentAction();
      return;
    }

    if (!currentLine.start) {
      startNewLine(targetState);
    } else {
      finishLine(targetState);
    }
  }

  function startNewLine(targetState) {
    currentLine.start = targetState.id;
    const svg = createSVGElement();
    canvas.insertBefore(svg, canvas.firstChild);
    currentLine.element = svg.querySelector('path');
    currentLine.svg = svg;
    currentLine.markerId = svg.querySelector('marker').id;
  }

  function finishLine(targetState) {
    currentLine.end = targetState.id;
    showTransitionPopup(currentLine);
  }

  function createSVGElement() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const markerId = `arrowhead-${Math.random().toString(36).substr(2, 9)}`;
    
    svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;pointer-events:none;';
    svg.innerHTML = `
      <defs>
        <marker id="${markerId}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#ffcc00"/>
        </marker>
      </defs>
      <path stroke="#ffcc00" stroke-width="2" fill="none" marker-end="url(#${markerId})"/>
    `;
    
    return svg;
  }

  // 전이 팝업 처리
  function showTransitionPopup(line) {
    isPopupOpen = true;

    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    overlay.innerHTML = `
      <div class="popup">
        <h2>상태 전이 입력</h2>
        <div class="input-group">
          <label>입력값 (x)</label>
          <div class="button-group" id="input-x">
            <button class="input-button" data-value="0">0</button>
            <button class="input-button" data-value="1">1</button>
          </div>
        </div>
        <div class="input-group">
          <label>출력값 (z)</label>
          <div class="button-group" id="input-z">
            <button class="input-button" data-value="0">0</button>
            <button class="input-button" data-value="1">1</button>
          </div>
        </div>
        <button id="popup-submit">확인</button>
      </div>
    `;

    document.body.appendChild(overlay);
    setupPopupEventListeners(overlay, line);
}

function setupPopupEventListeners(overlay, line) {
    const popup = overlay.querySelector('.popup');
    const submit = popup.querySelector('#popup-submit');
    let selectedX = null;
    let selectedZ = null;

    const handleButtonClick = (event) => {
        const group = event.target.closest('.button-group');
        const value = event.target.dataset.value;

        if (group.id === 'input-x') {
            selectedX = value;
            updateSelectedButton(group, value);
        } else if (group.id === 'input-z') {
            selectedZ = value;
            updateSelectedButton(group, value);
        }
    };

    const updateSelectedButton = (group, value) => {
        group.querySelectorAll('.input-button').forEach(button => {
            button.classList.remove('selected');
        });
        group.querySelector(`[data-value="${value}"]`).classList.add('selected');
    };

    const handleSubmit = () => {
        if (selectedX !== null && selectedZ !== null) {
            if (stateMachine.hasTransition(line.start, selectedX)) {
                removeExistingTransition(line.start, selectedX);
            }
            finalizeLine(line, selectedX, selectedZ);
            document.body.removeChild(overlay);
            isPopupOpen = false;
        } else {
            alert("입력값과 출력값 모두 선택해야 합니다.");
        }
    };

    popup.querySelectorAll('.input-button').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    submit.addEventListener('click', handleSubmit);
}


  function removeExistingTransition(stateId, x) {
    const svg = document.querySelector(`svg[data-start="${stateId}"][data-x="${x}"]`);
    const label = document.querySelector(`.line-label[data-start="${stateId}"][data-x="${x}"]`);
    
    if (svg) svg.remove();
    if (label) label.remove();
    
    stateMachine.removeTransition(stateId, x);
  }

  // 선 완성 처리
  function finalizeLine(line, x, z) {
    const path = drawFinalLine(line, x);
    const label = createTransitionLabel(line, x, z);
    
    path.parentElement.dataset.start = line.start;
    path.parentElement.dataset.end = line.end;
    path.parentElement.dataset.x = x;
    
    stateMachine.addTransition(line.start, x, line.end, z);
    
    currentLine = null;
    canvas.style.cursor = "default";
  }

  function drawFinalLine(line, x) {
    const startState = document.getElementById(line.start);
    const endState = document.getElementById(line.end);
    
    if (!startState || !endState) return line.element;
    
    const isSelfLoop = line.start === line.end;
    const points = isSelfLoop 
      ? calculateSelfLoopPoints(startState, x)
      : calculateNormalLinePoints(startState, endState, x, line.start > line.end);
    
    line.element.setAttribute("d",
      `M ${points.startPoint.x} ${points.startPoint.y} Q ${points.controlPoint.x} ${points.controlPoint.y} ${points.endPoint.x} ${points.endPoint.y}`
    );
    
    return line.element;
  }

  function getStateElements(line) {
    return {
      startState: document.getElementById(line.start),
      endState: document.getElementById(line.end)
    };
  }

  function calculateLinePoints(startState, endState, x) {
    const startRect = startState.getBoundingClientRect();
    const endRect = endState.getBoundingClientRect();
    
    if (startState.id === endState.id) {
      return calculateSelfLoopPoints(startRect, x);
    }
    
    return calculateNormalLinePoints(startRect, endRect, x, startState.id > endState.id);
  }

  function calculateSelfLoopPoints(state, x) {
    const rect = state.getBoundingClientRect();
    const radius = rect.width/2;
    const direction = x === "0" ? -1 : 1;
    
    return {
      startPoint: {
        x: rect.left + rect.width/2 + (radius * 0.8 * direction),
        y: rect.top + radius * 0.5
      },
      endPoint: {
        x: rect.left + rect.width/2 + (radius * 0.8 * direction),
        y: rect.top + rect.height - radius * 0.5
      },
      controlPoint: {
        x: rect.left + rect.width/2 + (radius * 3 * direction),
        y: rect.top
      }
    };
  }

  function calculateNormalLinePoints(startState, endState, x, isReversed) {
    const startRect = startState.getBoundingClientRect();
    const endRect = endState.getBoundingClientRect();
    const startPoint = {
      x: startRect.left + startRect.width/2,
      y: startRect.top + startRect.height/2
    };
    const endPoint = {
      x: endRect.left + endRect.width/2,
      y: endRect.top + endRect.height/2
    };
    
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    
    let curvature = 0.2;
    if (x === "0") curvature *= -1;
    if (isReversed) curvature *= BIG_CURVERTURE;
    
    const controlPoint = {
      x: (startPoint.x + endPoint.x)/2 - dy * curvature,
      y: (startPoint.y + endPoint.y)/2 + dx * curvature
    };
    
    // 원 위의 점으로 조정
    const radius = startRect.width/2;
    const angles = calculateAngles(startPoint, endPoint, controlPoint);
    
    return {
      startPoint: {
        x: startPoint.x + radius * Math.cos(angles.start),
        y: startPoint.y + radius * Math.sin(angles.start)
      },
      endPoint: {
        x: endPoint.x - radius * Math.cos(angles.end),
        y: endPoint.y - radius * Math.sin(angles.end)
      },
      controlPoint
    };
  }

  function calculateAngles(start, end, control) {
    return {
      start: Math.atan2(control.y - start.y, control.x - start.x),
      end: Math.atan2(end.y - control.y, end.x - control.x)
    };
  }

  function createTransitionLabel(line, x, z) {
    const startState = document.getElementById(line.start);
    const endState = document.getElementById(line.end);
    
    if (!startState || !endState) return null;
    
    const isSelfLoop = line.start === line.end;
    const points = isSelfLoop 
      ? calculateSelfLoopPoints(startState, x)
      : calculateNormalLinePoints(startState, endState, x, line.start > line.end);
    
    const t = 0.5;  // 베지어 곡선의 중간점
    const labelX = (1-t)*(1-t)*points.startPoint.x + 2*(1-t)*t*points.controlPoint.x + t*t*points.endPoint.x;
    const labelY = (1-t)*(1-t)*points.startPoint.y + 2*(1-t)*t*points.controlPoint.y + t*t*points.endPoint.y;
    
    const label = document.createElement("div");
    label.className = "line-label";
    label.textContent = `${x}/${z}`;
    label.style.left = `${labelX}px`;
    label.style.top = `${labelY}px`;
    label.dataset.start = line.start;
    label.dataset.x = x;
    canvas.appendChild(label);
    
    return label;
  }

  // 연결된 선 업데이트
  function updateConnectedLines(stateId) {
    const outgoingLines = document.querySelectorAll(`svg[data-start="${stateId}"]`);
    const incomingLines = document.querySelectorAll(`svg[data-end="${stateId}"]`);
    
    outgoingLines.forEach(svg => {
      const line = {
        start: svg.dataset.start,
        end: svg.dataset.end,
        element: svg.querySelector('path'),
        markerId: svg.querySelector('marker').id,
        svg: svg
      };
      const x = svg.dataset.x;
      
      // 라벨 제거
      const label = document.querySelector(`.line-label[data-start="${stateId}"][data-x="${x}"]`);
      if (label) label.remove();
      
      // 선 재그리기
      drawFinalLine(line, x);
      
      // 라벨 재생성
      const newLabel = createTransitionLabel(line, x, 
        stateMachine.transitions[stateId.replace('state-', '')][x].output
      );
    });
    
    incomingLines.forEach(svg => {
      const line = {
        start: svg.dataset.start,
        end: svg.dataset.end,
        element: svg.querySelector('path'),
        markerId: svg.querySelector('marker').id,
        svg: svg
      };
      const x = svg.dataset.x;
      
      // 라벨 제거
      const label = document.querySelector(
        `.line-label[data-start="${line.start}"][data-x="${x}"]`
      );
      if (label) label.remove();
      
      // 선 재그리기
      drawFinalLine(line, x);
      
      // 라벨 재생성
      const fromState = line.start.replace('state-', '');
      const newLabel = createTransitionLabel(line, x, 
        stateMachine.transitions[fromState][x].output
      );
    });
  }
});





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
 * 6. 실시간 검증 함수
 *    - 모든 칸이 채워져 있으면 X를 만들고 isEquivalent 호출
 *    - 아니면 result=unknown
 *****************************************************/
function validateAndCheckEquivalence(X, problemId) {

  const P_or_Q = problemId === 1 ? P : Q;
  const isEq = isEquivalent(P_or_Q, X);
  return calculateScore(isEq, P_or_Q, X);
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
