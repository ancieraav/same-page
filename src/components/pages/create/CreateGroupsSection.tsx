'use client';

export interface Group {
  id: number;
  name: string;
  isSourceOfTruth: boolean;
  roles: string[];
}

const roleHistory = [
  'Source of Truth', 'Decision Maker', 'Facilitator', 'Lead Architect',
  'Reviewer', 'Product Owner', 'Tech Lead', 'Scrum Master', 'Design Lead',
  'Contributor', 'Observer',
];

interface CreateGroupsSectionProps {
  useGroups: boolean;
  groups: Group[];
  roleInputs: Record<number, string>;
  activeRoleGroupId: number | null;
  newGroup: string;
  showGroupDropdown: boolean;
  suggestedGroups: string[];
  separateRoleLinks: boolean;
  onToggleUseGroups: (val: boolean) => void;
  onSetSourceOfTruth: (groupId: number) => void;
  onDeleteGroup: (groupId: number) => void;
  onRemoveRole: (groupId: number, roleIndex: number) => void;
  onAddRole: (groupId: number, role: string) => void;
  onRoleInputChange: (groupId: number, val: string) => void;
  onActiveRoleGroupChange: (groupId: number | null) => void;
  onNewGroupChange: (val: string) => void;
  onShowGroupDropdown: (val: boolean) => void;
  onAddGroup: (name?: string) => void;
  onToggleSeparateRoleLinks: (val: boolean) => void;
}

export function CreateGroupsSection({
  useGroups,
  groups,
  roleInputs,
  activeRoleGroupId,
  newGroup,
  showGroupDropdown,
  suggestedGroups,
  separateRoleLinks,
  onToggleUseGroups,
  onSetSourceOfTruth,
  onDeleteGroup,
  onRemoveRole,
  onAddRole,
  onRoleInputChange,
  onActiveRoleGroupChange,
  onNewGroupChange,
  onShowGroupDropdown,
  onAddGroup,
  onToggleSeparateRoleLinks,
}: CreateGroupsSectionProps) {
  return (
    <div className="clean-form-row">
      <div className="clean-label">
        Use groups &amp; roles? <span className="clean-mandatory">*</span>
      </div>
      <p className="clean-hint">
        Organize participants into distinct groups with multiple roles. Exactly one group acts as the Source of Truth benchmark.
      </p>
      <div className="clean-segmented-toggle">
        <button
          type="button"
          className={`seg-btn${!useGroups ? ' active' : ''}`}
          onClick={() => { onToggleUseGroups(false); }}
        >
          No
        </button>
        <button
          type="button"
          className={`seg-btn${useGroups ? ' active' : ''}`}
          onClick={() => { onToggleUseGroups(true); }}
        >
          Yes
        </button>
      </div>
      {useGroups && (
        <div className="groups-manager-drawer" id="groups-manager-drawer">
          <div className="groups-list-container" id="groups-list-container">
            {groups.map((group) => {
              const currentRoleQuery = (roleInputs[group.id] ?? '').trim().toLowerCase();
              const existingRoles = new Set(group.roles.map((r) => r.toLowerCase()));
              const suggestedRoles = roleHistory.filter(
                (r) => (!currentRoleQuery || r.toLowerCase().includes(currentRoleQuery)) && !existingRoles.has(r.toLowerCase())
              ).slice(0, 6);

              return (
                <div className={`group-item-block${group.isSourceOfTruth ? ' is-sot' : ''}`} key={group.id}>
                  <div className="group-header-row">
                    <div className="group-title-area">
                      <span className="group-name-text">{group.name}</span>
                      <button
                        type="button"
                        className={`sot-badge-btn${group.isSourceOfTruth ? ' active' : ''}`}
                        onClick={() => { onSetSourceOfTruth(group.id); }}
                      >
                        {group.isSourceOfTruth ? '★ Source of Truth' : '☆ Make Source of Truth'}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn-delete-group"
                      onClick={() => { onDeleteGroup(group.id); }}
                      title="Delete group"
                    >
                      ×
                    </button>
                  </div>
                  <div className="group-roles-area">
                    <span className="roles-caption-mini">
                      Roles:<span className="clean-mandatory">*</span>
                    </span>
                    {group.roles.length < 2 && <span className="roles-count-warning">(min. 2 required)</span>}
                    <div className="group-roles-pills">
                      {group.roles.map((role, roleIndex) => (
                        <span className="role-pill-item" key={`${String(group.id)}-${role}`}>
                          <span>{role}</span>
                          <button
                            type="button"
                            className="btn-remove-role-mini"
                            onClick={() => { onRemoveRole(group.id, roleIndex); }}
                            title="Remove role"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <div className="mini-role-wrap">
                        <input
                          type="text"
                          className="input-add-role-mini"
                          placeholder="+ Add role"
                          aria-label={`Add role to ${group.name}`}
                          autoComplete="off"
                          value={roleInputs[group.id] ?? ''}
                          onChange={(event) => {
                            onRoleInputChange(group.id, event.target.value);
                            onActiveRoleGroupChange(group.id);
                          }}
                          onFocus={() => { onActiveRoleGroupChange(group.id); }}
                          onBlur={() => {
                            setTimeout(() => {
                              onActiveRoleGroupChange(null);
                            }, 180);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              const val = (roleInputs[group.id] ?? '').trim();
                              if (val) { onAddRole(group.id, val); }
                            }
                          }}
                        />
                        {activeRoleGroupId === group.id && suggestedRoles.length > 0 && (
                          <div className="role-suggestions-dropdown open">
                            <div className="dropdown-heading-tiny">Popular Roles</div>
                            {suggestedRoles.map((role) => (
                              <button
                                key={role}
                                type="button"
                                className="dropdown-item-btn"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  onAddRole(group.id, role);
                                }}
                              >
                                <span>{role}</span>
                                <span className="dropdown-item-tag">+ Add</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="add-group-input-bar">
            <div className="group-input-field-wrap">
              <input
                type="text"
                id="new-group-input"
                className="clean-input-compact"
                placeholder="Type new group name..."
                aria-label="New group name"
                autoComplete="off"
                value={newGroup}
                onChange={(event) => {
                  onNewGroupChange(event.target.value);
                  onShowGroupDropdown(true);
                }}
                onFocus={() => { onShowGroupDropdown(true); }}
                onBlur={() => {
                  setTimeout(() => { onShowGroupDropdown(false); }, 180);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onAddGroup();
                  }
                }}
              />
              {showGroupDropdown && suggestedGroups.length > 0 && (
                <div id="group-suggestions-dropdown" className="autocomplete-dropdown open">
                  <div className="dropdown-heading-tiny">Suggested Groups</div>
                  {suggestedGroups.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="dropdown-item-btn group-suggest-item"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onAddGroup(name);
                      }}
                    >
                      <span>{name}</span>
                      <span className="dropdown-item-tag">+ Add</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn-compact-add"
              id="btn-add-group"
              onClick={() => { onAddGroup(); }}
            >
              + Add Group
            </button>
          </div>
          <div className="clean-switch-row" style={{ marginTop: 20 }}>
            <div>
              <div className="clean-switch-label">
                Separate the invite link &amp; code for each group? <span className="clean-mandatory">*</span>
              </div>
              <div className="clean-switch-desc">
                Generate unique invite links tailored to each participant group.
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                aria-label="Separate the invite link and code for each group"
                checked={separateRoleLinks}
                onChange={(event) => { onToggleSeparateRoleLinks(event.target.checked); }}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
