function dqs(q) {
  return document.querySelector(q);
}

function formatFetchDateTimestamp(date, withTime) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
  }-${date.getDate()}${
    withTime
      ? "T" + (date.getHours < 10 ? "0" + date.getHours() : date.getHours())
      : ""
  }`;
}

function formatDatetimeTimestamp(timestamp) {
  timestamp = new Date(timestamp);
  isToday = timestamp.toDateString() === new Date().toDateString();
  return isToday
    ? `Heute ${formatTimeTimestamp(timestamp)}`
    : timestamp.toLocaleString("it-IT");
}

function formatTimeTimestamp(timestamp) {
  timestamp = new Date(timestamp);
  timestamp = timestamp.toLocaleTimeString("it-IT");
  return timestamp.substring(0, timestamp.length - 3);
}

async function fetchLatestData(numEntries) {
  res = await fetch(`/get/latest/${numEntries}`);
  json = await res.json();
  return json;
}

async function fetchDateData(date, withTime) {
  res = await fetch(
    `/get/query-date/${formatFetchDateTimestamp(date, withTime)}`
  );
  json = await res.json();
  return json;
}

async function fetchDateRangeData(startDate, endDate, withTime) {
  res = await fetch(
    `/get/${formatFetchDateTimestamp(
      startDate,
      withTime
    )}/${formatFetchDateTimestamp(endDate, withTime)}`
  );
  json = await res.json();
  return json;
}

async function fetchCurrentData() {
  return fetchLatestData(1);
}

async function fetchLastHours(hours) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setHours(endDate.getHours() - hours);

  return fetchDateRangeData(startDate, endDate, true);
}

function setCurrentData(data) {
  dqs("#current-t").innerText = formatDatetimeTimestamp(
    data.entries[0].timestamp
  );
  dqs("#current-h").innerText = data.entries[0].height;
}

function setGraphData(graphData, data) {
  const entries = data.entries;
  entries.forEach((e) => {
    graphData.labels.push(e.timestamp);
    graphData.datasets[0].data.push(e.height);
  });
}

function setup() {
  fetchCurrentData()
    .then((data) => setCurrentData(data))
    .catch((err) => console.error(err));

  fetchLastHours(6)
    .then((data) => {
      setGraphData(shortGraphData, data);
      new Chart(document.getElementById("shortChart"), shortGraphConfig);
    })
    .catch((err) => console.error(err));

  fetchLastHours(48)
    .then((data) => {
      setGraphData(longGraphData, data);
      new Chart(document.getElementById("longChart"), longGraphConfig);
    })
    .catch((err) => console.error(err));
}

// Charts
const shortGraphData = {
  labels: [],
  datasets: [
    {
      label: "Letzte 6h",
      data: [],
      backgroundColor: ["rgba(54, 162, 235, 0.2)"],
      borderColor: ["rgba(54, 162, 235, 1)"],
      borderWidth: 1,
    },
  ],
};

const shortGraphConfig = {
  type: "line",
  data: shortGraphData,
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        type: 'time',
        adapters: {
          date: {
            locale: "de-AT"
          }
        }
      }
    },
    elements: {
      line: {
        fill: true,
      },
      point: {
        pointRadius: 0,
      },
    },
  },
};

const longGraphData = {
  labels: [],
  datasets: [
    {
      label: "Letzte 2 Tage",
      data: [],
      backgroundColor: ["rgba(54, 162, 235, 0.2)"],
      borderColor: ["rgba(54, 162, 235, 1)"],
      borderWidth: 1,
    },
  ],
};

const longGraphConfig = {
  type: "line",
  data: longGraphData,
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        type: 'time',
        adapters: {
          date: {
            locale: "de"
          }
        }
      }
    },
    elements: {
      line: {
        fill: true,
      },
      point: {
        pointRadius: 0,
      },
    },
  },
};

setup();
