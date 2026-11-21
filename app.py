from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.get_json(silent=True) or {}

    try:
        num1 = float(data.get("num1"))
        num2 = float(data.get("num2"))
        operator = data.get("operator")
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid numbers"}), 400

    if operator == "+":
        result = num1 + num2
    elif operator == "-":
        result = num1 - num2
    elif operator == "*":
        result = num1 * num2
    elif operator == "/":
        if num2 == 0:
            return jsonify({"error": "Cannot divide by zero"}), 400
        result = num1 / num2
    else:
        return jsonify({"error": "Unsupported operator"}), 400

    result = round(result, 10)
    if result == 0:
        result = 0
    elif result.is_integer():
        result = int(result)

    return jsonify({"result": str(result)})


if __name__ == "__main__":
    app.run(debug=True)