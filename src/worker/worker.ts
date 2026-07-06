import { io } from 'socket.io-client';
import { TibiaWheelManager, IWheelNode } from '../core/TibiaWheelManager';
import { EngineBridge } from '../core/EngineBridge';


// Conecte ao URL que será gerado pelo Render.com!
// Por padrão, se não tiver variável de ambiente, tenta conectar no localhost:3000
const MAESTRO_URL = process.env.MAESTRO_URL || 'http://localhost:3000';

console.log(`===========================================`);
console.log(`🤖 Tibia@Home Worker Engine Booting Up...`);
console.log(`📡 Connecting to Maestro: ${MAESTRO_URL}`);
console.log(`===========================================`);

const socket = io(MAESTRO_URL);

socket.on('connect', () => {
  console.log(`✅ Connected to Maestro Server! ID: ${socket.id}`);
  socket.emit('worker_ready');
});

socket.on('job_assigned', async (payload: { jobId: string, data: any }) => {
  console.log(`\n📥 Received Job: ${payload.jobId}`);
  console.log(`⚙️ Starting heavy computation... (Simulating CPU load)`);
  
  const startTime = Date.now();

  // ---------------------------------------------------------
  // MOCK HEAVY COMPUTATION (TIBIA WHEEL BRUTEFORCE)
  // We will replace this with real Tree permutation logic later
  // ---------------------------------------------------------
  
  // Fake a heavy 4-second calculation process
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  // Create a fake result showing the path chosen
  const bestPath = ['wheel-ne-1', 'wheel-ne-2', 'wheel-ne-3', 'wheel-ne-4', 'wheel-ne-perk-1'];
  
  console.log(`🏆 Computation finished in ${Date.now() - startTime}ms`);
  
  // Submit the result back to the server
  socket.emit('submit_result', {
    jobId: payload.jobId,
    result: {
      bestPath,
      fitnessScore: 45000,
      dps: 2200,
      message: 'Optimal path calculated by Tibia@Home Worker!'
    }
  });
  
  // Ask for the next job!
  socket.emit('request_job');
});

socket.on('no_jobs', () => {
  console.log(`💤 No pending jobs in the queue. Going to sleep...`);
});

socket.on('disconnect', () => {
  console.log(`❌ Disconnected from Maestro server.`);
});
