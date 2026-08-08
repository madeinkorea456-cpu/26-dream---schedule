import { Member, Dept } from "./types";
import { DAYS, SLOT_COUNT, encode } from "./time";

export type DeptFilter = "all" | Dept;
export type PlanSubFilter = "all" | "campus";

export function filterByDept(
  members: Member[],
  deptFilter: DeptFilter,
  subFilter: PlanSubFilter
): Member[] {
  let list = members;
  if (deptFilter !== "all") {
    list = list.filter((m) => m.dept === deptFilter);
  }
  if (deptFilter === "plan" && subFilter === "campus") {
    list = list.filter((m) => m.campus);
  }
  return list;
}

export function applyNameFilter(members: Member[], nameFilter: Set<string>): Member[] {
  if (nameFilter.size === 0) return members;
  return members.filter((m) => nameFilter.has(m.id));
}

export interface DayRange {
  day: number;
  ranges: [number, number][]; // [startSlot, endSlotExclusive]
}

export function computeFullOverlap(members: Member[]): DayRange[] {
  const result: DayRange[] = [];
  if (members.length === 0) return result;
  const sets = members.map((m) => new Set(m.avail));
  for (let d = 0; d < DAYS.length; d++) {
    const ranges: [number, number][] = [];
    let curStart: number | null = null;
    for (let s = 0; s < SLOT_COUNT; s++) {
      const code = encode(d, s);
      const allHave = sets.every((set) => set.has(code));
      if (allHave) {
        if (curStart === null) curStart = s;
      } else if (curStart !== null) {
        ranges.push([curStart, s]);
        curStart = null;
      }
    }
    if (curStart !== null) ranges.push([curStart, SLOT_COUNT]);
    if (ranges.length > 0) result.push({ day: d, ranges });
  }
  return result;
}

export function membersAvailableAt(members: Member[], day: number, slot: number): Member[] {
  const code = encode(day, slot);
  return members.filter((m) => m.avail.includes(code));
}

export function membersAvailableForRange(
  members: Member[],
  day: number,
  startSlot: number,
  endSlot: number
): Member[] {
  if (endSlot <= startSlot) return [];
  return members.filter((m) => {
    const set = new Set(m.avail);
    for (let s = startSlot; s < endSlot; s++) {
      if (!set.has(encode(day, s))) return false;
    }
    return true;
  });
}
