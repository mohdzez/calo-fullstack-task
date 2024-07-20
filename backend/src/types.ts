export interface Job {
  id: string;
  status: "pending" | "resolved" | "failed" | string;
  result: string | null;
}
