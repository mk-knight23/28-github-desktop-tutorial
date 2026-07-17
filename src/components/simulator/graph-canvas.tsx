"use client";

/**
 * SVG branch-graph renderer (PRODUCT_SPEC §3.1 / DESIGN_SYSTEM.md §1.4, §8.3).
 *
 * Pure presentation over the engine's computeLayout(). Lanes map to the six lane
 * tokens, cycling with a dashed pattern beyond six so repeated hues stay
 * distinguishable (shape + color, never color alone). Abandoned commits render
 * muted and dashed. Nodes are keyboard-focusable with descriptive labels; the
 * command log in the workspace is the primary screen-reader narration.
 */

import { useState } from "react";
import { Minus, Plus, RefreshCw } from "lucide-react";
import {
  computeLayout,
  NODE_RADIUS,
  type GitState,
  type GraphLayout,
} from "@/lib/git-engine";

const STROKE_LANE = [
  "stroke-lane-1",
  "stroke-lane-2",
  "stroke-lane-3",
  "stroke-lane-4",
  "stroke-lane-5",
  "stroke-lane-6",
];
const FILL_LANE = [
  "fill-lane-1",
  "fill-lane-2",
  "fill-lane-3",
  "fill-lane-4",
  "fill-lane-5",
  "fill-lane-6",
];

function laneStroke(lane: number): string {
  return STROKE_LANE[lane % STROKE_LANE.length];
}
function laneFill(lane: number): string {
  return FILL_LANE[lane % FILL_LANE.length];
}
/** Beyond the six lane colors, add a dash so repeated hues stay distinct. */
function laneDash(lane: number): string | undefined {
  return lane >= STROKE_LANE.length ? "6 4" : undefined;
}

function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  if (y1 === y2) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const midX = x1 + (x2 - x1) / 2;
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}

function describe(layout: GraphLayout): string {
  const nodeWord = layout.nodes.length === 1 ? "commit" : "commits";
  const laneWord = layout.laneCount === 1 ? "lane" : "lanes";
  const headText =
    layout.head.type === "branch"
      ? `HEAD is on branch ${layout.head.name}`
      : `HEAD is detached at ${layout.head.commitId}`;
  return `Branch graph with ${layout.nodes.length} ${nodeWord} across ${layout.laneCount} ${laneWord}. ${headText}.`;
}

const ZOOM_STEP = 0.2;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;

interface GraphCanvasProps {
  state: GitState;
}

export function GraphCanvas({ state }: GraphCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const layout = computeLayout(state);

  const isEmpty = layout.nodes.length === 0;
  const width = Math.max(layout.width, 240);
  const height = Math.max(layout.height, 140);

  return (
    <div className="relative">
      {/* Zoom controls — button alternative to drag (WCAG 2.5.7). */}
      <div className="absolute right-2 top-2 z-10 flex gap-1">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 10) / 10))}
          disabled={zoom <= ZOOM_MIN}
          aria-label="Zoom out"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border border-border bg-surface text-fg-secondary hover:bg-surface-raised hover:text-fg disabled:opacity-40"
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          aria-label="Reset zoom"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border border-border bg-surface text-fg-secondary hover:bg-surface-raised hover:text-fg"
        >
          <RefreshCw size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 10) / 10))}
          disabled={zoom >= ZOOM_MAX}
          aria-label="Zoom in"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border border-border bg-surface text-fg-secondary hover:bg-surface-raised hover:text-fg disabled:opacity-40"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="overflow-auto rounded-md border border-border bg-terminal p-2" style={{ maxHeight: "60vh" }}>
        {isEmpty ? (
          <div className="flex h-40 items-center justify-center px-6 text-center">
            <p className="font-mono text-sm text-term-comment">
              No commits yet. Run <span className="text-term-ok">commit &quot;first commit&quot;</span> to begin.
            </p>
          </div>
        ) : (
          <svg
            role="img"
            aria-label={describe(layout)}
            width={width * zoom}
            height={height * zoom}
            viewBox={`0 0 ${width} ${height}`}
            className="block"
          >
            {/* edges */}
            {layout.edges.map((edge) => (
              <path
                key={edge.id}
                d={edgePath(edge.x1, edge.y1, edge.x2, edge.y2)}
                fill="none"
                strokeWidth={2}
                strokeDasharray={edge.abandoned ? "4 4" : laneDash(edge.lane)}
                className={edge.abandoned ? "stroke-fg-muted opacity-50" : laneStroke(edge.lane)}
              />
            ))}

            {/* nodes */}
            {layout.nodes.map((node) => {
              const label = `Commit ${node.commit.id}${
                node.tips.length ? `, tip of ${node.tips.join(", ")}` : ""
              }${node.isHead ? ", current HEAD" : ""}: ${node.commit.message}`;
              return (
                <g key={node.id} tabIndex={0} className="group focus:outline-none" aria-label={label}>
                  <title>{label}</title>
                  {node.isHead && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={NODE_RADIUS + 5}
                      fill="none"
                      strokeWidth={2}
                      className="stroke-accent"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS}
                    strokeWidth={2}
                    strokeDasharray={node.abandoned ? "3 3" : undefined}
                    className={`${
                      node.abandoned
                        ? "fill-terminal stroke-fg-muted opacity-50"
                        : `${laneFill(node.lane)} stroke-transparent`
                    } transition-[r] duration-(--motion-graph) group-focus-visible:stroke-ring`}
                  />
                  <text
                    x={node.x}
                    y={node.y + NODE_RADIUS + 14}
                    textAnchor="middle"
                    className="fill-term-comment font-mono"
                    style={{ fontSize: "10px" }}
                  >
                    {node.commit.id}
                  </text>
                </g>
              );
            })}

            {/* branch labels */}
            {layout.branchLabels.map((label) => (
              <g key={label.name} aria-hidden="true">
                <rect
                  x={label.x - 4}
                  y={label.y - NODE_RADIUS - 20}
                  width={label.name.length * 6.6 + 16}
                  height={16}
                  rx={4}
                  className={`${laneFill(label.lane)} ${label.isCurrent ? "" : "opacity-80"}`}
                />
                <text
                  x={label.x + 4}
                  y={label.y - NODE_RADIUS - 8}
                  className="fill-term-bg font-mono font-bold"
                  style={{ fontSize: "10px" }}
                >
                  {label.isCurrent ? `▸ ${label.name}` : label.name}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
      <p className="mt-2 schematic-label text-fg-muted">
        {layout.head.type === "branch"
          ? `REF_HEAD → ${layout.head.name}`
          : `REF_HEAD → detached @ ${layout.head.commitId}`}
      </p>
    </div>
  );
}
