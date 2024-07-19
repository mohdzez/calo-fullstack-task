import React, { useState, useEffect } from "react";
import axios from "axios";

interface Job {
  id: string;
  status: string;
  result: string | null;
}

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newJobId, setNewJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
    const eventSource = new EventSource("http://localhost:3000/api/events");
    eventSource.onmessage = (event) => {
      const updatedJob: Job = JSON.parse(event.data);
      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
      );
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get<Job[]>("http://localhost:3000/api/jobs");
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const createJob = async () => {
    try {
      const response = await axios.post<{ id: string }>(
        "http://localhost:3000/api/jobs"
      );
      setNewJobId(response.data.id);
      fetchJobs();
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  return (
    <div>
      <h1>Jobs</h1>
      <button onClick={createJob}>Create New Job</button>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <p>Job ID: {job.id}</p>
            <p>Status: {job.status}</p>
            {job.result && (
              <img src={job.result} alt="Job Result" width="200" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
