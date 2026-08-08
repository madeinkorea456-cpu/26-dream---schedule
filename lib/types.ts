export type Dept = "plan" | "content";

export interface Member {
  id: string;
  name: string;
  dept: Dept;
  campus: boolean;
  avail: number[];
}

export const DEPT_LABEL: Record<Dept, string> = {
  plan: "기획부",
  content: "컨텐츠부",
};

export type Selection =
  | { type: "pick"; id: string }
  | { type: "new"; name: string; dept: Dept; campus: boolean };
