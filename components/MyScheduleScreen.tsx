"use client";

import { useEffect, useRef, useState } from "react";
import { DEPT_LABEL, Member } from "../lib/types";
import { DAYS, SLOT_COUNT, WEEKDAY_EVENING_START_SLOT, encode, isWeekend, slotLabel } from "../lib/time";

type PaintMode = "on" | "off";

export function MyScheduleScreen({
  member,
  saving,
  onSave,
}: {
  member: Member | null;
  saving: boolean;
  onSave: (avail: number[]) => Promise<void> | void;
}) {
  const [avail, setAvail] = useState<Set<number>>(new Set());
  const [showToast, setShowToast] = useState(false);
  const paintingRef = useRef<{ mode: PaintMode } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAvail(new Set(member?.avail ?? []));
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

  function applyCell(day: number, slot: number, mode: PaintMode) {
    const code = encode(day, slot);
    setAvail((prev) => {
      const next = new Set(prev);
      if (mode === "on") next.add(code);
      else next.delete(code);
      return next;
    });
  }

  function handlePointerDown(day: number, slot: number) {
    const code = encode(day, slot);
    const mode: PaintMode = avail.has(code) ? "off" : "on";
    paintingRef.current = { mode };
    applyCell(day, slot, mode);
  }

  function handlePointerEnter(day: number, slot: number) {
    if (!paintingRef.current) return;
    applyCell(day, slot, paintingRef.current.mode);
  }

  function clearAll() {
    setAvail(new Set());
  }

  function turnOnWeekend() {
    setAvail((prev) => {
      const next = new Set(prev);
      for (const day of [5, 6]) {
        for (let slot = 0; slot < SLOT_COUNT; slot++) next.add(encode(day, slot));
      }
      return next;
    });
  }

  function turnOnWeekdayEvening() {
    setAvail((prev) => {
      const next = new Set(prev);
      for (let day = 0; day < 5; day++) {
        for (let slot = WEEKDAY_EVENING_START_SLOT; slot < SLOT_COUNT; slot++) {
          next.add(encode(day, slot));
        }
      }
      return next;
    });
  }

  async function handleSave() {
    try {
      await onSave(Array.from(avail));
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
          월~일, 08:00~24:00 중 활동 가능한 시간을 칠해주세요. 클릭하거나 드래그하면 여러 칸을 한
          번에 칠할 수 있어요.
        </p>

        <div className="who-row">
          <span className="who-name">{member.name}님</span>
          <span className="who-tags">
            <span className={`tag ${member.dept}`}>{DEPT_LABEL[member.dept]}</span>
            {member.campus && <span className="tag campus">캠퍼스투어</span>}
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
                <div className={`time-cell ${slot % 2 === 0 ? "hour" : ""}`}>
                  {slot % 2 === 0 ? slotLabel(slot) : ""}
                </div>
                {DAYS.map((_, day) => {
                  const on = avail.has(encode(day, slot));
                  return (
                    <div
                      key={day}
                      className={`cell input-cell ${on ? "on" : ""} ${
                        slot % 2 === 0 ? "hour-line" : ""
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
