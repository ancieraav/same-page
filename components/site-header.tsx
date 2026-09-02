import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="brand-lockup" aria-label="Same Page">
          <span className="brand-logo-frame">
            <img
              className="brand-logo"
              src="/samepage-logo.svg"
              alt=""
              aria-hidden="true"
            />
          </span>
          <span className="brand-name">Same Page</span>
        </div>

        <nav className="main-nav" aria-label="Primary navigation">
          <Avatar className="profile-avatar" aria-label="User profile">
            <AvatarFallback aria-hidden="true" />
          </Avatar>
        </nav>
      </div>
    </header>
  );
}
