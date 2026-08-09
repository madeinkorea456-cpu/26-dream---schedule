"use client";

import { useEffect, useMemo, useState } from "react";
import { Member } from "../lib/types";
import { DAYS, SLOT_COUNT, isHalfHourMark, isHourMark, slotLabel } from "../lib/time";
import {
  DeptFilter,
  PlanSubFilter,
  applyNameFilter,
  computeFullOverlap,
  filterByDept,
  membersAvailableAt,
  membersAvailableForRange,
  slotStateOf,
} from "../lib/schedule";

type ViewMode = "heatmap" | "table";

function NameChip({ member }: { member: Member }) {
  return (
    <span className="name-chip">
      <span className={`dot ${member.dept}`} />
      {member.name}
    </span>
  );
}

export function OverviewScreen({ members }: { members: Member[] }) {
  const [deptFilter, setDeptFilter] = useState<DeptFilter>("all");
  const [subFilter, setSubFilter] = useState<PlanSubFilter>("all");
  const [nameFilter, setNameFilter] = useState<Set<string>>(new Set());
  const [view, setView] = useState<ViewMode>("heatmap");
  const [selectedCell, setSelectedCell] = useState<{ day: number; slot: number } | null>(null);
  const [tableDay, setTableDay] = useState(0);

  const [helperDay, setHelperDay] = useState(0);
  const [helperStart, setHelperStart] = useState(44); // 19:00
  const [helperEnd, setHelperEnd] = useState(52); // 21:00
  const [helperResult, setHelperResult] = useState<{
    day: number;
    start: number;
    end: number;
    members: Member[];
  } | null>(null);

  const planCount = useMemo(() => members.filter((m) => m.dept === "plan").length, [members]);
  const contentCount = useMemo(
    () => members.filter((m) => m.dept === "content").length,
    [members]
  );
  const campusCount = useMemo(
    () => members.filter((m) => m.dept === "plan" && m.campus).length,
    [members]
  );

  const deptFiltered = useMemo(
    () => filterByDept(members, deptFilter, subFilter),
    [members, deptFilter, subFilter]
  );

  useEffect(() => {
    setNameFilter((prev) => {
      const validIds = new Set(deptFiltered.map((m) => m.id));
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (validIds.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [deptFiltered]);

  const filtered = useMemo(
    () => applyNameFilter(deptFiltered, nameFilter),
    [deptFiltered, nameFilter]
  );

  const overlapRanges = useMemo(() => computeFullOverlap(filtered), [filtered]);

  const cellDetail = useMemo(() => {
    if (!selectedCell) return null;
    return membersAvailableAt(filtered, selectedCell.day, selectedCell.slot);
  }, [filtered, selectedCell]);

  function toggleName(id: string) {
    setNameFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runHelper() {
    setHelperResult({
      day: helperDay,
      start: helperStart,
      end: helperEnd,
      members: membersAvailableForRange(filtered, helperDay, helperStart, helperEnd),
    });
  }

  return (
    <div className="screen active">
      <div className="card">
        <h2>필터</h2>
        <p className="card-sub">부서와 이름으로 좁혀서 팀 시간표를 확인하세요.</p>

        <div className="chip-row">
          <button
            type="button"
            className="chip"
            aria-pressed={deptFilter === "all"}
            onClick={() => {
              setDeptFilter("all");
              setSubFilter("all");
            }}
          >
            전체<span className="n">{members.length}</span>
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={deptFilter === "plan"}
            onClick={() => {
              setDeptFilter("plan");
              setSubFilter("all");
            }}
          >
            기획부<span className="n">{planCount}</span>
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={deptFilter === "content"}
            onClick={() => setDeptFilter("content")}
          >
            컨텐츠부<span className="n">{contentCount}</span>
          </button>
        </div>

        {deptFilter === "plan" && (
          <div className="chip-row sub">
            <button
              type="button"
              className="chip"
              aria-pressed={subFilter === "all"}
              onClick={() => setSubFilter("all")}
            >
              기획부 전체<span className="n">{planCount}</span>
            </button>
            <button
              type="button"
              className="chip"
              aria-pressed={subFilter === "campus"}
              onClick={() => setSubFilter("campus")}
            >
              캠퍼스투어팀만<span className="n">{campusCount}</span>
            </button>
          </div>
        )}

        <div className="name-filter-row">
          <div className="name-filter-head">
            <label className="field-label" style={{ margin: 0 }}>
              이름으로 좁히기
            </label>
            {nameFilter.size > 0 && (
              <button type="button" className="btn-ghost" onClick={() => setNameFilter(new Set())}>
                초기화
              </button>
            )}
          </div>
          {deptFiltered.length === 0 ? (
            <p className="empty-note">해당 조건의 인원이 없어요.</p>
          ) : (
            <div className="chip-row">
              {deptFiltered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="chip name-chip-filter"
                  aria-pressed={nameFilter.has(m.id)}
                  onClick={() => toggleName(m.id)}
                >
                  <span className={`dot ${m.dept}`} />
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="full-summary">
          {filtered.length === 0 ? (
            <span className="empty-note">표시할 인원이 없어요.</span>
          ) : (
            <>
              <strong>{filtered.length}명</strong> 전원이 활동 가능한 시간대예요.
              <div className="chips">
                {overlapRanges.length === 0 ? (
                  <span>겹치는 시간이 없어요</span>
                ) : (
                  overlapRanges.flatMap((dr) =>
                    dr.ranges.map(([s, e], idx) => (
                      <span key={`${dr.day}-${idx}`}>
                        {DAYS[dr.day]} {slotLabel(s)}–{slotLabel(e)}
                      </span>
                    ))
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <h2>팀 시간표 보기</h2>
        <p className="card-sub">히트맵으로 한눈에 보거나, 표로 상세히 확인하세요.</p>

        <div className="view-toggle">
          <button type="button" aria-pressed={view === "heatmap"} onClick={() => setView("heatmap")}>
            히트맵
          </button>
          <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}>
            표로 보기
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="empty-note">표시할 인원이 없어요.</p>
        ) : view === "heatmap" ? (
          <>
            <div className="legend">
              <span>
                <span className="swatch on" /> 일부 가능
              </span>
              <span>
                <span className="swatch full" /> 전원 가능
              </span>
            </div>
            <div className="grid-scroll">
              <div className="sched-grid">
                <div className="corner" />
                {DAYS.map((d, i) => (
                  <div key={d} className={`day-head ${i >= 5 ? "weekend" : ""}`}>
                    {d}
                  </div>
                ))}
                {Array.from({ length: SLOT_COUNT }).map((_, slot) => (
                  <div key={slot} style={{ display: "contents" }}>
                    <div className={`time-cell ${isHourMark(slot) ? "hour" : ""}`}>
                      {isHalfHourMark(slot) ? slotLabel(slot) : ""}
                    </div>
                    {DAYS.map((_, day) => {
                      const count = membersAvailableAt(filtered, day, slot).length;
                      const ratio = filtered.length > 0 ? count / filtered.length : 0;
                      const isFull = filtered.length > 0 && count === filtered.length;
                      const isSelected =
                        selectedCell?.day === day && selectedCell?.slot === slot;
                      return (
                        <div
                          key={day}
                          className={`cell heat-cell ${isFull ? "full" : ""} ${
                            isSelected ? "selected" : ""
                          } ${isHourMark(slot) ? "hour-line" : ""}`}
                          style={{
                            backgroundColor:
                              ratio > 0
                                ? `color-mix(in oklab, var(--accent) ${Math.round(
                                    ratio * 100
                                  )}%, var(--surface))`
                                : undefined,
                          }}
                          onClick={() => setSelectedCell({ day, slot })}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="detail-panel">
              {selectedCell ? (
                <>
                  <div className="detail-head">
                    {DAYS[selectedCell.day]} {slotLabel(selectedCell.slot)}–
                    {slotLabel(selectedCell.slot + 1)}{" "}
                    <span className="muted">({cellDetail?.length ?? 0}명 가능)</span>
                  </div>
                  {cellDetail && cellDetail.length > 0 ? (
                    <div className="name-chips">
                      {cellDetail.map((m) => (
                        <NameChip key={m.id} member={m} />
                      ))}
                    </div>
                  ) : (
                    <p className="empty-note">이 시간대에 가능한 인원이 없어요.</p>
                  )}
                </>
              ) : (
                <p className="empty-note">칸을 클릭하면 그 시간에 가능한 인원을 볼 수 있어요.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="table-day-row">
              <label className="field-label" style={{ margin: 0, flexShrink: 0 }}>
                요일
              </label>
              <select value={tableDay} onChange={(e) => setTableDay(Number(e.target.value))}>
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}요일
                  </option>
                ))}
              </select>
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
            <div className="excel-scroll">
              <div
                className="excel-grid"
                style={{ gridTemplateColumns: `88px repeat(${SLOT_COUNT}, 26px)` }}
              >
                <div className="excel-corner" />
                {Array.from({ length: SLOT_COUNT }).map((_, slot) => (
                  <div key={slot} className="excel-timehead">
                    {isHalfHourMark(slot) ? slotLabel(slot) : ""}
                  </div>
                ))}
                {filtered.map((m) => (
                  <div key={m.id} style={{ display: "contents" }}>
                    <div className={`excel-name ${m.dept}`}>{m.name}</div>
                    {Array.from({ length: SLOT_COUNT }).map((_, slot) => {
                      const state = slotStateOf(m, tableDay, slot);
                      return (
                        <div key={slot} className="excel-dot">
                          {state && <span className={`mark ${state}`} />}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h2>이벤트 배정 도우미</h2>
        <p className="card-sub">
          요일과 시작·종료 시간을 정하면 현재 필터 기준으로 전원 가능한 인원을 찾아드려요.
        </p>
        <div className="helper-row">
          <select value={helperDay} onChange={(e) => setHelperDay(Number(e.target.value))}>
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}요일
              </option>
            ))}
          </select>
          <select value={helperStart} onChange={(e) => setHelperStart(Number(e.target.value))}>
            {Array.from({ length: SLOT_COUNT }).map((_, s) => (
              <option key={s} value={s}>
                {slotLabel(s)}
              </option>
            ))}
          </select>
          <select value={helperEnd} onChange={(e) => setHelperEnd(Number(e.target.value))}>
            {Array.from({ length: SLOT_COUNT + 1 }).map((_, s) => (
              <option key={s} value={s}>
                {slotLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={runHelper}>
          가능 인원 조회
        </button>

        {helperResult && (
          <div className="helper-result">
            <p className="helper-count">
              {DAYS[helperResult.day]} {slotLabel(helperResult.start)}~
              {slotLabel(helperResult.end)} · 전체 가능 인원 {helperResult.members.length}명
            </p>
            {helperResult.members.length > 0 ? (
              <div className="name-chips">
                {helperResult.members.map((m) => (
                  <NameChip key={m.id} member={m} />
                ))}
              </div>
            ) : (
              <p className="empty-note">해당 시간대에 가능한 인원이 없어요.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
