const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");

const pieces = {
  r:"♜", n:"♞", b:"♝", q:"♛", k:"♚", p:"♟",
  R:"♖", N:"♘", B:"♗", Q:"♕", K:"♔", P:"♙"
};

let board, turn, selected, history;

const isWhite = p => p === p.toUpperCase();
const enemy = (p, t) => p !== "." && (t === "white" ? p === p.toLowerCase() : p === p.toUpperCase());

function resetGame() {
  board = [
    "rnbqkbnr",
    "pppppppp",
    "........",
    "........",
    "........",
    "........",
    "PPPPPPPP",
    "RNBQKBNR"
  ];
  turn = "white";
  selected = null;
  history = [];
  draw();
}

function draw() {
  boardEl.innerHTML = "";
  board.forEach((row, r) => {
    [...row].forEach((p, c) => {
      const sq = document.createElement("div");
      sq.className = `square ${(r+c)%2 ? "dark" : "light"}`;
      if (p !== ".") sq.textContent = pieces[p];
      if (selected && selected.r === r && selected.c === c) sq.classList.add("selected");
      sq.onclick = () => click(r, c);
      boardEl.appendChild(sq);
    });
  });
  statusEl.textContent = `Turn: ${turn}`;
}

function click(r, c) {
  if (selected) {
    if (legal(selected.r, selected.c, r, c)) {
      move(selected.r, selected.c, r, c);
      selected = null;
      draw();
      setTimeout(aiMove, 300);
      return;
    }
    selected = null;
  }
  const p = board[r][c];
  if (p === "." || (turn === "white" && !isWhite(p)) || (turn === "black" && isWhite(p))) return;
  selected = { r, c };
}

function move(sr, sc, tr, tc) {
  history.push(JSON.parse(JSON.stringify(board)));
  let b = board.map(r => r.split(""));
  b[tr][tc] = b[sr][sc];
  b[sr][sc] = ".";
  if (b[tr][tc] === "P" && tr === 0) b[tr][tc] = "Q";
  if (b[tr][tc] === "p" && tr === 7) b[tr][tc] = "q";
  board = b.map(r => r.join(""));
  turn = turn === "white" ? "black" : "white";
}

function undo() {
  if (history.length) {
    board = history.pop();
    turn = turn === "white" ? "black" : "white";
    draw();
  }
}

function legal(r,c,tr,tc) {
  return moves(r,c).some(m => m.r === tr && m.c === tc);
}

function moves(r,c) {
  const p = board[r][c];
  let m = [];
  const d = isWhite(p) ? -1 : 1;

  if (p.toLowerCase() === "p") {
    if (board[r+d]?.[c] === ".") m.push({r:r+d,c});
    [-1,1].forEach(dc => {
      if (enemy(board[r+d]?.[c+dc], turn)) m.push({r:r+d,c:c+dc});
    });
  }

  const slide = {
    r:[[1,0],[-1,0],[0,1],[0,-1]],
    b:[[1,1],[1,-1],[-1,1],[-1,-1]],
    q:[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
  };

  if (slide[p.toLowerCase()]) {
    slide[p.toLowerCase()].forEach(([dr,dc])=>{
      let nr=r+dr,nc=c+dc;
      while(board[nr]?.[nc]){
        if(board[nr][nc]===".") m.push({r:nr,c:nc});
        else { enemy(board[nr][nc],turn)&&m.push({r:nr,c:nc}); break; }
        nr+=dr; nc+=dc;
      }
    });
  }

  if (p.toLowerCase()==="n") {
    [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]
    .forEach(([dr,dc])=>{
      let nr=r+dr,nc=c+dc;
      board[nr]?.[nc] && (board[nr][nc]==="."||enemy(board[nr][nc],turn)) && m.push({r:nr,c:nc});
    });
  }

  if (p.toLowerCase()==="k") {
    for(let dr=-1;dr<=1;dr++)
      for(let dc=-1;dc<=1;dc++)
        if(dr||dc){
          let nr=r+dr,nc=c+dc;
          board[nr]?.[nc] && (board[nr][nc]==="."||enemy(board[nr][nc],turn)) && m.push({r:nr,c:nc});
        }
  }
  return m;
}

function aiMove() {
  if (turn !== "black") return;
  let all=[];
  board.forEach((row,r)=>{
    [...row].forEach((p,c)=>{
      if(p!== "." && !isWhite(p))
        moves(r,c).forEach(m=>all.push({r,c,m}));
    });
  });
  if(!all.length) return;
  const pick = all[Math.floor(Math.random()*all.length)];
  move(pick.r,pick.c,pick.m.r,pick.m.c);
  draw();
}

resetGame();
