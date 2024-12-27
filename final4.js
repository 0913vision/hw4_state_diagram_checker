const testCases =[
  // 패턴이 없는 경우
  { input: [0, 0, 0, 0, 0, 0], expectedOutput: '000000' },
  { input: [1, 1, 0, 0, 0, 0], expectedOutput: '000000' },

  // 부분 패턴 섞임
  { input: [1, 0, 1, 0, 0, 1, 1, 0], expectedOutput: '00111111' },
  { input: [1, 0, 1, 1, 0, 1, 0], expectedOutput: '0011111' },

  // 패턴이 끊어진 경우
  { input: [1, 0, 1, 0, 1], expectedOutput: '00111' },
  { input: [1, 1, 0, 1, 1, 1], expectedOutput: '000110' },

  // `101`이 후반에 발생
  { input: [0, 0, 0, 0, 1, 0, 1], expectedOutput: '0000001' },
  { input: [1, 1, 1, 1, 1, 0, 1, 0, 1], expectedOutput: '000000111' },

  // `111`이 후반에 발생
  { input: [0, 0, 0, 0, 1, 1, 1], expectedOutput: '0000000' },
  { input: [1, 0, 1, 0, 1, 1, 1], expectedOutput: '0011110' },

  // 교차된 연속 패턴
  { input: [1, 0, 1, 1, 1, 0, 1, 1, 1], expectedOutput: '001100110' },
  { input: [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1], expectedOutput: '00110011110' },

  // 긴 입력
  { input: [1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1], expectedOutput: '00110000011001111' },
  { input: [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1], expectedOutput: '0011111001100111' },

  // 끝부분에서 `101` 발생
  { input: [1, 0, 1, 1, 1, 0, 0, 1, 0, 1], expectedOutput: '0011000001' },

  // 끝부분에서 `111` 발생
  { input: [1, 1, 1, 0, 1, 0, 1, 1, 1], expectedOutput: '000011110' },

  // 연속된 `101`
  { input: [1, 0, 1, 0, 1, 0, 1], expectedOutput: '0011111' },
  { input: [1, 0, 1, 1, 0, 1, 0, 1], expectedOutput: '00111111' },

  // 연속된 `111`
  { input: [1, 1, 1, 1, 1, 1], expectedOutput: '000000' },
  { input: [1, 1, 1, 0, 1, 1, 1], expectedOutput: '0000110' },

  // 중간 길이
  { input: [0, 0, 1, 0, 0, 0, 1, 0, 1, 1], expectedOutput: '0000000011' }, // 끊어진 101 뒤에 111
  { input: [0, 1, 1, 0, 1, 0, 1, 0, 0, 1], expectedOutput: '0000111111' }, // 교차된 111과 101
  { input: [0, 0, 0, 1, 0, 1, 1, 1, 0, 0], expectedOutput: '0000011000' }, // 긴 0 뒤 섞인 패턴

  // 긴 입력
  { input: [0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0], expectedOutput: '00000001111111000' }, // 혼합된 101과 111
  { input: [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1], expectedOutput: '000011111110011111' }, // 복잡한 끊김
  { input: [0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1], expectedOutput: '00000111100000000' }, // 연속된 101 뒤 111
  { input: [0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1], expectedOutput: '000000001100111111' }, // 교차된 긴 패턴

  // 초기 긴 0 뒤늦게 패턴 등장
  { input: [0, 0, 0, 0, 0, 1, 0, 1], expectedOutput: '00000001' },
  { input: [0, 0, 0, 1, 1, 1], expectedOutput: '000000' },

  // 연속된 101 패턴 사이에 111 끼어듦
  { input: [1, 0, 1, 1, 1, 0, 1, 0, 1], expectedOutput: '001100111' },

  // 끝부분에서 복잡한 끊김
  { input: [1, 0, 1, 1, 1, 0, 0, 1], expectedOutput: '00110000' },
  { input: [0, 1, 1, 1, 0, 0], expectedOutput: '000000' },
]

const BIG_CURVERTURE = 3;
const stateMachine = {
  transitions: {}, // 초기 상태: 트랜지션 없음
  
  addState(state) {
    if (!this.transitions[state]) {
      this.transitions[state] = { 0: null, 1: null }; // 각 입력값에 대해 초기화
    } else {
      console.warn(`State ${state} already exists.`);
    }
    this.checkCompletion();
  },

  // 상태 전이 추가
  addTransition(fromState, input, nextState, output) {
    if (!this.transitions[fromState]) {
      this.addState(fromState); // 상태가 없으면 추가
    }
    if (!this.transitions[nextState]) {
      this.addState(nextState); // 다음 상태도 없으면 추가
    }
    this.transitions[fromState][input] = {
      next: nextState,
      output: parseInt(output)
    };
    this.checkCompletion();
  },
  
  // 상태 전이 제거
  removeTransition(fromState, input) {
    if (this.transitions[fromState]) {
      this.transitions[fromState][input] = null;
      this.checkCompletion();
    }
  },
  
  // 전이 존재 여부 확인
  hasTransition(fromState, input) {
    return (
      this.transitions[fromState] &&
      this.transitions[fromState][input] !== null
    );
  },
  
  // 상태 머신이 완성되었는지 확인
  isComplete() {
    return Object.entries(this.transitions).every(([state, transitions]) => {
      return [0, 1].every(input => 
        transitions[input] !== null
      );
    });
  },
  
  // 미완성된 전이 목록
  getMissingTransitions() {
    const missing = [];
    Object.entries(this.transitions).forEach(([state, transitions]) => {
      [0, 1].forEach(input => {
        if (!transitions || transitions[input] === null) {
          missing.push({ state, input });
        }
      });
    });
    return missing;
  },
  
  // 완료 상태 체크
  checkCompletion() {
    const isCompleted = this.isComplete();
    const resultDiv = document.querySelector('.result');
    
    if (isCompleted) {
      console.log("상태 머신 완성!", this.transitions);
      const score = validateAndCheckEquivalence(this.transitions, testCases);
      resultDiv.textContent = `${score}점`;
      resultDiv.style.backgroundColor = '#003300';
      resultDiv.style.color = '#00ff00';
      return true;
    } else {
      console.log("미완성 전이:", this.getMissingTransitions());
      resultDiv.textContent = 'Unknown';
      resultDiv.style.backgroundColor = '#330000';
      resultDiv.style.color = '#ff0000';
      return false;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  
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
      if ((key >= "A" && key <= "J") || key === "S") {
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
    if (!["A", "B", "C", "D", "E", "F", "G", "H","I", "J","S"].includes(key)) return;

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
    stateMachine.addState(stateId);
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
 *    실시간 검증 함수
 *    - 모든 칸이 채워져 있으면 X를 만들고 isEquivalent 호출
 *    - 아니면 result=unknown
 *****************************************************/
function validateAndCheckEquivalence(X, testCases) {

  const startState = 'state-A'; // 항상 'A'에서 시작
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
  const score = (matchedCases / totalCases) * 10;
  return Math.round(score * 100) / 100; // 소수 둘째 자리 반올림
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