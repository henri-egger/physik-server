from flask import Flask, request

app = Flask(__name__)

@app.route('/post', methods=['POST'])
def post_data():
    data = request.json
    return {"received": data}, 200

@app.route('/get', methods=['GET'])
def get_data():
    return {"message": "This is a secure message"}, 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Running on the default Flask server for development
