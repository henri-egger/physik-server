function dqs(q) {
  return document.querySelector(q);
}

function formatFetchDateTimestamp(date, withTime) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
  }-${date.getDate()}${
    withTime
      ? "T" + (date.getHours() < 10 ? "0" + date.getHours() : date.getHours())
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

  // const now = new Date();
  // const data = await fetchDateData(now, true);
  // data.entries = [data.entries[data.entries.length - 1]];
  // return data;
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

  setLiveCircle(isSensorLive(data.entries[0].timestamp));
}

function isSensorLive(dataTimestamp) {
  const timestamp = new Date(dataTimestamp);
  const now = new Date();
  const diffMillis = now.getTime() - timestamp.getTime();
  const diffMin = diffMillis / 1000 / 60;
  const maxAllowedLivePauseMin = 12;
  return diffMin < maxAllowedLivePauseMin;
}

function setLiveCircle(isLive) {
  const liveCircle = dqs("#live-circle");
  if (isLive) {
    liveCircle.classList.remove("live-red");
    liveCircle.classList.add("live-green");
    liveCircle.title = "Der Sensor sendet aktiv Daten";
  }
}

function setup() {
  fetchCurrentData()
    .then((data) => setCurrentData(data))
    .catch((err) => console.error(err));

  fetchLastHours(6)
    .then((data) => {
      const entries = data.entries;

      const ctx = dqs("#shortChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: mapLabels(entries), // x-axis data (timestamps)
          datasets: [
            {
              label: "Letzte 6 Stunden",
              data: mapHeights(entries), // y-axis data (heights)
              segment: {
                borderColor: (ctx) => calcColor(ctx, "1"),
                backgroundColor: (ctx) => calcColor(ctx, "0.5"),
              },
            },
          ],
        },
        options: chartOptions,
      });
    })
    .catch((err) => console.error(err));

  fetchLastHours(48)
    .then((data) => {
      const entries = data.entries;

      const ctx = dqs("#longChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: mapLabels(entries), // x-axis data (timestamps)
          datasets: [
            {
              label: "Letzte 48 Stunden",
              data: mapHeights(entries), // y-axis data (heights)
              segment: {
                borderColor: (ctx) => calcColor(ctx, "1"),
                backgroundColor: (ctx) => calcColor(ctx, "0.5"),
              },
            },
          ],
        },
        options: chartOptions,
      });
    })
    .catch((err) => console.error(err));
}

const chartOptions = {
  scales: {
    x: {
      type: "time", // Handle time-based x-axis
      time: {
        unit: "minute", // Customize based on time range (minute, hour, day)
      },
      adapters: {
        date: {
          locale: "de-AT",
        },
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        // text: "Höhe [cm]",
      },
    },
  },
  elements: {
    line: {
      fill: true, // Fill area
      borderWidth: 1,
      tension: 0.5,
    },
    point: {
      radius: 0,
    },
  },
};

function mapLabels(entries) {
  return entries.map((dataPoint) => new Date(dataPoint.timestamp));
}

function mapHeights(entries) {
  return entries.map((dataPoint) => dataPoint.height);
}

function calcColor(ctx, opacity) {
  const yPrev = ctx.p0.parsed.y;
  const yNext = ctx.p1.parsed.y;
  return yPrev >= 0 && yNext >= 0
    ? `rgba(54, 162, 235, ${opacity})` // Teal for positive
    : `rgba(255, 99, 132, ${opacity})`; // Red for negative
}

setup();
