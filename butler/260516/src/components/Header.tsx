import { PanelRightOpen, Search } from "lucide-react";

type HeaderProps = {
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  onToggleRightPanel: () => void;
};

export function Header({ title, query, onQueryChange, onToggleRightPanel }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <h1>{title}</h1>
        <p>AI가 개인 상황에 맞춰 포트폴리오를 설계하는 서민형 금융 에이전트</p>
      </div>
      <label className="search-box">
        <Search size={17} />
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="기업명, 티커, 공시 검색" />
      </label>
      <button type="button" className="login-button">로그인</button>
      <button type="button" className="icon-only" aria-label="우측 패널" onClick={onToggleRightPanel}>
        <PanelRightOpen size={18} />
      </button>
    </header>
  );
}
