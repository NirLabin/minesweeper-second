'use strict';
const MINE = '💣 ';

const SUCESS = `😎`;
const FAIL = `🤯`;
const START = `😃`;

const COLOR_UNCLICKED = '#333';
const gLives = ['❤️', '❤️', '❤️'];

var elDisplayTime = document.querySelector('.display span');
var elBoard = document.querySelector('.board');
var elSmiley = document.querySelector('.restart');
var elLife = document.querySelector('.life');
var elBody = document.querySelector('body');
var elBtns = document.querySelector('.btns');

var gBoard;
var gEmptyPositions;
var gBombsPos;
var choosenSize;
var gInterval;

var gLevels = {
  beginner: {
    SIZE: 4,
    MINES: 3,
  },
  medium: {
    SIZE: 8,
    MINES: 12,
  },
  expert: {
    SIZE: 12,
    MINES: 30,
  },
};

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};

function initGame() {
  gBoard = createBoard(gLevels.beginner.SIZE, gLevels.beginner.SIZE);
}

function buildBoard() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      if (gBoard[i][j].isMine) continue;
      gBoard[i][j].minesAroundCount = countMinesNeighbor(gBoard, i, j);
    }
  }
}
function setMinesNegsCount(size) {
  var bombPosition = [];
  for (var i = 0; i < size.MINES; i++) {
    var currIdx = getRandomInt(gEmptyPositions.length - 1, 0);
    var availablePos = gEmptyPositions[currIdx];
    bombPosition.push(availablePos);
    gBoard[availablePos.i][availablePos.j].isMine = true;
    gEmptyPositions.splice(currIdx, 1);
  }
  return bombPosition;
}

function renderBoard(board) {
  elBoard.innerHTML = '';
  var strHtml = '';
  for (var i = 0; i < board.length; i++) {
    strHtml += '<tr>';
    for (var j = 0; j < board.length; j++) {
      strHtml += `<td id="cell-${i}-${j}" class="unclicked"
       onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,event,${i},${j})">${
        gBoard[i][j].isMine
          ? MINE
          : gBoard[i][j].minesAroundCount
          ? gBoard[i][j].minesAroundCount
          : ' '
      }
      </td>`;
    }

    strHtml += '</tr>';
  }
  elBoard.innerHTML = strHtml;
}

function emptyPositions(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      if (gBoard[i][j].isMine) continue;
      board.push({ i, j });
    }
  }
  return board;
}
function cellClicked(elCell, i, j) {
  if (!gGame.isOn && !gGame.shownCount) {
    gBoard[i][j].isMine = true;
    gEmptyPositions = emptyPositions(choosenSize.SIZE);
    gBoard[i][j].isMine = false;
    gBombsPos = setMinesNegsCount(choosenSize);
    buildBoard();
    renderBoard(gBoard);
    gGame.isOn = true;

    timer(new Date());
  }
  var cell = gBoard[i][j];
  if (cell.isShown || cell.isMarked || !gGame.isOn) return;

  elCell.classList.remove('unclicked');

  if (cell.isMine) {
    elSmiley.innerText = FAIL;
    gGame.shownCount++;
    gLives.pop();
    elLife.innerText = gLives.join(' ');
    cell.isShown = true;
    if (!gLives.length) Gameover();
  } else {
    expandShown(i, j);
    elSmiley.innerText = START;
  }
  isWin();
}

function cellMarked(elCell, event, i, j) {
  event.preventDefault();

  var cell = gBoard[i][j];
  if (cell.isShown || !gGame.isOn) return;
  cell.isMarked = cell.isMarked ? false : true;

  var coords = { i, j };

  elCell.style.backgroundColor = cell.isMarked ? 'red' : COLOR_UNCLICKED;
  if (cell.isMarked && cell.isMine) gGame.markedCount++;
  else gGame.markedCount--;
  if (gGame.markedCount === choosenSize.MINES) {
    win();
  }
}

function expandShown(row, col) {
  for (var i = row - 1; i <= row + 1 && i < gBoard.length; i++) {
    if (i < 0) continue;
    for (var j = col - 1; j <= col + 1 && j < gBoard.length; j++) {
      if (
        j < 0 ||
        gBoard[i][j].isMine ||
        gBoard[i][j].isShown ||
        gBoard[i][j].isMarked
      )
        continue;
      var id = getSelector({ i, j });
      document.querySelector(id).classList.remove('unclicked');
      gBoard[i][j].isShown = true;
      gGame.shownCount++;
    }
  }
}

function sizeChoose(elBtn) {
  choosenSize = gLevels[elBtn.innerText.toLowerCase()];
  gBoard = createBoard(choosenSize.SIZE, choosenSize.SIZE);
  renderBoard(gBoard);
  elBtns.classList.add('hidden');
}

function Gameover() {
  clearInterval(gInterval);
  gGame.isOn = false;
  for (var i = 0; i < gBombsPos.length; i++) {
    document
      .querySelector(getSelector(gBombsPos[i]))
      .classList.remove('unclicked');
  }
}

function isWin() {
  if (gGame.shownCount >= choosenSize.SIZE ** 2 - choosenSize.MINES) {
    win();
    return true;
  }
  return false;
}
function win() {
  elSmiley.innerText = SUCESS;
  clearInterval(gInterval);
  gGame.isOn = false;
}
function restartGame(elBtn) {
  elBtns.classList.remove('hidden');

  location.reload();
}
