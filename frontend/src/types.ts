export interface Job {
  id: string;
  status: string | null;
  result: string | null;
}

export type JobsState = (x: Job[]) => void;
export type JobState = (x: Job) => void;
