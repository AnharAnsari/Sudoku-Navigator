const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const solutionCounter = document.getElementById("solutionCounter");

let originalCells = [];
let solutions = [];
let currentSolutionIndex = 0;

const gridSizeSelect = document.getElementById("gridSize");
const sudokuContainer = document.getElementById("sudokuContainer");
const solveBtn = document.getElementById("solveBtn");

gridSizeSelect.addEventListener("change", () => {
    const size = parseInt(gridSizeSelect.value);
    sudokuContainer.innerHTML = "";
    solveBtn.disabled = true;

    if (!size) return;

    createGrid(size);
    solveBtn.disabled = false;
});

function createGrid(size) {
    sudokuContainer.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    sudokuContainer.className = "sudoku-grid";

    const subGridSize = Math.sqrt(size);

    for (let i = 0; i < size * size; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 2;
        input.classList.add("cell");
        input.dataset.original = "false";

        input.addEventListener("input", () => {
            validateInput(input, size);
        });

        const row = Math.floor(i / size);
        const col = i % size;

        if (col % subGridSize === 0) input.style.borderLeft = "2px solid black";
        if (row % subGridSize === 0) input.style.borderTop = "2px solid black";
        if (col === size - 1) input.style.borderRight = "2px solid black";
        if (row === size - 1) input.style.borderBottom = "2px solid black";

        sudokuContainer.appendChild(input);
    }
}

function validateInput(input, size) {
    const value = input.value.toUpperCase();

    if (size === 16) {
        if (!/^[1-9A-G]$/.test(value)) {
            input.value = "";
        } else {
            input.value = value;
        }
    } else {
        if (!/^[1-9]$/.test(value) || parseInt(value) > size) {
            input.value = "";
        }
    }
}

solveBtn.addEventListener("click", () => {
    console.log("Solve clicked"); // 🔍 debug confirmation

    const size = parseInt(gridSizeSelect.value);
    const gridData = getGridData(size);

    // ✅ SAFETY CHECK (very important)
    if (!gridData || gridData.length === 0) {
        alert("Grid is empty or invalid");
        return;
    }

    fetch("http://127.0.0.1:5000/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grid: gridData })
    })
    .then(res => res.json())
    .then(data => handleSolutions(data))
    .catch(err => {
        alert("Backend error!");
        console.error(err);
    });
});

function getGridData(size) {
    const inputs = document.querySelectorAll(".cell");
    let grid = [];
    originalCells = [];

    for (let i = 0; i < size; i++) {
        let row = [];
        let originalRow = [];

        for (let j = 0; j < size; j++) {
            const cell = inputs[i * size + j];
            const value = cell.value;

            if (value === "") {
                row.push(0);
                originalRow.push(false);
                cell.dataset.original = "false";
            } else {
                row.push(convertToNumber(value));
                originalRow.push(true);
                cell.dataset.original = "true";
                cell.style.color = "red";
                cell.disabled = true;
            }
        }

        grid.push(row);
        originalCells.push(originalRow);
    }

    return grid;
}

function convertToNumber(value) {
    if (isNaN(value)) return value.charCodeAt(0) - 55;
    return parseInt(value);
}

function convertToDisplay(value, size) {
    if (size === 16 && value > 9) {
        return String.fromCharCode(value + 55);
    }
    return value;
}

function handleSolutions(data) {
    if (data.count === 0) {
        alert(data.message);
        return;
    }

    solutions = data.solutions;
    currentSolutionIndex = 0;

    displaySolution(0);
    updateNavigation();

    alert(`There are ${data.count} possible solutions!`);
}

function displaySolution(index) {
    const size = parseInt(gridSizeSelect.value);
    const inputs = document.querySelectorAll(".cell");
    const solution = solutions[index];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = inputs[i * size + j];
            if (cell.dataset.original === "false") {
                cell.value = convertToDisplay(solution[i][j], size);
                cell.style.color = "blue";
            }
        }
    }
}

prevBtn.addEventListener("click", () => {
    if (currentSolutionIndex > 0) {
        currentSolutionIndex--;
        displaySolution(currentSolutionIndex);
        updateNavigation();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentSolutionIndex < solutions.length - 1) {
        currentSolutionIndex++;
        displaySolution(currentSolutionIndex);
        updateNavigation();
    }
});

function updateNavigation() {
    solutionCounter.textContent = `Solution ${currentSolutionIndex + 1} of ${solutions.length}`;
    prevBtn.disabled = currentSolutionIndex === 0;
    nextBtn.disabled = currentSolutionIndex === solutions.length - 1;
}
