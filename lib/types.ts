export type Dept = "plan" | "content";

export interface Member {
  id: string;
  name: string;
  dept: Dept;
  campus: boolean;
  availSlots: number[];
  classSlots: number[];
  jobSlots: number[];
}

export const DEPT_LABEL: Record<Dept, string> = {
  plan: "기획부",
  content: "컨텐츠부",
};

export type Selection =
  | { type: "pick"; id: string }
  | { type: "new"; name: string; dept: Dept; campus: boolean };

// 시간표 한 칸의 상태: 가능(파랑) / 수업(회색) / 알바(골드) / 미입력
export type SlotState = "avail" | "class" | "job";

export interface ScheduleUpdate {
  availSlots: number[];
  classSlots: number[];
  jobSlots: number[];
}
