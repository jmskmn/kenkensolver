"use client";

import React, { useState } from "react";
import { solve } from "./solver"; // or the correct path

export type Cell = {
  row: number;
  col: number;
  background: string;
  bigNumber?: number;
  smallLabel?: string;
  groupId?: number;
};

export type Group = {
  id: number;
  operation: string;
  target: number;
  cells: { row: number; col: number }[];
};

const initialGrid: Cell[][] = Array.from({ length: 8 }, (_, r) =>
  Array.from({ length: 8 }, (_, c) => ({
    row: r,
    col: c,
    background: "white",
  }))
);

export default function HomePage() {
  const [grid, setGrid] = useState<Cell[][]>(initialGrid);

  // group selection state
  const [mode, setMode] = useState<"idle" | "select">("idle");
  const [operation, setOperation] = useState("x");
  const [target, setTarget] = useState<number>(1);
  const [currentGroupCells, setCurrentGroupCells] = useState<
    { row: number; col: number }[]
  >([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // clicking a cell
  function handleCellClick(row: number, col: number) {
    if (mode === "select") {
      // avoid duplicates
      const exists = currentGroupCells.some(
        (c) => c.row === row && c.col === col
      );
      if (!exists) {
        setCurrentGroupCells((prev) => [...prev, { row, col }]);
      }
    }
  }


  function runSolver() {
    // Make deep copy so solver doesn’t mutate React state directly
    const boardCopy = grid.map(row =>
      row.map(cell => ({ ...cell }))
    );

    // Run the solver
    solve(boardCopy, groups);

    // Update UI with solved grid
    setGrid(boardCopy);
  }




  // finalize select mode
  function finalizeGroup() {
    if (currentGroupCells.length === 0) return;

    const newId = groups.length;
    const newGroup: Group = {
      id: newId,
      operation,
      target,
      cells: currentGroupCells,
    };

    setGroups((prev) => [...prev, newGroup]);

    // update grid cells to show group label
    setGrid((old) =>
      old.map((rowArr) =>
        rowArr.map((cell) => {
          const inGroup = currentGroupCells.some(
            (g) => g.row === cell.row && g.col === cell.col
          );

          if (inGroup) {
            return {
              ...cell,
              groupId: newId,
              smallLabel: `${operation}${target}`,
              background: "#f0f0f0",
            };
          }
          return cell;
        })
      )
    );

    setCurrentGroupCells([]);
    setMode("idle");
  }

  // clear selection mode (not groups)
  function clearSelection() {
  setMode("idle");
  setCurrentGroupCells([]);
  setGroups([]);          // clears all groups
  setGrid(initialGrid); // or however you initialize a fresh empty board

}
function clearBig() {
  setGrid(prev =>
    prev.map(row =>
      row.map(cell => ({
        ...cell,
        bigNumber: undefined   // remove only the big number
      }))
    )
  );

  setMode("idle");
  setCurrentGroupCells([]);
  // ❗ Do NOT clear groups — the group structure stays the same.
}

  // render a single cell box
  function renderCell(cell: Cell) {
    const isSelected = currentGroupCells.some(
      (c) => c.row === cell.row && c.col === cell.col
    );

    return (
      <div
        key={`${cell.row}-${cell.col}`}
        onClick={() => handleCellClick(cell.row, cell.col)}
        className="relative border w-12 h-12 flex items-center justify-center cursor-pointer select-none"
        style={{
          backgroundColor: isSelected
            ? "#d0e8ff"
            : cell.background,
        }}
      >
        {/* small top-left label */}
        {cell.smallLabel && (
          <div className="absolute top-0 left-1 text-[10px]">
            {cell.smallLabel}
          </div>
        )}

        {/* centered big number */}
        {cell.bigNumber && (
          <div className="text-lg font-bold">{cell.bigNumber}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen">

      {/* LEFT SIDE: Grid + controls */}
      <div className="flex flex-col w-2/3 border-r">

        {/* GRID */}
        <div className="p-4">
          <div className="inline-block">
          <div className="grid grid-cols-8 grid-rows-8 gap-0">
            {grid.flat().map((cell) => renderCell(cell))}
          </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="p-4 border-t flex gap-4 items-end">

          {/* SELECT */}
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={() => setMode("select")}
          >
            Select
          </button>

          {/* DONE */}
          <button
            className="px-4 py-2 rounded bg-green-600 text-white"
            onClick={finalizeGroup}
          >
            Done
          </button>


          {/* SOLVE */}
          <button
            className="px-4 py-2 rounded bg-purple-600 text-white"
            onClick={runSolver}
          >
              Solve
          </button>



          {/* CLEAR */}
          <button
            className="px-4 py-2 rounded bg-red-600 text-white"
            onClick={clearSelection}
          >
            Clear
          </button>


          <button
            className="px-4 py-2 rounded bg-red-600 text-white"
            onClick={clearBig}
          >
            Clear Nums
          </button>


          {/* operation dropdown */}
          <div className="flex flex-col">
            <label className="text-sm">Operation</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="border p-1"
            >
              <option value="Static">Static</option>
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="x">×</option>
              <option value="/">÷</option>
            </select>
          </div>

          {/* number input */}
          <div className="flex flex-col">
            <label className="text-sm">Target</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="border p-1 w-20"
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Instructions */}
      <div className="w-1/3 p-6">
        <h2 className="text-xl font-semibold mb-4">
          KenKen Builder Instructions
        </h2>

        <p className="leading-7 text-sm">
          1. Click select to start creating a grouping. <br />
          2. Choose an operation (+, -, ×, ÷, or Static). <br />
          3. Enter the target number. <br />
          4. Click the cells that belong to the group. <br />
          5. Press Done to finalize the cage. <br />
          6. Press Clear to cancel selecting. <br />
          7. Press Solve to run algorithm to find a solution. <br />
          <br />
          Selected cells show a light blue highlight while selecting.
          <br />
          
        </p>
      </div>
    </div>
  );
}
