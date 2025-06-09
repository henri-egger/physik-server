from flask import Flask, request
import logging
import mod.file_api as api
from datetime import datetime
from hashlib import sha256

logging.basicConfig(
    filename="data/api.log",
    format="%(asctime)s %(levelname)s : %(message)s",
    level=logging.DEBUG,
)
app = Flask(__name__)


@app.route("/post", methods=["POST"])
def postData():
    data = request.json

    verifiedData = api.verifyData(app.logger, data)
    if type(verifiedData) is str:
        app.logger.warning(verifiedData)
        return verifiedData, 400

    elif type(verifiedData) is float:
        if not api.storeData(verifiedData):
            app.logger.error("Could not store data")
            return "Could not store data", 500

        return "Data stored successfully", 200

    return "what?", 500


@app.route("/get", methods=["GET"])
def getAllData():
    data = api.readDataAll(app.logger)
    return data, 200


@app.route("/get/latest/<int:number>", methods=["GET"])
def getLatestData(number: int):
    data = api.readData(app.logger)

    if len(data["entries"]) > number:
        data["entries"] = data["entries"][len(data["entries"]) - number : :]

    return data, 200


@app.route("/get/query-date/<string:date>", methods=["GET"])
def getSingleDateData(date):
    date = date.replace(".", "-")
    timestamp = datetime.fromisoformat(date).timestamp()
    data = api.readData(app.logger, timestamp)
    data["entries"] = list(filter(lambda e: date in e["isotime"], data["entries"]))
    return data, 200


@app.route("/get/<startDate>/<endDate>", methods=["GET"])
def getRangeData(startDate, endDate):
    start = datetime.fromisoformat(startDate)
    end = datetime.fromisoformat(endDate).timestamp()

    months = []

    while start.replace(month=start.month + 1).timestamp() < end:
        months.append(start.timestamp())
        start = start.replace(start.month + 1)

    data = api.readDataMulti(app.logger, months)

    # Initialize an empty list to store the filtered values
    filtered_data = []

    # Loop through each dictionary in the data
    for entry in data["entries"]:
        # Check if the timestamp is within the start and end range
        if (
            datetime.fromisoformat(startDate).timestamp()
            <= datetime.fromisoformat(entry["isotime"]).timestamp()
            <= end
        ):
            # If it is, add the height to the filtered list
            filtered_data.append(entry)

    return {"entries": filtered_data}, 200


# @app.route("/logs", methods=["GET"])
# def getLogs():
#     key = request.args.get("key")
#     if not key:
#         return "Please provide API key", 401

#     keyBytes = key.encode("utf-8")
#     hash = sha256(keyBytes).hexdigest()
#     if not (hash == "3737f14fca209ae1f2b64afa92b075896224486e694a111fb7b5e6fedc180c87"):
#         return "Wrong API key", 403

#     logs = open("data/api.log", "r")
#     return logs.read(), 200

if __name__ == "__main__":
    app.run(
        debug=True, port=5000
    )  # Running on the default Flask server for development
