import path from "path";
import fs from "fs";

import { Job } from "./Types";

const jobsFilePath = path.join(__dirname, "../data/jobs.json");

export async function readJobsFromFile(): Promise<Job[]> {
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

export async function writeJobsToFile(jobs: Job[]): Promise<void> {
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

export async function updateJobStatus(
  jobId: string,
  status: "pending" | "resolved" | "failed",
  result: string | null
): Promise<void> {
  const jobs = await readJobsFromFile();
  const jobIndex = jobs.findIndex((j) => j.id === jobId);
  if (jobIndex !== -1) {
    jobs[jobIndex].status = status;
    jobs[jobIndex].result = result;
    await writeJobsToFile(jobs);
  } else {
    console.error(`Job with ID ${jobId} not found`);
  }
}
