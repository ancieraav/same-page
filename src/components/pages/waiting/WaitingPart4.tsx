export function WaitingPart4() {
  return (
    <div className={"doc-lightbox-overlay"} id={"doc-lightbox-overlay"} style={{ display: "none" }} aria-hidden={"true"}>
      <div className={"doc-lightbox-modal"}>
        <div className={"doc-lightbox-header"}>
          <div className={"doc-lightbox-meta"}>
            <span className={"doc-lightbox-pill"} id={"lightbox-file-ext"}>
              PDF
            </span>
            <span className={"doc-lightbox-title"} id={"lightbox-file-name"}>
              Q3_Product_Strategy.pdf
            </span>
            <span className={"doc-lightbox-size"} id={"lightbox-file-size"}>
              2.4 MB
            </span>
          </div>
          <div className={"doc-lightbox-actions"}>
            <a href={"#"} target={"_blank"} className={"btn-lightbox-pill"} id={"lightbox-open-external"} title={"Open full file in new tab"}>
              <svg width={"14"} height={"14"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2"}>
                <path d={"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"}></path>
                <polyline points={"15 3 21 3 21 9"}></polyline>
                <line x1={"10"} y1={"14"} x2={"21"} y2={"3"}></line>
              </svg>
              <span>
                Open in tab
              </span>
            </a>
            <button type={"button"} className={"btn-lightbox-close"} id={"lightbox-close-btn"} aria-label={"Close preview"}>
              <svg width={"18"} height={"18"} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"2.5"}>
                <line x1={"18"} y1={"6"} x2={"6"} y2={"18"}></line>
                <line x1={"6"} y1={"6"} x2={"18"} y2={"18"}></line>
              </svg>
            </button>
          </div>
        </div>
        <div className={"doc-lightbox-body"} id={"lightbox-body"}></div>
      </div>
    </div>
  );
}
