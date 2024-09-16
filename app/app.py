from flask import Flask, request
import logging
import csv
from datetime import datetime
from hashlib import sha256
import pytz

logging.basicConfig(filename="data/api.log", format="%(asctime)s %(levelname)s : %(message)s", level=logging.DEBUG)
app = Flask(__name__)

@app.route("/post", methods=["POST"])
def postData():
    data = request.json
    
    dataError = verifyData(data)
    if dataError:
        app.logger.warning(dataError)
        return dataError, 400
    
    if not storeDataToCsv(data):
        app.logger.error("Could not store data")
        return "Could not store data", 500
    
    app.logger.info("Data stored successfully")
    return "Data stored successfully", 200

@app.route("/get", methods=["GET"])
def getAllData():
    data = readDataFromCsv()
    return data, 200

@app.route("/get/latest/<int:number>", methods=["GET"])
def getLatestData(number):
    data = readDataFromCsv()
    
    if len(data["entries"]) > number:
        data["entries"] = data["entries"][len(data["entries"]) - number::]
    
    return data, 200

@app.route("/get/query-date/<string:date>", methods=["GET"])
def getSingleDateData(date):
    date = date.replace(".", "-")
    data = readDataFromCsv()
    data["entries"] = list(filter(lambda e: date in e["timestamp"], data["entries"]))
    return data, 200

@app.route("/get/<startDate>/<endDate>", methods=["GET"])
def getRangeData(startDate, endDate):
    data = readDataFromCsv()

    startIdx = 0
    endIdx = 0

    for i, entry in enumerate(data["entries"]):
        if startDate in entry["timestamp"]:
            startIdx = i
            break

    for i, entry in enumerate(data["entries"]):
        if endDate in entry["timestamp"]:
            endIdx = i

    if startIdx == endIdx:
        data["entries"] = []
    
    data["entries"] = data["entries"][startIdx:endIdx + 1]
    
    return data, 200

@app.route("/logs", methods=["GET"])
def getLogs():
    key = request.args.get("key")
    if not key:
        return "Please provide API key", 401

    keyBytes = key.encode("utf-8")
    hash = sha256(keyBytes).hexdigest()
    if not (hash == "3737f14fca209ae1f2b64afa92b075896224486e694a111fb7b5e6fedc180c87"):
        return "Wrong API key", 403
    
    logs = open("data/api.log", "r")
    return logs.read(), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Running on the default Flask server for development

def verifyData(data):
    if not ("height" in data): return "Wrong JSON format"
    if data["height"] < 0 or data["height"] > 20: return f"Height value unrealistic: {data['height']}"

    return ""

def storeDataToCsv(data):
    success = False

    timestamp =  datetime.now(pytz.timezone("Europe/Rome")).strftime("%Y-%m-%dT%H:%M:%S")
    try:
        with open("data/data.csv", "a", newline="") as csvfile:
            writer = csv.writer(csvfile, delimiter=",", quotechar='"')
            writer.writerow([data["height"], timestamp])
        success = True
    except:
        pass

    return success

def readDataFromCsv():
    data = {
        "entries": []
    }

    with open("data/data.csv", newline="") as csvfile:
        reader = csv.reader(csvfile, delimiter=",", quotechar='"')
        for row in reader:
            data["entries"].append({
                "height": row[0],
                "timestamp": row[1]
            })

    return data

