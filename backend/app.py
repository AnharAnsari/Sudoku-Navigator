from flask import Flask, request, jsonify
from flask_cors import CORS
from solver import get_all_solutions

app = Flask(__name__)
CORS(app)


@app.route("/solve", methods=["POST"])
def solve():
    data = request.json
    board = data.get("grid")

    if not board or not isinstance(board, list):
        return jsonify({"error": "Invalid input"}), 400

    size = len(board)

    # Validate square grid
    if any(len(row) != size for row in board):
        return jsonify({"error": "Grid must be square"}), 400

    solutions = get_all_solutions(board)

    if not solutions:
        return jsonify({
            "solutions": [],
            "count": 0,
            "message": "No solution exists for this Sudoku."
        })

    return jsonify({
        "solutions": solutions,
        "count": len(solutions)
    })


if __name__ == "__main__":
    app.run(debug=True)
