import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Simple queue in memory
interface Job {
  id: string;
  clientId: string;
  data: any;
  status: 'PENDING' | 'PROCESSING';
}

const jobs: Job[] = [];
let workerCount = 0;

io.on('connection', (socket) => {
  console.log(`[Maestro] New connection: ${socket.id}`);

  // ---------------------------------------------------------
  // REACT FRONTEND ROUTES
  // ---------------------------------------------------------
  
  socket.on('submit_job', (data) => {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const newJob: Job = {
      id: jobId,
      clientId: socket.id,
      data,
      status: 'PENDING'
    };
    
    jobs.push(newJob);
    console.log(`[Maestro] Job submitted from frontend. Total queue: ${jobs.length}`);
    
    // Tell workers that a new job is available
    io.emit('job_available');
  });


  // ---------------------------------------------------------
  // WORKER ROUTES
  // ---------------------------------------------------------

  socket.on('worker_ready', () => {
    workerCount++;
    console.log(`[Maestro] Worker connected. Total workers: ${workerCount}`);
    
    // Send immediate job if available
    const pendingJob = jobs.find(j => j.status === 'PENDING');
    if (pendingJob) {
      pendingJob.status = 'PROCESSING';
      socket.emit('job_assigned', { jobId: pendingJob.id, data: pendingJob.data });
    }
  });

  socket.on('request_job', () => {
    const pendingJob = jobs.find(j => j.status === 'PENDING');
    if (pendingJob) {
      pendingJob.status = 'PROCESSING';
      socket.emit('job_assigned', { jobId: pendingJob.id, data: pendingJob.data });
    } else {
      socket.emit('no_jobs');
    }
  });

  socket.on('submit_result', (payload: { jobId: string, result: any }) => {
    console.log(`[Maestro] Job ${payload.jobId} completed by worker!`);
    
    const jobIndex = jobs.findIndex(j => j.id === payload.jobId);
    if (jobIndex > -1) {
      const job = jobs[jobIndex];
      // Send result back to the specific React client
      io.to(job.clientId).emit('job_completed', { jobId: job.id, result: payload.result });
      
      // Remove from queue
      jobs.splice(jobIndex, 1);
    }
  });


  socket.on('disconnect', () => {
    console.log(`[Maestro] Disconnected: ${socket.id}`);
  });
});

app.get('/', (req, res) => {
  res.send('Tibia@Home Maestro Server is running!');
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🤖 Tibia@Home Maestro is running on port ${PORT}`);
  console.log(`===========================================`);
});
