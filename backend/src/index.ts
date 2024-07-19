import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();

app.use(cors());
const PORT = process.env.PORT || 3000;

interface Job {
  id: string;
  status: string;
  result: string | null;
}

const jobsFilePath = path.join(__dirname, "../data/jobs.json");

function readJobsFromFile(): Job[] {
  if (!fs.existsSync(jobsFilePath)) {
    fs.writeFileSync(jobsFilePath, "[]", "utf-8");
  }
  const data = fs.readFileSync(jobsFilePath, "utf-8");
  return JSON.parse(data) as Job[];
}

function writeJobsToFile(jobs: Job[]): void {
  fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), "utf-8");
}

app.use(express.json());

// let clients: { id: string; res: Response }[] = [];
let client: Response | undefined;

function sendEventToAllClients(job: Job) {
  // clients.forEach(({ id, res }) => {
  //   res.write(`data: ${JSON.stringify(job)}\n\n`);
  // });
  client?.write(`data: ${JSON.stringify(job)}\n\n`);
}

app.post("/api/jobs", (req: Request, res: Response) => {
  const jobs = readJobsFromFile();
  const jobId = uuidv4();
  const job: Job = { id: jobId, status: "pending", result: null };
  jobs.push(job);
  writeJobsToFile(jobs);
  sendEventToAllClients(job);

  // Simulate delayed execution
  setTimeout(async () => {
    try {
      const imageUrl = await axios
        .get(
          "https://api.unsplash.com/photos/random?client_id=rhcw3xrQMwTXE7istyNMWD8bFKIp1EvANjBZgYveNfI&query=food+healthy"
        )
        .then((res) => res.data)
        .then((data) => data.urls.regular);
      job.status = "resolved";
      job.result = imageUrl;
    } catch (error) {
      job.status = "failed";
    }
    writeJobsToFile(jobs);
    sendEventToAllClients(job);
  }, 5000);

  res.status(201).json({ id: jobId });
});

app.get("/api/jobs", (req: Request, res: Response) => {
  const jobs = readJobsFromFile();
  const jobList = jobs.map(({ id, status, result }) => ({
    id,
    status,
    result,
  }));
  res.json(jobList);
});

app.get("/api/jobs/:id", (req: Request, res: Response) => {
  const jobs = readJobsFromFile();
  const jobId = req.params.id;
  const job = jobs.find((j) => j.id === jobId);
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ error: "Job not found" });
  }
});

app.get("/api/events", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  client = res;

  // const clientId = uuidv4();
  // clients.push({ id: clientId, res });

  req.on("close", () => {
    // clients = clients.filter((client) => client.id !== clientId);
    client = undefined;
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
