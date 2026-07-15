const { io } = require("socket.io-client");

const socket = io("http://localhost:3001");

socket.on("connect", () => {
  console.log("Client connected, submitting job...");
  socket.emit("submit_job", { action: "optimize_wheel", level: 800 });
});

socket.on("job_completed", (data) => {
  console.log("Job completed successfully!", data);
  process.exit(0);
});

setTimeout(() => {
  console.log("Timeout waiting for job completion");
  process.exit(1);
}, 10000);
