function dqs(q) {
  return document.querySelector(q);
}

function formatDatetimeTimestamp(timestamp) {
  timestamp = new Date(timestamp);
  isToday = timestamp.toDateString() === (new Date()).toDateString()
  return isToday ? `Heute ${formatTimeTimestamp(timestamp)}` : timestamp.toLocaleString("it-IT");
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

async function fetchCurrentData() {
  return fetchLatestData(1);
}

async function fetchGraphData() {
  return fetchLatestData(12)
}

function setCurrentData(data) {
  dqs("#current-t").innerText = formatDatetimeTimestamp(data.entries[0].timestamp)
  dqs("#current-h").innerText = data.entries[0].height;
}

function setGraphData(data) {
  const entries = data.entries;
  entries.forEach((e) => {
    graphData.labels.push(formatTimeTimestamp(e.timestamp));
    graphData.datasets[0].data.push(e.height);
  })
  graphData.datasets[0].label = `Letzte ${entries.length} Messungen`;
}

function setup() {
  fetchCurrentData()
    .then(data => setCurrentData(data))
    .catch(err => console.error(err))

  fetchGraphData()
    .then((data) => {
      setGraphData(data);
      // render init block
      const myChart = new Chart(
        document.getElementById('myChart'),
        config
      );
    })
    .catch(err => console.error(err))
}

// Chart

// setup 
const graphData = {
  labels: [],
  datasets: [{
    label: 'Wasserstand',
    data: [],
    backgroundColor: [
      'rgba(54, 162, 235, 0.2)',
    ],
    borderColor: [
      'rgba(54, 162, 235, 1)',
    ],
    borderWidth: 1
  }]
};

// config 
const config = {
  type: 'bar',
  data: graphData,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};

// // Instantly assign Chart.js version
// const chartVersion = document.getElementById('chartVersion');
// chartVersion.innerText = Chart.version;

setup()
