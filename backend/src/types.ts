export interface Job {
  id: string;
  status: "pending" | "resolved" | "failed";
  result?: string;
  error?: string;
}
