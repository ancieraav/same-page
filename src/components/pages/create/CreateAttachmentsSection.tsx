'use client';

import Image from 'next/image';
import type { ChangeEvent, DragEvent, RefObject } from 'react';

export interface Attachment {
  id: string;
  file: File;
  name: string;
  size: string;
  ext: string;
  isImage: boolean;
  url: string;
}

interface CreateAttachmentsSectionProps {
  attachments: Attachment[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  activeAttachment: Attachment | null;
  onAddFiles: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  onSelect: (item: Attachment | null) => void;
}

export function CreateAttachmentsSection({
  attachments,
  fileInputRef,
  activeAttachment,
  onAddFiles,
  onRemove,
  onSelect,
}: CreateAttachmentsSectionProps) {
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onAddFiles(event.dataTransfer.files);
  };

  return (
    <div className="clean-form-row">
      <div className="clean-label-row">
        <label className="clean-label" htmlFor="file-input">
          Attachments <span className="clean-optional">(optional)</span>
        </label>
        {attachments.length > 0 && <span className="attachment-counter-pill">{attachments.length} of 20</span>}
      </div>
      <p className="clean-hint">
        Upload up to 20 documents or images to share with the room (PDF, Word, Excel, PNG, JPG up to 25MB each). Click any document to view its content.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        id="file-input"
        multiple
        hidden
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        aria-label="Upload documents"
        onChange={(event: ChangeEvent<HTMLInputElement>) => { onAddFiles(event.target.files); }}
      />
      <div className="attachment-box-container">
        {attachments.length === 0 ? (
          <div
            className="attachment-dropzone"
            tabIndex={0}
            role="button"
            aria-label="Upload attachments"
            onClick={() => { fileInputRef.current?.click(); }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => { event.preventDefault(); }}
            onDrop={onDrop}
          >
            <div className="upload-icon-frame">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="upload-text-main">
              <span className="upload-link-text">Click to choose files</span> or drag &amp; drop
            </div>
            <div className="upload-text-sub">Add up to 20 files (PDF, PNG, JPG, DOCX, XLSX up to 25MB each)</div>
          </div>
        ) : (
          <div className="attachments-list-wrapper">
            <div className="attachments-items-grid">
              {attachments.map((item) => (
                <div className="attachment-file-card" key={item.id}>
                  <button
                    type="button"
                    className="file-card-main-click"
                    onClick={() => { onSelect(item); }}
                    title={`Preview ${item.name}`}
                  >
                    {item.isImage ? (
                      <div className="file-card-thumb">
                        <Image src={item.url} alt={item.name} width={44} height={44} unoptimized />
                      </div>
                    ) : (
                      <div className="file-card-icon-badge">
                        <span>{item.ext}</span>
                      </div>
                    )}
                    <div className="file-card-details">
                      <div className="file-card-name">{item.name}</div>
                      <div className="file-card-meta">
                        <span>{item.size}</span>
                        <span className="file-card-pill">{item.ext}</span>
                      </div>
                    </div>
                  </button>
                  <div className="file-card-actions">
                    <button type="button" className="btn-file-pill btn-file-view" onClick={() => { onSelect(item); }}>
                      View
                    </button>
                    <button
                      type="button"
                      className="btn-file-pill btn-file-del"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => { onRemove(item.id); }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="attachment-add-more-bar">
              <button type="button" className="btn-add-more-files" onClick={() => { fileInputRef.current?.click(); }}>
                + Add more documents
              </button>
              <span className="add-more-hint-text">or drop additional files here</span>
            </div>
          </div>
        )}
      </div>

      {activeAttachment && (
        <div
          className="doc-lightbox-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              onSelect(null);
            }
          }}
        >
          <dialog
            open
            className="doc-lightbox-modal"
            aria-labelledby="attachment-preview-title"
            style={{ padding: 0, border: 'none', margin: 'auto', color: 'inherit' }}
          >
            <div className="doc-lightbox-header">
              <div className="doc-lightbox-meta">
                <span className="doc-lightbox-pill">{activeAttachment.ext}</span>
                <span className="doc-lightbox-title" id="attachment-preview-title">
                  {activeAttachment.name}
                </span>
                <span className="doc-lightbox-size">{activeAttachment.size}</span>
              </div>
              <button
                type="button"
                className="btn-lightbox-close"
                onClick={() => { onSelect(null); }}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
            <div className="doc-lightbox-body">
              {activeAttachment.isImage ? (
                <Image
                  className="lightbox-image-preview"
                  src={activeAttachment.url}
                  alt={activeAttachment.name}
                  width={800}
                  height={600}
                  unoptimized
                />
              ) : (
                <div className="lightbox-doc-card">
                  <div className="lightbox-doc-name">{activeAttachment.name}</div>
                  <div className="lightbox-doc-sub">
                    {activeAttachment.ext} Document · {activeAttachment.size}
                  </div>
                  <a className="btn-file-pill" href={activeAttachment.url} download={activeAttachment.name}>
                    Download Original File
                  </a>
                </div>
              )}
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}
