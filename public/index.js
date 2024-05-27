function dqs(q) {
  return document.querySelector(q);
}

async function fetchCurrentData() {
  res = await fetch("/get/latest/1");
  json = await res.json();
  return json;
}

function setCurrentData(data) {
  timestamp = new Date(data.entries[0].timestamp);
  isToday = timestamp.toDateString() === (new Date()).toDateString()
  dqs("#current-t").innerText = isToday ? `Heute ${timestamp.toLocaleTimeString("it-IT")}` : timestamp.toLocaleString("it-IT");
  dqs("#current-h").innerText = data.entries[0].height;
}

function setup() {
  fetchCurrentData()
    .then(data => setCurrentData(data))
    .catch(err => console.error(err))
}

setup()

// Chart

// // setup 
// const data = {
//   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//   datasets: [{
//     label: 'Weekly Sales',
//     data: [18, 12, 6, 9, 12, 3, 9],
//     backgroundColor: [
//       'rgba(255, 26, 104, 0.2)',
//       'rgba(54, 162, 235, 0.2)',
//       'rgba(255, 206, 86, 0.2)',
//       'rgba(75, 192, 192, 0.2)',
//       'rgba(153, 102, 255, 0.2)',
//       'rgba(255, 159, 64, 0.2)',
//       'rgba(0, 0, 0, 0.2)'
//     ],
//     borderColor: [
//       'rgba(255, 26, 104, 1)',
//       'rgba(54, 162, 235, 1)',
//       'rgba(255, 206, 86, 1)',
//       'rgba(75, 192, 192, 1)',
//       'rgba(153, 102, 255, 1)',
//       'rgba(255, 159, 64, 1)',
//       'rgba(0, 0, 0, 1)'
//     ],
//     borderWidth: 1
//   }]
// };

// // config 
// const config = {
//   type: 'bar',
//   data,
//   options: {
//     scales: {
//       y: {
//         beginAtZero: true
//       }
//     }
//   }
// };

// // render init block
// const myChart = new Chart(
//   document.getElementById('myChart'),
//   config
// );

// // Instantly assign Chart.js version
// const chartVersion = document.getElementById('chartVersion');
// chartVersion.innerText = Chart.version;
