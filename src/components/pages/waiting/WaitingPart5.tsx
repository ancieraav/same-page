export function WaitingPart5() {
  return (
    <div className={"share-roles-overlay"} id={"share-roles-overlay"} style={{ display: "none" }} aria-hidden={"true"}>
      <div className={"share-roles-modal"}>
        <div className={"share-roles-header"}>
          <div>
            <h3 className={"share-modal-title"}>
              Invite &amp; Role Access Codes
            </h3>
            <p className={"share-modal-sub"}>
              Participants who join using a role code or link will be automatically assigned to that role without manual selection.
            </p>
          </div>
          <button type={"button"} className={"btn-lightbox-close"} id={"btn-close-share-modal"} aria-label={"Close modal"}>
            <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}>
              <line x1={"18"} y1={"6"} x2={"6"} y2={"18"}></line>
              <line x1={"6"} y1={"6"} x2={"18"} y2={"18"}></line>
            </svg>
          </button>
        </div>
        <div className={"share-roles-body"} id={"share-roles-body"}></div>
      </div>
    </div>
  );
}
