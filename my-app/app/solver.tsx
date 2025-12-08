import { Cell } from "./page";
import { Group } from "./page";

export function solve(board: Cell[][], groups: Group[]) {
  if (!backtrack(0, 0, board, groups)) {
    alert("No solution found!");
  }
  console.log("Finished backtracking")
  return board;
}

// ========================================
// BACKTRACK
// ========================================
function backtrack(r: number, c: number, board: Cell[][], groups: Group[]): boolean {
  const N = 8;

  // Finished the whole board
  if (r === N) return true;

  // Compute next cell coordinates
  const nextR = c === N - 1 ? r + 1 : r;
  const nextC = c === N - 1 ? 0 : c + 1;

  // Try placing numbers 1–8
  for (let value = 1; value <= N; value++) {

    if (!rowOK(board, r, value)) continue;
    if (!colOK(board, c, value)) continue;

    // tentatively place
    board[r][c].bigNumber = value;

    // check group only if the group is fully filled
    if (groupFullyFilled(r, c, board, groups)) {
      const g = findGroup(r, c, groups);
      if (!checkGroup(g, board)) {
        board[r][c].bigNumber = undefined;
        continue;
      }
    }

    // recurse
    if (backtrack(nextR, nextC, board, groups)) return true;

    // undo
    board[r][c].bigNumber = undefined;
  }

  return false; 
}

// ========================================
// ROW / COLUMN CONSTRAINTS
// ========================================
function rowOK(board: Cell[][], r: number, val: number): boolean {
  for (let c = 0; c < 8; c++) {
    if (board[r][c].bigNumber === val) return false;
  }
  return true;
}

function colOK(board: Cell[][], c: number, val: number): boolean {
  for (let r = 0; r < 8; r++) {
    if (board[r][c].bigNumber === val) return false;
  }
  return true;
}

// ========================================
// GROUP HELPERS
// ========================================
function findGroup(r: number, c: number, groups: Group[]): Group {
  return groups.find(g => g.cells.some(cell => cell.row === r && cell.col === c))!;
}

function groupFullyFilled(r: number, c: number, board: Cell[][], groups: Group[]): boolean {
  const group = findGroup(r, c, groups);
  if (!group) return false;
  return group.cells.every(cell => board[cell.row][cell.col].bigNumber !== undefined);
}

// ========================================
// GROUP CHECKING
// ========================================
function checkGroup(group: Group, board: Cell[][]): boolean {
  const operation = group.operation; // "+", "-", "x", "÷"
  const target = group.target;

  const nums = group.cells.map(cell => board[cell.row][cell.col].bigNumber!);

  switch (operation) {

    case "+":
      return nums.reduce((a, b) => a + b, 0) === target;

    case "x":
      return nums.reduce((a, b) => a * b, 1) === target;

    case "-":
      // Any order allowed → check all permutations
      return anyPermutation(nums, arr => arr.reduce((a, b) => a - b) === target);

    case "÷":
  return anyPermutation(nums, arr => {
    let result = arr[0];

    for (let i = 1; i < arr.length; i++) {
      const next = arr[i];

      // Division must produce an integer at every step
      if (result % next !== 0) return false;

      result = result / next;
    }

    return result === target;
  });

    case "Static":
        return nums.length === 1 && nums[0] === target;

    default:
      return false;
  }
}

// ========================================
// PERMUTATION CHECK
// (Used for "-" and "÷" cages because order matters)
// ========================================
function anyPermutation(arr: number[], test: (perm: number[]) => boolean): boolean {
  const used = Array(arr.length).fill(false);
  const perm: number[] = [];

  function dfs() {
    if (perm.length === arr.length) {
      if (test(perm)) return true;
      return false;
    }

    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      perm.push(arr[i]);

      if (dfs()) return true;

      used[i] = false;
      perm.pop();
    }
    return false;
  }

  return dfs();
}
