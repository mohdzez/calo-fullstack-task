import React, { useState, useEffect } from "react";
import axios from "axios";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { animateScroll } from "react-scroll";

import JobItem from "./components/JobItem";
import { Button, Typography } from "antd";

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

      animateScroll.scrollToBottom();
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  return (
    <div>
      <div className="z-50 sticky py-1 bg-white top-0 w-full flex items-center px-2 justify-between drop-shadow-md">
        <Typography className="font-semibold text-base tracking-wider">
          CALO
        </Typography>

        <Button onClick={createJob}>Create</Button>
      </div>

      {jobs.length > 0 ? (
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 4, 1200: 5 }}
        >
          <Masonry>
            {jobs.map((job) => (
              <div key={job.id}>
                <JobItem id={job.id} result={job.result} status={job.status} />
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
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
  );
};

export default App;
