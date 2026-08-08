"use client";

import { useEffect, useMemo, useState } from "react";
import { BrandBar } from "../components/BrandBar";
import { MyScheduleScreen } from "../components/MyScheduleScreen";
import { OverviewScreen } from "../components/OverviewScreen";
import { StartScreen } from "../components/StartScreen";
import { TabId, Tabs } from "../components/Tabs";
import { supabase } from "../lib/supabaseClient";
import { Member, Selection } from "../lib/types";

const MY_ID_KEY = "dream-schedule-my-id";

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("start");
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error: fetchError } = await supabase
        .from("dream_schedule_members")
        .select("id, name, dept, campus, avail")
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (fetchError) {
        setError("팀원 목록을 불러오지 못했어요. 새로고침해주세요.");
      } else if (data) {
        setMembers(data as Member[]);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(MY_ID_KEY);
    if (stored) setMyId(stored);
  }, []);

  useEffect(() => {
    if (loading || !myId) return;
    if (!members.some((m) => m.id === myId)) {
      setMyId(null);
      window.localStorage.removeItem(MY_ID_KEY);
    }
  }, [loading, members, myId]);

  const myMember = useMemo(() => members.find((m) => m.id === myId) ?? null, [members, myId]);

  function rememberMyId(id: string) {
    setMyId(id);
    window.localStorage.setItem(MY_ID_KEY, id);
  }

  async function handleProceed(selection: Selection) {
    setError(null);
    setSubmitting(true);
    try {
      if (selection.type === "pick") {
        rememberMyId(selection.id);
      } else {
        const { data, error: insertError } = await supabase
          .from("dream_schedule_members")
          .insert({ name: selection.name, dept: selection.dept, campus: selection.campus })
          .select("id, name, dept, campus, avail")
          .single();
        if (insertError || !data) {
          setError("등록에 실패했어요. 다시 시도해주세요.");
          return;
        }
        const created = data as Member;
        setMembers((prev) => [...prev, created]);
        rememberMyId(created.id);
      }
      setActiveTab("my");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveSchedule(avail: number[]) {
    if (!myId) return;
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("dream_schedule_members")
      .update({ avail, updated_at: new Date().toISOString() })
      .eq("id", myId);
    setSaving(false);
    if (updateError) {
      setError("저장에 실패했어요. 다시 시도해주세요.");
      throw updateError;
    }
    setMembers((prev) => prev.map((m) => (m.id === myId ? { ...m, avail } : m)));
  }

  return (
    <div className="app">
      <BrandBar />
      <div className="app-top">
        <h1>26기 드림이 활동가능 시간표</h1>
        <p className="app-note">
          전체회의 시간과 캠퍼스투어 등 행사 인원을 조율하기 위한 시간표예요. 본인을 선택하고
          활동 가능한 시간을 칠한 뒤 저장하면, 전체 보기 탭에서 팀원 전체의 시간을 한눈에 볼 수
          있어요.
        </p>
        {error && (
          <p className="app-note" style={{ color: "var(--gold-ink)" }}>
            {error}
          </p>
        )}
      </div>

      <Tabs active={activeTab} onChange={setActiveTab} />

      {loading ? (
        <p className="empty-note">불러오는 중...</p>
      ) : (
        <>
          {activeTab === "start" && (
            <StartScreen
              members={members}
              myId={myId}
              submitting={submitting}
              onProceed={handleProceed}
            />
          )}
          {activeTab === "my" && (
            <MyScheduleScreen member={myMember} saving={saving} onSave={handleSaveSchedule} />
          )}
          {activeTab === "all" && <OverviewScreen members={members} />}
        </>
      )}
    </div>
  );
}
