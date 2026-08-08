export type TabId = "start" | "my" | "all";

const TAB_ITEMS: { id: TabId; label: string }[] = [
  { id: "start", label: "시작" },
  { id: "my", label: "내 시간표" },
  { id: "all", label: "전체 보기" },
];

export function Tabs({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {TAB_ITEMS.map((item, i) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={active === item.id}
          className="tab"
          onClick={() => onChange(item.id)}
        >
          <span className="tab-num">{String(i + 1).padStart(2, "0")}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
