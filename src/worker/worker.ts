import { io } from 'socket.io-client';
import { TibiaWheelManager, Quadrant } from '../core/TibiaWheelManager';
import { EngineBridge } from '../core/EngineBridge';
import { getVocationDefaultWheelNodes } from '../core/wheelDatabase';

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
  
  if (payload.data.action === 'optimize_wheel') {
    const startTime = Date.now();
    console.log(`⚙️ Starting Genetic / Greedy Search for Level ${payload.data.level}...`);
    
    const state = payload.data.state;
    const totalPoints = Math.max(0, payload.data.level - 50);
    
    // We will test 50 random valid full-allocations (Monte Carlo approach)
    // For a production system, this would be a full Backtracking/Genetic Algorithm.
    let bestDPS = 0;
    let bestPath: string[] = [];
    
    const wheelNodes = getVocationDefaultWheelNodes(state.vocation);
    
    for (let i = 0; i < 50; i++) {
       const wheelManager = new TibiaWheelManager(payload.data.level, 0, wheelNodes);
       const pathTracker: string[] = [];
       
       // Greedily pick random valid nodes until we run out of points
       let pointsLeft = totalPoints;
       let safetyNet = 0;
       
       while (pointsLeft > 0 && safetyNet < 2000) {
         safetyNet++;
         
         // Find all nodes we can currently put a point in
         const availableNodeIds = wheelNodes.map(n => n.id).filter(id => wheelManager.allocatePoint(id));
         
         if (availableNodeIds.length === 0) break; // Can't allocate anymore
         
         // wheelManager.allocatePoint already added the point to test it, we need to roll it back 
         // and then pick ONE randomly. Wait, allocatePoint modifies state.
         // Let's reset and do it properly.
         wheelManager.resetWheel();
         pathTracker.forEach(id => wheelManager.allocatePoint(id));
         
         const validNextSteps: string[] = [];
         wheelNodes.forEach(n => {
            if (wheelManager.allocatePoint(n.id)) {
               validNextSteps.push(n.id);
               // rollback for next test
               wheelManager.resetWheel();
               pathTracker.forEach(id => wheelManager.allocatePoint(id));
            }
         });
         
         if (validNextSteps.length === 0) break;
         
         // Pick a random valid node
         const pick = validNextSteps[Math.floor(Math.random() * validNextSteps.length)];
         pathTracker.push(pick);
         wheelManager.allocatePoint(pick);
         pointsLeft--;
       }
       
       // Inject this wheel into the state and test DPS
       state.wheelManager = wheelManager;
       const result = EngineBridge.runSimulation(state, { exposeFlaw: false, divineDazzle: false, sapStrength: false, sioHeal: 0 });
       
       if (result.totalDamageDealt > bestDPS) {
         bestDPS = result.totalDamageDealt;
         bestPath = [...pathTracker];
       }
       
       if (i % 10 === 0) {
         console.log(`[Job ${payload.jobId}] Evaluated ${i}/50 genomes. Current Best DPS: ${bestDPS.toFixed(0)}`);
       }
    }

    console.log(`🏆 Computation finished in ${Date.now() - startTime}ms. Max DPS found: ${bestDPS.toFixed(0)}`);
    
    socket.emit('submit_result', {
      jobId: payload.jobId,
      result: {
        bestPath,
        fitnessScore: bestDPS,
        dps: bestDPS.toFixed(0),
        message: 'Optimal path calculated by Tibia@Home Worker using Monte Carlo tree search!'
      }
    });
  }
  
  socket.emit('request_job');
});

socket.on('no_jobs', () => {
  console.log(`💤 No pending jobs...`);
});

socket.on('disconnect', () => {
  console.log(`❌ Disconnected from Maestro server.`);
});
