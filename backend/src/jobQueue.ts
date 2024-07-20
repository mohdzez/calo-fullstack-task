import { ConnectionOptions, Queue, Worker } from "bullmq";
import axios from "axios";

import { REDIS_HOST, REDIS_PORT, UNSPLASH_CLIENT_ID } from "./config";
import { updateJobStatus, readJobsFromFile } from "./jobUtils";
import { sendEventToAllClients } from "./index";

const connection: ConnectionOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT as number,
};

const jobQueue = new Queue("jobQueue", { connection });

const worker = new Worker(
  "jobQueue",
  async (job) => {
    const { id } = job.data;
    try {
      const imageUrl = await axios
        .get(
          `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_CLIENT_ID}&query=food+healthy+Appetising`
        )
        .then((res) => res.data)
        .then((data) => data.urls.regular);

      return imageUrl;
    } catch (error) {
      await updateJobStatus(id, "failed", null);
      throw new Error("Failed to fetch image : " + error);
    }
  },
  { connection }
);

worker.on("completed", async (job, result) => {
  const { id } = job.data;
  console.log(`Job ${job.id} completed, Result: ${result}`);
  await updateJobStatus(id, "resolved", result);
  const jobs = await readJobsFromFile();
  const updatedJob = jobs.find((j) => j.id === id);
  if (updatedJob) {
    sendEventToAllClients(updatedJob);
  }
});

worker.on("failed", async (job, err) => {
  const { id } = job!.data;
  console.log(`Job ${job!.id} failed, Error: ${err.message}`);
  await updateJobStatus(id, "failed", null);
  const jobs = await readJobsFromFile();

  const updatedJob = jobs.find((j) => j.id === id);
  if (updatedJob) {
    sendEventToAllClients(updatedJob);
  }
});

export { jobQueue };
