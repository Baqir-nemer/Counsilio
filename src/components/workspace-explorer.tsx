"use client";

import { useCallback, useEffect, useState } from "react";
import { useWorkspace } from "@/context/workspace-context";
import type { TreeEntry } from "@/lib/workspace-bridge";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  onAttachFile: (path: string, title: string, isDirectory?: boolean) => void;
};

export const COUNSILIO_DRAG_TYPE = "application/x-counsilio-entry";

type NodeState = {
  entry: TreeEntry;
  children?: TreeEntry[];
  expanded?: boolean;
  loading?: boolean;
};

export function WorkspaceExplorer({
  collapsed,
  onToggle,
  onAttachFile,
}: Props) {
  const { workspacePath, stats, listDir, reveal, progress } = useWorkspace();
  const [roots, setRoots] = useState<NodeState[]>([]);
  const [expanded, setExpanded] = useState<Record<string, NodeState>>({});
  const [error, setError] = useState("");

  const loadRoot = useCallback(async () => {
    if (!workspacePath) {
      setRoots([]);
      return;
    }
    try {
      setError("");
      const entries = await listDir();
      setRoots(entries.map((entry) => ({ entry })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list folder");
    }
  }, [workspacePath, listDir]);

  useEffect(() => {
    void loadRoot();
  }, [loadRoot]);

  async function toggleDir(entry: TreeEntry) {
    const key = entry.path;
    const current = expanded[key];
    if (current?.expanded) {
      setExpanded((prev) => ({
        ...prev,
        [key]: { ...current, expanded: false },
      }));
      return;
    }

    setExpanded((prev) => ({
      ...prev,
      [key]: {
        entry,
        expanded: true,
        loading: true,
        children: current?.children,
      },
    }));

    try {
      const children = await listDir(entry.path);
      setExpanded((prev) => ({
        ...prev,
        [key]: { entry, expanded: true, loading: false, children },
      }));
    } catch {
      setExpanded((prev) => ({
        ...prev,
        [key]: { entry, expanded: false, loading: false, children: [] },
      }));
    }
  }

  if (collapsed) {
    return (
      <div className="flex h-full w-10 shrink-0 flex-col items-center border-r border-[var(--line)] bg-[var(--panel)]/90 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--mist)] hover:text-[var(--ink)]"
          title="Show workspace"
          aria-label="Show workspace explorer"
        >
          ▸
        </button>
      </div>
    );
  }

  return (
    <aside className="flex h-full w-1/5 min-w-[220px] max-w-[320px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--panel)]/90">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--line)] px-3 py-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">
            Workspace
          </p>
          <p
            className="mt-1 truncate font-mono text-[11px] text-[var(--ink)]"
            title={workspacePath ?? undefined}
          >
            {workspacePath ?? "No folder selected"}
          </p>
          {stats && (
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              {stats.fileCount} indexed file{stats.fileCount === 1 ? "" : "s"}
            </p>
          )}
          {progress && progress.phase === "extracting" && (
            <p className="mt-1 text-[11px] text-[var(--accent-deep)]">
              Indexing {progress.processed}/{progress.total}…
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--mist)]"
          title="Collapse explorer"
        >
          ◂
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2 text-sm">
        {error && (
          <p className="px-2 text-xs text-[var(--danger)]">{error}</p>
        )}
        {!workspacePath && (
          <p className="px-3 text-xs text-[var(--muted)]">
            Choose a workspace folder during onboarding or in Settings.
          </p>
        )}
        {roots.map((node) => (
          <TreeNode
            key={node.entry.path}
            entry={node.entry}
            depth={0}
            expandedMap={expanded}
            onToggleDir={toggleDir}
            onAttachFile={onAttachFile}
            onReveal={(p) => void reveal(p)}
          />
        ))}
      </div>
    </aside>
  );
}

function TreeNode({
  entry,
  depth,
  expandedMap,
  onToggleDir,
  onAttachFile,
  onReveal,
}: {
  entry: TreeEntry;
  depth: number;
  expandedMap: Record<string, NodeState>;
  onToggleDir: (entry: TreeEntry) => void;
  onAttachFile: (path: string, title: string, isDirectory?: boolean) => void;
  onReveal: (path: string) => void;
}) {
  const state = expandedMap[entry.path];
  const isOpen = Boolean(state?.expanded);

  function onDragStart(e: React.DragEvent) {
    const payload = JSON.stringify({
      path: entry.path,
      name: entry.name,
      isDirectory: entry.isDirectory,
    });
    e.dataTransfer.setData(COUNSILIO_DRAG_TYPE, payload);
    e.dataTransfer.setData("text/plain", entry.path);
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div>
      <div
        draggable
        onDragStart={onDragStart}
        className="group flex cursor-grab items-center gap-1 rounded-md px-1 py-0.5 hover:bg-[var(--mist)] active:cursor-grabbing"
        style={{ paddingLeft: 8 + depth * 12 }}
        title={`${entry.path} — drag into chat to reference`}
      >
        {entry.isDirectory ? (
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-[var(--ink)]"
            onClick={() => onToggleDir(entry)}
          >
            <span className="w-3 shrink-0 text-[10px] text-[var(--muted)]">
              {isOpen ? "▾" : "▸"}
            </span>
            <span className="truncate">{entry.name}</span>
          </button>
        ) : (
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-[var(--ink)]"
            onClick={() => onAttachFile(entry.path, entry.name, false)}
            title="Attach to chat"
          >
            <span className="w-3 shrink-0 text-[10px] text-[var(--muted)]">
              ·
            </span>
            <span className="truncate">{entry.name}</span>
          </button>
        )}
        {entry.isDirectory && (
          <button
            type="button"
            className="hidden shrink-0 rounded px-1 text-[10px] text-[var(--muted)] group-hover:inline hover:text-[var(--ink)]"
            onClick={() => onAttachFile(entry.path, entry.name, true)}
            title="Attach folder to chat"
          >
            +
          </button>
        )}
        <button
          type="button"
          className="hidden shrink-0 rounded px-1 text-[10px] text-[var(--muted)] group-hover:inline hover:text-[var(--ink)]"
          onClick={() => onReveal(entry.path)}
          title="Reveal in Finder"
        >
          ↗
        </button>
      </div>
      {entry.isDirectory && isOpen && (
        <div>
          {state?.loading && (
            <p
              className="py-1 text-[11px] text-[var(--muted)]"
              style={{ paddingLeft: 20 + depth * 12 }}
            >
              Loading…
            </p>
          )}
          {state?.children?.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              expandedMap={expandedMap}
              onToggleDir={onToggleDir}
              onAttachFile={onAttachFile}
              onReveal={onReveal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
