"use client";

import { useEffect, useRef, useState } from "react";
import { DEPT_LABEL, Member, ScheduleUpdate, SlotState } from "../lib/types";
import {
  DAYS,
  SLOT_COUNT,
  WEEKDAY_EVENING_START_SLOT,
  encode,
  isHourMark,
  isWeekend,
  slotLabel,
} from "../lib/time";

type Brush = SlotState | "erase";

const BRUSH_ITEMS: { id: Brush; label: string; dotClass: string }[] = [
  { id: "avail", label: "가능", dotClass: "avail" },
  { id: "class", label: "수업", dotClass: "class" },
  { id: "job", label: "알바", dotClass: "job" },
  { id: "erase", label: "지우기", dotClass: "" },
];

function buildSlotMap(member: Member | null): Map<number, SlotState> {
  const map = new Map<number, SlotState>();
  if (!member) return map;
  for (const code of member.availSlots) map.set(code, "avail");
  for (const code of member.classSlots) map.set(code, "class");
  for (const code of member.jobSlots) map.set(code, "job");
  return map;
}

export function MyScheduleScreen({
  member,
  saving,
  onSave,
}: {
  member: Member | null;
  saving: boolean;
  onSave: (update: ScheduleUpdate) => Promise<void> | void;
}) {
  const [slots, setSlots] = useState<Map<number, SlotState>>(new Map());
  const [brush, setBrush] = useState<Brush>("avail");
  const [showToast, setShowToast] = useState(false);
  const paintingRef = useRef<{ target: SlotState | null } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSlots(buildSlotMap(member));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id]);

  useEffect(() => {
    function stopPainting() {
      paintingRef.current = null;
    }
    window.addEventListener("pointerup", stopPainting);
    window.addEventListener("pointercancel", stopPainting);
    return () => {
      window.removeEventListener("pointerup", stopPainting);
      window.removeEventListener("pointercancel", stopPainting);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function applyCell(code: number, target: SlotState | null) {
    setSlots((prev) => {
      const next = new Map(prev);
      if (target === null) next.delete(code);
      else next.set(code, target);
      return next;
    });
  }

  function handlePointerDown(day: number, slot: number) {
    const code = encode(day, slot);
    const current = slots.get(code) ?? null;
    const target: SlotState | null =
      brush === "erase" ? null : current === brush ? null : brush;
    paintingRef.current = { target };
    applyCell(code, target);
  }

  function handlePointerEnter(day: number, slot: number) {
    if (!paintingRef.current) return;
    applyCell(encode(day, slot), paintingRef.current.target);
  }

  function clearAll() {
    setSlots(new Map());
  }

  function turnOnWeekend() {
    setSlots((prev) => {
      const next = new Map(prev);
      for (const day of [5, 6]) {
        for (let slot = 0; slot < SLOT_COUNT; slot++) next.set(encode(day, slot), "avail");
      }
      return next;
    });
  }

  function turnOnWeekdayEvening() {
    setSlots((prev) => {
      const next = new Map(prev);
      for (let day = 0; day < 5; day++) {
        for (let slot = WEEKDAY_EVENING_START_SLOT; slot < SLOT_COUNT; slot++) {
          next.set(encode(day, slot), "avail");
        }
      }
      return next;
    });
  }

  async function handleSave() {
    const availSlots: number[] = [];
    const classSlots: number[] = [];
    const jobSlots: number[] = [];
    slots.forEach((state, code) => {
      if (state === "avail") availSlots.push(code);
      else if (state === "class") classSlots.push(code);
      else jobSlots.push(code);
    });
    try {
      await onSave({ availSlots, classSlots, jobSlots });
      setShowToast(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setShowToast(false), 2200);
    } catch {
      // 에러 메시지는 상위 화면에서 노출됩니다.
    }
  }

  if (!member) {
    return (
      <div className="screen active">
        <div className="card">
          <h2>내 시간표 입력</h2>
          <p className="card-sub">먼저 &apos;시작&apos; 탭에서 본인을 선택하거나 등록해주세요.</p>
          <p className="empty-note">본인 확인 후 이 화면에서 시간표를 입력할 수 있어요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="card">
        <h2>내 시간표 입력</h2>
        <p className="card-sub">
          월~일, 08:00~24:00 중 아래 붓을 고른 뒤 칸을 클릭하거나 드래그해서 칠해주세요.
        </p>

        <div className="who-row">
          <span className="who-name">{member.name}님</span>
          <span className="who-tags">
            <span className={`tag ${member.dept}`}>{DEPT_LABEL[member.dept]}</span>
            {member.campus && <span className="tag campus">캠퍼스투어</span>}
          </span>
        </div>

        <div className="brush-row">
          {BRUSH_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`brush-btn brush-${item.id}`}
              aria-pressed={brush === item.id}
              onClick={() => setBrush(item.id)}
            >
              {item.dotClass && <span className={`brush-dot ${item.dotClass}`} />}
              {item.label}
            </button>
          ))}
        </div>

        <div className="legend">
          <span>
            <span className="swatch avail" /> 가능
          </span>
          <span>
            <span className="swatch class" /> 수업
          </span>
          <span>
            <span className="swatch job" /> 알바
          </span>
        </div>

        <div className="quick-actions">
          <button type="button" className="btn-ghost" onClick={clearAll}>
            모두 지우기
          </button>
          <button type="button" className="btn-ghost" onClick={turnOnWeekend}>
            주말 전체 켜기
          </button>
          <button type="button" className="btn-ghost" onClick={turnOnWeekdayEvening}>
            평일 저녁(18~24시) 켜기
          </button>
        </div>

        <div className="grid-scroll">
          <div className="sched-grid">
            <div className="corner" />
            {DAYS.map((d, i) => (
              <div key={d} className={`day-head ${isWeekend(i) ? "weekend" : ""}`}>
                {d}
              </div>
            ))}
            {Array.from({ length: SLOT_COUNT }).map((_, slot) => (
              <div key={slot} style={{ display: "contents" }}>
                <div className={`time-cell ${isHourMark(slot) ? "hour" : ""}`}>
                  {isHourMark(slot) ? slotLabel(slot) : ""}
                </div>
                {DAYS.map((_, day) => {
                  const state = slots.get(encode(day, slot));
                  return (
                    <div
                      key={day}
                      className={`cell input-cell ${state ? `state-${state}` : ""} ${
                        isHourMark(slot) ? "hour-line" : ""
                      }`}
                      onPointerDown={() => handlePointerDown(day, slot)}
                      onPointerEnter={() => handlePointerEnter(day, slot)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="grid-footer">
          <span className={`toast ${showToast ? "show" : ""}`}>저장되었습니다</span>
          <button
            type="button"
            className="btn-primary"
            style={{ width: "auto", flexShrink: 0 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
