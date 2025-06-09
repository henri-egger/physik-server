import time, csv, os
from datetime import datetime
from logging import Logger
from typing import TypedDict


class CsvDataEntry(TypedDict):
    height: float
    isotime: str


class CsvData(TypedDict):
    entries: list[CsvDataEntry]


def verifyData(logger: Logger, data) -> str | float:
    if not ("height" in data):
        logger.warning(f"JSON format: {data}")
        return "Wrong JSON format"
    else:
        if data["height"] < 0 or data["height"] > 2000:
            logger.warning(f"Height value unrealistic: {data['height']}")

        return data["height"]


def storeData(data: float):
    success = False

    timestamp = time.time()
    file = f"data/data/{tsToFmt(timestamp)}.csv"

    try:
        # creates file if dne
        with open(file, "a", newline="") as csvfile:
            writer = csv.writer(csvfile, delimiter=",", quotechar='"')
            writer.writerow([data, timestamp])
        success = True
    except:
        pass

    return success


def readDataMulti(logger: Logger, timestamps: list[float]):
    aggregTs = []
    for ts in timestamps:
        ts = tsToFmt(ts)
        if ts not in aggregTs:
            aggregTs.append(ts)

    data: CsvData = {"entries": []}

    for ts in aggregTs:
        data["entries"].extend(readData(logger, ts)["entries"])

    return data


def readDataAll(logger: Logger):
    data: CsvData = {"entries": []}

    for record in os.listdir("data/data"):
        data["entries"].extend(readData(logger, record)["entries"])

    return data


def readData(logger: Logger, timestamp: float | str = time.time()):
    convTs: str
    if type(timestamp) is float:
        convTs = tsToFmt(timestamp)
    elif type(timestamp) is str:
        convTs = timestamp
    else:
        logger.error(f"Tried to read data with timestamp of type {type(timestamp)}")
        raise

    return _readDataTs(logger, convTs)


def _readDataTs(logger: Logger, timestamp: str):
    file = f"data/data/{timestamp}.csv"

    data: CsvData = {"entries": []}

    if not os.path.isfile(file):
        logger.error(f"Trying to read {file} which does not exist")
        # if time.time() < timestamp:
        # logger.warning(f"Requested future date: {tsToFmt(timestamp, "%Y-%m-%dT%H:%M:%S")}")

    with open(file, newline="") as csvfile:
        reader = csv.reader(csvfile, delimiter=",", quotechar='"')
        for row in reader:
            data["entries"].append({"height": float(row[0]), "isotime": row[1]})

    return data


def tsToFmt(ts: float, fmt: str = "%Y-%m") -> str:
    return datetime.fromtimestamp(ts).strftime(fmt)
