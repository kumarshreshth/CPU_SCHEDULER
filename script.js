document
  .getElementById("increment")
  .addEventListener("click", incrementProcesses);
document
  .getElementById("decrement")
  .addEventListener("click", decrementProcesses);
document.getElementById("run").addEventListener("click", schedule);
document.getElementById("reset").addEventListener("click", resetScheduler);
document
  .getElementById("algorithm")
  .addEventListener("change", updateAlgorithmSettings);

let processCount = 0;

function incrementProcesses() {
  processCount++;
  updateProcessCount();
  addProcessRow();
}

function decrementProcesses() {
  if (processCount > 0) {
    processCount--;
    updateProcessCount();
    removeProcessRow();
  }
}

function updateProcessCount() {
  document.getElementById("num-processes").value = processCount;
}

function addProcessRow() {
  const tableBody = document.getElementById("process-body");
  const row = document.createElement("tr");
  row.innerHTML = `
        <td>P${processCount}</td>
        <td><input type="number" class="arrival-time" placeholder="Arrival Time"></td>
        <td><input type="number" class="burst-time" placeholder="Burst Time"></td>
    `;
  tableBody.appendChild(row);
}

function removeProcessRow() {
  const tableBody = document.getElementById("process-body");
  tableBody.removeChild(tableBody.lastElementChild);
}

function updateAlgorithmSettings() {
  const algorithm = document.getElementById("algorithm").value;
  const quantumTimeSection = document.getElementById("quantum-time-section");

  if (algorithm === "rr") {
    quantumTimeSection.classList.remove("hidden");
  } else {
    quantumTimeSection.classList.add("hidden");
  }
}

function schedule() {
  const algorithm = document.getElementById("algorithm").value;
  const processRows = document.querySelectorAll("#process-body tr");
  let processes = [];

  processRows.forEach((row, index) => {
    const arrivalTime = row.querySelector(".arrival-time").value;
    const burstTime = row.querySelector(".burst-time").value;
    processes.push({
      id: index + 1,
      arrivalTime: Number(arrivalTime),
      burstTime: Number(burstTime),
    });
  });

  switch (algorithm) {
    case "fcfs":
      fcfsSchedule(processes);
      break;
    case "sjf_np":
      sjf_np(processes);
      break;
    case "sjf_p":
      sjf_p(processes);
      break;
    case "rr":
      const quantumTime = Number(document.getElementById("quantum-time").value);
      rrSchedule(processes, quantumTime);
      break;
    default:
      alert("Please select a valid algorithm.");
  }
}

function fcfsSchedule(processes) {
  if (processes.length == 0) {
    alert("INVALID ACTION! Enter the number of processes");
    return;
  }

  let n = processes.length;
  let currentTime = 0;
  let results = [];
  let completionTime = Array(n).fill(0);
  let waitingTime = Array(n).fill(0);
  let turnaroundTime = Array(n).fill(0);

  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  for (let idx = 0; idx < n; idx++) {
    if (currentTime < processes[idx].arrivalTime) {
      currentTime = processes[idx].arrivalTime;
    }
    // Calculate completion time, turnaround time, and waiting time
    currentTime += processes[idx].burstTime;
    completionTime[idx] = currentTime;
    turnaroundTime[idx] = completionTime[idx] - processes[idx].arrivalTime;
    waitingTime[idx] = turnaroundTime[idx] - processes[idx].burstTime;

    results.push({
      id: processes[idx].id,
      arrivalTime: processes[idx].arrivalTime,
      burstTime: processes[idx].burstTime,
      completionTime: completionTime[idx],
      turnaroundTime: turnaroundTime[idx],
      waitingTime: waitingTime[idx],
    });
  }

  renderOutputTable(results);
  renderCharts(results);
}

function sjf_np(processes) {
  if (processes.length == 0) {
    alert("INVALID ACTION! Enter the number of processes");
    return;
  }

  let n = processes.length;
  let currentTime = 0;
  let completed = 0;
  let results = [];
  let completionTime = Array(n).fill(0);
  let waitingTime = Array(n).fill(0);
  let turnaroundTime = Array(n).fill(0);
  let isCompleted = Array(n).fill(false);

  while (completed < n) {
    let minBurstTime = Infinity;
    let idx = -1;

    for (let i = 0; i < n; i++) {
      if (
        processes[i].arrivalTime <= currentTime &&
        !isCompleted[idx] &&
        processes[idx].burstTime < minBurstTime
      ) {
        minBurstTime = processes[idx].burstTime;
        idx = i;
      }
    }
    if (idx !== -1) {
      currentTime += minBurstTime;
      completionTime[idx] = currentTime;
      turnaroundTime[idx] = completionTime[idx] - processes[idx].arrivalTime;
      waitingTime[idx] = turnaroundTime[idx] - processes[idx].burstTime;

      results.push({
        id: processes[idx].id,
        arrivalTime: processes[idx].arrivalTime,
        burstTime: processes[idx].burstTime,
        completionTime: completionTime[idx],
        turnaroundTime: turnaroundTime[idx],
        waitingTime: waitingTime[idx],
      });

      isCompleted[idx] = true;
      completed++;
    }
    currentTime++;
  }

  renderOutputTable(results);
  renderCharts(results);
}

function sjf_p(processes) {
  if (processes.length == 0) {
    alert("INVALID ACTION! Enter the number of processes");
    return;
  }

  let n = processes.length;
  let currentTime = 0;
  let completed = 0;
  let results = [];
  let remainingTime = processes.map((p) => p.burstTime);
  let isCompleted = Array(n).fill(false);
  let completionTime = Array(n).fill(0);
  let turnaroundTime = Array(n).fill(0);
  let waitingTime = Array(n).fill(0);

  while (completed < n) {
    // Find the process with the shortest remaining time at the current time
    let minRemainingTime = Infinity;
    let idx = -1;

    for (let i = 0; i < n; i++) {
      if (
        processes[i].arrivalTime <= currentTime &&
        !isCompleted[i] &&
        remainingTime[i] < minRemainingTime
      ) {
        minRemainingTime = remainingTime[i];
        idx = i;
      }
    }

    if (idx !== -1) {
      // Process the selected process for one time unit
      remainingTime[idx]--;

      // If the process completes, update the completion, turnaround, and waiting times
      if (remainingTime[idx] === 0) {
        completed++;
        isCompleted[idx] = true;
        completionTime[idx] = currentTime + 1;
        turnaroundTime[idx] = completionTime[idx] - processes[idx].arrivalTime;
        waitingTime[idx] = turnaroundTime[idx] - processes[idx].burstTime;

        results.push({
          id: processes[idx].id,
          arrivalTime: processes[idx].arrivalTime,
          burstTime: processes[idx].burstTime,
          completionTime: completionTime[idx],
          turnaroundTime: turnaroundTime[idx],
          waitingTime: waitingTime[idx],
        });
      }
    }

    // Move to the next time unit
    currentTime++;
  }

  renderOutputTable(results);
  renderCharts(results);
}

function renderOutputTable(results) {
  const outputBody = document.getElementById("output-body");
  outputBody.innerHTML = ""; // Clear previous output

  results.forEach((result) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>P${result.id}</td>
            <td>${result.arrivalTime}</td>
            <td>${result.burstTime}</td>
            <td>${result.completionTime}</td>
            <td>${result.turnaroundTime}</td>
            <td>${result.waitingTime}</td>
        `;
    outputBody.appendChild(row);
  });
}

function renderCharts(results) {
  const processLabels = results.map((process) => `P${process.id}`);
  const waitingTimes = results.map((process) => process.waitingTime);
  const turnaroundTimes = results.map((process) => process.turnaroundTime);

  // Waiting Time Pie Chart
  const waitingCtx = document
    .getElementById("waitingTimeChart")
    .getContext("2d");
  new Chart(waitingCtx, {
    type: "pie",
    data: {
      labels: processLabels,
      datasets: [
        {
          label: "Waiting Time",
          data: waitingTimes,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Waiting Time Distribution",
        },
      },
    },
  });

  // Turnaround Time Pie Chart
  const turnaroundCtx = document
    .getElementById("turnaroundTimeChart")
    .getContext("2d");
  new Chart(turnaroundCtx, {
    type: "pie",
    data: {
      labels: processLabels,
      datasets: [
        {
          label: "Turnaround Time",
          data: turnaroundTimes,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Turnaround Time Distribution",
        },
      },
    },
  });
}

function resetScheduler() {
  document.getElementById("process-body").innerHTML = "";
  document.getElementById("output-body").innerHTML = "";
  document.getElementById("data-visualization").innerHTML = "";
  processCount = 0;
  updateProcessCount();
}
