// import React, { useEffect, useState } from "react";
// import axios from "axios";

// interface Job {
//   id: string;
//   status: "pending" | "completed";
//   result: string;
// }

// const App: React.FC = () => {
//   const [jobs, setJobs] = useState<Job[]>([]);

//   useEffect(() => {
//     fetchJobs();
//     const eventSource = new EventSource("http://localhost:3000/events");
//     eventSource.onmessage = (event) => {
//       const updatedJob = JSON.parse(event.data);

//       setJobs((prev) => {
//         const index = prev.findIndex((j) => j.id === updatedJob.id);

//         if (index !== -1) {
//           prev[index] = updatedJob;
//         }

//         return [...prev];
//       });

//       console.log("Updated job:", updatedJob);
//     };
//     eventSource.onerror = (err) => {
//       console.error("EventSource failed:", err);
//       eventSource.close();
//     };

//     return () => {
//       eventSource.close();
//     };
//   }, []);

//   const createJob = async () => {
//     try {
//       await axios.post("http://localhost:3000/jobs");
//       fetchJobs();
//     } catch (error) {
//       console.error("Error creating job", error);
//     }
//   };

//   const fetchJobs = async () => {
//     try {
//       const response = await axios.get<Job[]>("http://localhost:3000/jobs");
//       setJobs(response.data);
//     } catch (error) {
//       console.error("Error fetching jobs", error);
//     }
//   };

//   const renderJobs = () =>
//     jobs.map(({ id, status, result }) => (
//       <li key={id}>
//         <p>Job ID: {id}</p>
//         <p>Status: {status}</p>
//         <img src={result} />
//       </li>
//     ));

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Job Tracker</h1>
//         <button onClick={createJob}>Create Job</button>
//         <ul>{renderJobs()}</ul>
//       </header>
//     </div>
//   );
// };

// export default App;
