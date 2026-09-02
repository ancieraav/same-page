"use client";

import Link from "next/link";
import {
  ChevronLeftIcon,
  FileIcon,
  PencilIcon,
  PlusIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";
import {
  Attachment,
  AttachmentActions,
  AttachmentAction,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type YesNo = "no" | "yes";
type ParticipantMode = "flexible" | "fixed";

type RoleRow = {
  id: number;
  value: string;
  editing: boolean;
};

const DEFAULT_ROLE = "Source of truth";
const EDIT_ROLE_VALUE = "__edit-role__";
const NEW_ROLE_VALUE = "__new-role__";

function ChoiceGroup({
  name,
  value,
  onValueChange,
  options,
}: {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <RadioGroup
      className="choice-group"
      value={value}
      onValueChange={onValueChange}
      aria-label={name}
    >
      {options.map((option) => {
        const id = `${name}-${option.value}`.replace(/\s+/g, "-").toLowerCase();
        return (
          <label className="choice-option" key={option.value} htmlFor={id}>
            <RadioGroupItem id={id} value={option.value} />
            <span>{option.label}</span>
          </label>
        );
      })}
    </RadioGroup>
  );
}

function QuestionNumber({ children }: { children: string }) {
  return (
    <span className="question-number" aria-hidden="true">
      {children}
    </span>
  );
}

function QuestionText({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <>
      <QuestionNumber>{number}</QuestionNumber>
      {children}
    </>
  );
}

function TextQuestion({
  number,
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  number: string;
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <section className="form-section" aria-labelledby={`${id}-label`}>
      <div className="field-heading">
        <label id={`${id}-label`} htmlFor={id}>
          <QuestionText number={number}>{label}</QuestionText>
        </label>
      </div>
      <Input
        id={id}
        className="text-question-input"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </section>
  );
}

export function CreateRoomForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [roomName, setRoomName] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [participantMode, setParticipantMode] =
    useState<ParticipantMode>("flexible");
  const [participantCount, setParticipantCount] = useState("");
  const [useMemes, setUseMemes] = useState<YesNo>("no");
  const [useRoles, setUseRoles] = useState<YesNo>("no");
  const [separateAccess, setSeparateAccess] = useState<YesNo>("no");
  const [shareResponses, setShareResponses] = useState<YesNo>("no");
  const [anonymousNames, setAnonymousNames] = useState<YesNo>("yes");
  const [roleOptions, setRoleOptions] = useState([DEFAULT_ROLE]);
  const [roles, setRoles] = useState<RoleRow[]>([
    { id: 1, value: DEFAULT_ROLE, editing: false },
  ]);

  function handleAttachment(event: ChangeEvent<HTMLInputElement>) {
    setAttachment(event.target.files?.[0] ?? null);
  }

  function clearAttachment() {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function updateRole(id: number, updates: Partial<RoleRow>) {
    setRoles((current) =>
      current.map((role) => (role.id === id ? { ...role, ...updates } : role)),
    );
  }

  function selectRole(id: number, value: string) {
    if (value === EDIT_ROLE_VALUE) {
      updateRole(id, { editing: true });
      return;
    }

    if (value === NEW_ROLE_VALUE) {
      updateRole(id, { value: "", editing: true });
      return;
    }

    updateRole(id, { value, editing: false });
  }

  function finishRoleEdit(id: number, value: string) {
    const cleanValue = value.trim() || DEFAULT_ROLE;
    setRoleOptions((current) =>
      current.includes(cleanValue) ? current : [...current, cleanValue],
    );
    updateRole(id, { value: cleanValue, editing: false });
  }

  function removeRole(id: number) {
    setRoles((current) => current.filter((role) => role.id !== id));
  }

  return (
    <div className="create-room-shell">
      <SiteHeader />

      <main className="create-room-main">
        <section className="create-room-card" aria-labelledby="create-room-title">
          <div className="create-room-heading">
            <Button className="back-button" variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Back to join room">
                <ChevronLeftIcon aria-hidden="true" />
              </Link>
            </Button>
            <h1 id="create-room-title">Create room</h1>
          </div>

          <div className="create-room-form">
            <TextQuestion
              number="1."
              id="room-name"
              label="Room name"
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder="Give your room a name."
            />

            <TextQuestion
              number="2."
              id="room-topic"
              label="Topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="What is this room about?"
            />

            <section className="form-section" aria-labelledby="attachment-title">
              <div className="field-heading">
                <h2 id="attachment-title">
                  <QuestionText number="3.">Add attachment</QuestionText>
                </h2>
                <p>Upload one file to share with the room.</p>
              </div>

              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                onChange={handleAttachment}
                aria-label="Choose attachment"
              />
              <Button
                className="upload-button"
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon aria-hidden="true" />
                Upload attachment
              </Button>

              {attachment ? (
                <Attachment className="uploaded-file" aria-live="polite">
                  <AttachmentMedia>
                    <FileIcon aria-hidden="true" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{attachment.name}</AttachmentTitle>
                    <AttachmentDescription>
                      {(attachment.size / 1024).toFixed(1)} KB
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAttachment}
                      aria-label={`Cancel attachment ${attachment.name}`}
                    >
                      Cancel
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ) : null}
            </section>

            <section className="form-section" aria-labelledby="information-title">
              <div className="field-heading">
                <label id="information-title" htmlFor="additional-information">
                  <QuestionText number="4.">Any other information?</QuestionText>
                </label>
              </div>
              <Textarea
                id="additional-information"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add context, instructions, or anything participants should know."
                rows={5}
              />
            </section>

            <section className="form-section">
              <div className="question-parent">
                <h2 className="question-heading">
                  <QuestionText number="5.">Number of participants</QuestionText>
                </h2>
                <ChoiceGroup
                  name="participant-mode"
                  value={participantMode}
                  onValueChange={(value) =>
                    setParticipantMode(value as ParticipantMode)
                  }
                  options={[
                    { value: "flexible", label: "Flexible" },
                    { value: "fixed", label: "Fixed" },
                  ]}
                />
              </div>

              {participantMode === "fixed" ? (
                <div className="conditional-field">
                  <label htmlFor="participant-count">
                    <QuestionText number="5.1.">How many participants?</QuestionText>
                  </label>
                  <Input
                    id="participant-count"
                    className="number-input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={participantCount}
                    onChange={(event) => setParticipantCount(event.target.value)}
                    placeholder="10"
                  />
                </div>
              ) : null}
            </section>

            <section className="form-section">
              <div className="question-parent">
                <h2 className="question-heading">
                  <QuestionText number="6.">Use memes?</QuestionText>
                </h2>
                <ChoiceGroup
                  name="use-memes"
                  value={useMemes}
                  onValueChange={(value) => setUseMemes(value as YesNo)}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                />
              </div>
            </section>

            <section className="form-section">
              <div className="question-parent">
                <h2 className="question-heading">
                  <QuestionText number="7.">Use roles?</QuestionText>
                </h2>
                <ChoiceGroup
                  name="use-roles"
                  value={useRoles}
                  onValueChange={(value) => setUseRoles(value as YesNo)}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                />
              </div>

              {useRoles === "yes" ? (
                <div className="conditional-stack">
                  <div className="role-editor" aria-labelledby="role-editor-title">
                    <div className="role-editor-heading">
                      <h3 id="role-editor-title">
                        <QuestionText number="7.1.">
                          Which roles do you want to use?
                        </QuestionText>
                      </h3>
                    </div>

                    <div className="role-list">
                      {roles.map((role, index) => (
                        <div className="role-row" key={role.id}>
                          <span className="role-number" aria-hidden="true">
                            {index + 1}
                          </span>
                          {role.editing ? (
                            <Input
                              className="role-name-input"
                              autoFocus
                              defaultValue={role.value}
                              placeholder="Role name"
                              aria-label={`Role ${index + 1} name`}
                              onBlur={(event) =>
                                finishRoleEdit(role.id, event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  finishRoleEdit(role.id, event.currentTarget.value);
                                }
                              }}
                            />
                          ) : (
                            <Select
                              value={role.value}
                              onValueChange={(value) => selectRole(role.id, value)}
                            >
                              <SelectTrigger
                                className="role-select"
                                aria-label={`Role ${index + 1}`}
                                onPointerDown={(event) => {
                                  const target = event.target as HTMLElement;
                                  if (!target.closest("svg")) {
                                    event.preventDefault();
                                    updateRole(role.id, { editing: true });
                                  }
                                }}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent
                                className="role-select-content"
                                position="popper"
                                align="start"
                              >
                                {roleOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                                <SelectItem value={NEW_ROLE_VALUE}>
                                  <PlusIcon aria-hidden="true" />
                                  New role…
                                </SelectItem>
                                <SelectItem value={EDIT_ROLE_VALUE}>
                                  <PencilIcon aria-hidden="true" />
                                  Edit selected role
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <Button
                            className="remove-role-button"
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRole(role.id)}
                            aria-label={`Remove role ${index + 1}`}
                          >
                            <XIcon aria-hidden="true" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="nested-question">
                    <h3>
                      <QuestionText number="7.2.">
                        Separate the link and code?
                      </QuestionText>
                    </h3>
                    <ChoiceGroup
                      name="separate-access"
                      value={separateAccess}
                      onValueChange={(value) => setSeparateAccess(value as YesNo)}
                      options={[
                        { value: "no", label: "No" },
                        { value: "yes", label: "Yes" },
                      ]}
                    />
                  </div>
                </div>
              ) : null}
            </section>

            <section className="form-section">
              <div className="question-parent">
                <h2 className="question-heading">
                  <QuestionText number="8.">
                    Allow all participants to view each other&apos;s responses.
                  </QuestionText>
                </h2>
                <ChoiceGroup
                  name="share-responses"
                  value={shareResponses}
                  onValueChange={(value) => setShareResponses(value as YesNo)}
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                />
              </div>

              {shareResponses === "yes" ? (
                <div className="conditional-field">
                  <h3>
                    <QuestionText number="8.1.">
                      Keep participant names anonymous?
                    </QuestionText>
                  </h3>
                  <ChoiceGroup
                    name="anonymous-names"
                    value={anonymousNames}
                    onValueChange={(value) => setAnonymousNames(value as YesNo)}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />
                </div>
              ) : null}
            </section>

            <div className="create-room-actions">
              <Button className="form-action-button" variant="outline" asChild>
                <Link href="/">Cancel</Link>
              </Button>
              <Button className="form-action-button" type="button">
                Create
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
