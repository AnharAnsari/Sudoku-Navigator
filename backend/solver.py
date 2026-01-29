import copy

def is_safe(board, row, col, num, size):
    subgrid_size = int(size ** 0.5)

    # Check row
    if num in board[row]:
        return False

    # Check column
    for i in range(size):
        if board[i][col] == num:
            return False

    # Check subgrid
    start_row = (row // subgrid_size) * subgrid_size
    start_col = (col // subgrid_size) * subgrid_size

    for i in range(start_row, start_row + subgrid_size):
        for j in range(start_col, start_col + subgrid_size):
            if board[i][j] == num:
                return False

    return True


def find_empty(board, size):
    for i in range(size):
        for j in range(size):
            if board[i][j] == 0:
                return i, j
    return None


def solve_all(board, size, solutions):
    empty = find_empty(board, size)

    if not empty:
        solutions.append(copy.deepcopy(board))
        return

    row, col = empty

    for num in range(1, size + 1):
        if is_safe(board, row, col, num, size):
            board[row][col] = num
            solve_all(board, size, solutions)
            board[row][col] = 0


def get_all_solutions(board):
    size = len(board)

    # Validate values
    for i in range(size):
        for j in range(size):
            if board[i][j] < 0 or board[i][j] > size:
                return []

    solutions = []
    solve_all(board, size, solutions)
    return solutions
