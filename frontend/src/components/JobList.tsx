import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Job } from "../types";
import JobItem from "./JobItem";

const JobList = ({ jobs }: { jobs: Job[] }) => {
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 4, 1200: 5 }}
    >
      <Masonry>
        {jobs.map((job) => (
          <JobItem
            key={job.id}
            id={job.id}
            result={job.result}
            status={job.status}
          />
        ))}
      </Masonry>
    </ResponsiveMasonry>
  );
};

export default JobList;
