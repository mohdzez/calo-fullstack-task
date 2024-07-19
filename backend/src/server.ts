import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "node:fs/promises";

const app = express();
app.use(cors());
app.use(express.json());

interface Job {
  id: string;
  status: "pending" | "completed";
  result?: string;
}
const jobsFilePath = path.join(__dirname, "../data/jobs.json");

const readJobsFromFile = async () => {
  const data = await fs.readFile(jobsFilePath, "utf8");
  return JSON.parse(data);
};

// const writeJobsToFile = async (jobs: Job[]) => {
//   fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2), "utf8");
// };

let jobs: Job[] = [];

app.post("/jobs", async (req: Request, res: Response) => {
  const jobId = uuidv4();
  const job: Job = { id: jobId, status: "pending" };
  jobs.push(job);

  const data = await readJobsFromFile();

  console.log(data);
  console.log(jobs);

  // try {
  // await fs.writeFile(jobsFilePath, JSON.stringify(jobs, null, 2), "utf8");
  // } catch (error) {
  //   console.error("Error writing jobs to file", error);
  // }

  await sendSseUpdate(jobId, "pending");

  try {
    setTimeout(async () => {
      const index = jobs.findIndex((j) => j.id === jobId);
      if (index !== -1) {
        const data = await axios
          .get(
            "https://api.unsplash.com/photos/random?client_id=rhcw3xrQMwTXE7istyNMWD8bFKIp1EvANjBZgYveNfI&query=food+healthy"
          )
          .then((res) => res.data)
          .then((data) => data.urls.regular);

        jobs[index].result = data;

        jobs[index].status = "completed";
        await sendSseUpdate(jobId, "completed", data);
      }
    }, 5000);
  } catch (error) {
    console.error("Error sending SSE update", error);
  }

  res.status(201).json({ id: jobId });
});

app.get("/jobs", (req: Request, res: Response) => {
  res.json(jobs);
});

app.get("/jobs/:id", (req: Request, res: Response) => {
  const jobId = req.params.id;

  const index = jobs.findIndex((j) => j.id === jobId);

  if (index !== -1) {
    const { id, status, result } = jobs[index];
    res.status(201).json({ id, status, result });
  } else {
    res.status(404).json({ message: "Job not found" });
  }
});

async function sendSseUpdate(
  jobId: string,
  status: "pending" | "completed",
  result?: string
) {
  const data = JSON.stringify({ id: jobId, status, result });
  client?.write(`data: ${data}\n\n`);

  // clients.forEach((client) => {
  //   client.res.write(`data: ${data}\n\n`);
  // });
}

// let clients: { id: string; res: Response }[] = [];

let client: Response | undefined;

app.get("/events", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  client = res;

  // const clientId = uuidv4();
  // clients.push({ id: clientId, res });

  // req.on("close", () => {
  //   clients = clients.filter((client) => client.id !== clientId);
  // });

  req.on("close", () => {
    client = undefined;
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
