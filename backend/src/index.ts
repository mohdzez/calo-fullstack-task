import "dotenv/config";
import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import fs from "fs";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import { PORT, UNSPLASH_CLIENT_ID } from "./config";

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(morgan("common"));
app.use(cors());

interface Job {
  id: string;
  status: string;
  result: string | null;
}

const jobsFilePath = path.join(__dirname, "../data/jobs.json");

async function readJobsFromFile(): Promise<Job[]> {
  try {
    if (!fs.existsSync(jobsFilePath)) {
      await fs.promises.writeFile(jobsFilePath, "[]", "utf-8");
    }
    const data = await fs.promises.readFile(jobsFilePath, "utf-8");
    return JSON.parse(data) as Job[];
  } catch (error) {
    console.error("Error reading jobs file:", error);
    return [];
  }
}

async function writeJobsToFile(jobs: Job[]): Promise<void> {
  try {
    await fs.promises.writeFile(
      jobsFilePath,
      JSON.stringify(jobs, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Error writing jobs file:", error);
  }
}

let clients: { id: string; res: Response }[] = [];

function sendEventToAllClients(job: Job) {
  clients.forEach(({ res }) => {
    res.write(`data: ${JSON.stringify(job)}\n\n`);
  });
}

app.post("/api/jobs", async (req: Request, res: Response) => {
  const jobs = await readJobsFromFile();
  const jobId = uuidv4();
  const job: Job = { id: jobId, status: "pending", result: null };
  jobs.push(job);
  await writeJobsToFile(jobs);
  sendEventToAllClients(job);

  setTimeout(async () => {
    try {
      const imageUrl = await axios
        .get(
          `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_CLIENT_ID}&query=food+healthy+green`
        )
        .then((res) => res.data)
        .then((data) => data.urls.regular);
      job.status = "resolved";
      job.result = imageUrl;
    } catch (error: any) {
      job.status = "failed";
    }
    const updatedJobs = await readJobsFromFile();
    const jobIndex = updatedJobs.findIndex((j) => j.id === job.id);
    if (jobIndex !== -1) {
      updatedJobs[jobIndex] = job;
      await writeJobsToFile(updatedJobs);
    }
    sendEventToAllClients(job);
  }, 5000);

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
