// 요일 인코딩: 0=월 1=화 2=수 3=목 4=금 5=토 6=일
// 슬롯 인코딩: 08:00~24:00 을 30분 단위로 나눈 0~31 (32개)
export const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;
export const SLOT_COUNT = 32;
export const START_HOUR = 8;

export function isWeekend(dayIndex: number): boolean {
  return dayIndex === 5 || dayIndex === 6;
}

export function slotToHourMinute(slot: number): { hour: number; minute: number } {
  const hour = START_HOUR + Math.floor(slot / 2);
  const minute = slot % 2 === 0 ? 0 : 30;
  return { hour, minute };
}

export function slotLabel(slot: number): string {
  const { hour, minute } = slotToHourMinute(slot);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function encode(day: number, slot: number): number {
  return day * 100 + slot;
}

export function decode(code: number): { day: number; slot: number } {
  return { day: Math.floor(code / 100), slot: code % 100 };
}

export const WEEKDAY_EVENING_START_SLOT = (18 - START_HOUR) * 2; // 18:00
