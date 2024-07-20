import React, { useState, useEffect } from "react";
import { animateScroll } from "react-scroll";
import { Button, Typography } from "antd";
import axios from "axios";

import JobList from "./components/JobList";

interface Job {
  id: string;
  status: string;
  result: string | null;
}

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [, setNewJobId] = useState<string | null>(null);

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
      console.error("Error, Fetching: ", error);
    }
  };

  const createJob = async () => {
    try {
      const response = await axios.post<{ id: string }>(
        "http://localhost:3000/api/jobs"
      );
      setNewJobId(response.data.id);
      fetchJobs();

      animateScroll.scrollToBottom();
    } catch (error) {
      console.error("Error, Creating: ", error);
    }
  };

  return (
    <div>
      <nav className="z-50 sticky py-1 bg-white top-0 w-full flex items-center px-2 justify-between drop-shadow-sm">
        <Typography className="font-semibold text-base tracking-wider">
          CALO
        </Typography>
        <Button onClick={createJob}>Create</Button>
      </nav>

      <div className="mt-1">
        {jobs.length > 0 ? (
          <JobList jobs={jobs} />
        ) : (
          <div className="h-[50vh] flex flex-col items-center justify-center">
            <Typography className="text-base font-semibold mb-2">
              No jobs to Process yet 🥲.
            </Typography>
            <Button className="animate-bounce" onClick={createJob}>
              Create
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
