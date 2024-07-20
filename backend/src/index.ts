import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import morgan from "morgan";
import cors from "cors";

import { readJobsFromFile, writeJobsToFile } from "./jobUtils";
import { jobQueue } from "./jobQueue";
import { PORT } from "./config";
import { Job } from "./Types";

const app = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());

app.post("/api/jobs", async (req: Request, res: Response) => {
  const jobs = await readJobsFromFile();
  const jobId = uuidv4();
  const job: Job = { id: jobId, status: "pending", result: null };
  jobs.push(job);
  await writeJobsToFile(jobs);
  sendEventToAllClients(job);

  await jobQueue.add(
    "fetchImage",
    { id: jobId },
    { delay: Math.random() * (300000 - 5000) + 5000 }
  );

  res.status(201).json({ id: jobId });
});

app.get("/api/jobs", async (req: Request, res: Response) => {
  const jobs = await readJobsFromFile();
  const jobList = jobs.map(({ id, status, result }) => ({
    id,
    status,
    result,
  }));
  res.json(jobList);
});

app.get("/api/jobs/:id", async (req: Request, res: Response) => {
  const jobs = await readJobsFromFile();
  const jobId = req.params.id;
  const job = jobs.find((j) => j.id === jobId);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});

// SSE
export let clients: { id: string; res: Response }[] = [];

export function sendEventToAllClients(job: Job) {
  clients.forEach(({ res }) => {
    console.log(`Sending SSE for Job: ${job.id}, Status: ${job.status}`);

    res.write(`data: ${JSON.stringify(job)}\n\n`);
  });
}

app.get("/api/events", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const clientId = uuidv4();
  clients.push({ id: clientId, res });

  req.on("close", () => {
    clients = clients.filter((client) => client.id !== clientId);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
