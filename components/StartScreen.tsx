"use client";

import { useMemo, useState } from "react";
import { DreamWordmark } from "./DreamLogo";
import { Dept, DEPT_LABEL, Member, Selection } from "../lib/types";

export function StartScreen({
  members,
  myId,
  submitting,
  onProceed,
}: {
  members: Member[];
  myId: string | null;
  submitting: boolean;
  onProceed: (selection: Selection) => void;
}) {
  const [mode, setMode] = useState<"pick" | "new">("pick");
  const [pickedId, setPickedId] = useState<string | null>(myId);
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState<Dept>("plan");
  const [newCampus, setNewCampus] = useState(false);

  const canProceed = useMemo(() => {
    if (mode === "pick") return !!pickedId;
    return newName.trim().length > 0;
  }, [mode, pickedId, newName]);

  function handlePick(id: string) {
    setMode("pick");
    setPickedId(id);
  }

  function handleSubmit() {
    if (!canProceed || submitting) return;
    if (mode === "pick" && pickedId) {
      onProceed({ type: "pick", id: pickedId });
    } else if (mode === "new") {
      onProceed({
        type: "new",
        name: newName.trim(),
        dept: newDept,
        campus: newDept === "plan" ? newCampus : false,
      });
    }
  }

  return (
    <div className="screen active">
      <div className="hero-logo">
        <DreamWordmark />
      </div>
      <p className="hero-caption">INCHEON NATIONAL UNIVERSITY · STUDENT AMBASSADOR</p>

      <div className="card">
        <h2>누구세요?</h2>
        <p className="card-sub">
          이미 등록된 팀원이면 이름을 눌러 선택하고, 처음이면 아래에서 새로 등록해주세요.
        </p>

        {members.length > 0 && (
          <div className="member-list">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                className="member-row"
                aria-pressed={mode === "pick" && pickedId === m.id}
                onClick={() => handlePick(m.id)}
              >
                <span className={`dot ${m.dept}`} />
                <span className="member-name">{m.name}</span>
                <span className="member-tags">
                  <span className={`tag ${m.dept}`}>{DEPT_LABEL[m.dept]}</span>
                  {m.campus && <span className="tag campus">캠퍼스투어</span>}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="divider-row">또는 새로 등록하기</div>

        <label className="field-label" htmlFor="new-name">
          이름
        </label>
        <input
          id="new-name"
          type="text"
          placeholder="이름을 입력하세요"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setMode("new");
          }}
          onFocus={() => setMode("new")}
        />

        <label className="field-label">부서</label>
        <div className="segmented">
          <button
            type="button"
            className="seg-btn plan-on"
            aria-pressed={newDept === "plan"}
            onClick={() => {
              setNewDept("plan");
              setMode("new");
            }}
          >
            기획부
          </button>
          <button
            type="button"
            className="seg-btn content-on"
            aria-pressed={newDept === "content"}
            onClick={() => {
              setNewDept("content");
              setMode("new");
            }}
          >
            컨텐츠부
          </button>
        </div>

        {newDept === "plan" && (
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={newCampus}
              onChange={(e) => {
                setNewCampus(e.target.checked);
                setMode("new");
              }}
            />
            캠퍼스투어팀 소속
          </label>
        )}

        <button
          type="button"
          className="btn-primary"
          disabled={!canProceed || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "처리 중..." : "내 시간표 입력하러 가기"}
        </button>
      </div>
    </div>
  );
}
