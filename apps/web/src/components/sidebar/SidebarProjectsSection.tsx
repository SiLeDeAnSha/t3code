import type { ContextMenuSource } from "@t3tools/contracts";
import { ChevronDownIcon, FolderIcon, PlusIcon, SquarePenIcon } from "lucide-react";
import { T, useGT, Var } from "gt-react";
import {
  memo,
  type ComponentProps,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

import { cn } from "~/lib/utils";
import { contextMenuSourceOf } from "../../contextMenuSource";
import type { SidebarProjectSnapshot } from "../../sidebarProjectGrouping";
import { Button } from "../ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { SortableSidebarMarker } from "./SidebarListMarkers";

export function ProjectsHeaderIconButton({
  label,
  tooltip = label,
  children,
  ...rest
}: {
  label: string;
  tooltip?: ReactNode;
  children?: ReactNode;
} & Omit<
  ComponentProps<typeof Button>,
  "children" | "className" | "size" | "variant" | "aria-label"
>) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button type="button" size="icon-xs" variant="ghost-muted" aria-label={label} {...rest} />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipPopup side="top">{tooltip}</TooltipPopup>
    </Tooltip>
  );
}

export const SidebarProjectsSection = memo(function SidebarProjectsSection(props: {
  projects: readonly SidebarProjectSnapshot[];
  scopedProjectKeys: readonly string[];
  expanded: boolean;
  hasPinnedAbove: boolean;
  projectFilterControl: ReactNode;
  onToggleExpanded: () => void;
  onAddProject: () => void;
  onSelectProject: (
    project: SidebarProjectSnapshot,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) => void;
  onNewThreadInProject: (project: SidebarProjectSnapshot) => void;
  onProjectContextMenu: (
    project: SidebarProjectSnapshot,
    position: { x: number; y: number },
    source: ContextMenuSource,
  ) => void;
}) {
  const gt = useGT();
  const { projects, scopedProjectKeys, expanded, hasPinnedAbove } = props;

  return (
    <SortableSidebarMarker
      marker="projects-section"
      data-testid="sidebar-projects-section"
      className={cn("mx-0.5", hasPinnedAbove ? "mt-2.5" : "mt-0.5")}
    >
      <div className="flex h-7 items-center gap-1 px-2 text-xs font-medium text-sidebar-muted-foreground">
        <button
          type="button"
          data-sidebar-row="shelf:projects"
          data-testid="sidebar-projects-toggle"
          aria-expanded={expanded}
          onClick={props.onToggleExpanded}
          className="inline-flex min-w-0 cursor-pointer items-center gap-1 rounded-sm py-0.5 text-xs font-medium text-sidebar-muted-foreground outline-none transition-colors hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/70"
        >
          <span className="truncate">{gt("Projects")}</span>
          <ChevronDownIcon
            aria-hidden
            className={cn("size-3 shrink-0 transition-transform", !expanded && "-rotate-90")}
          />
        </button>
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          {props.projectFilterControl}
          <ProjectsHeaderIconButton label={gt("Add project")} onClick={props.onAddProject}>
            <PlusIcon aria-hidden className="size-3.5" />
          </ProjectsHeaderIconButton>
        </div>
      </div>
      {expanded ? (
        <div className="mt-0.5 flex flex-col gap-px">
          {projects.map((project) => {
            const rowId = `project:${project.projectKey}`;
            const isScoped = scopedProjectKeys.includes(project.projectKey);
            return (
              <div
                key={project.projectKey}
                data-testid="sidebar-project-row"
                className="group/project-row relative"
              >
                <button
                  type="button"
                  data-sidebar-row={rowId}
                  data-sidebar-parent="shelf:projects"
                  aria-pressed={isScoped}
                  onClick={(event) => props.onSelectProject(project, event)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    props.onProjectContextMenu(
                      project,
                      { x: event.clientX, y: event.clientY },
                      contextMenuSourceOf(event),
                    );
                  }}
                  className={cn(
                    "flex h-8 w-full cursor-pointer items-center gap-2 rounded-(--control-radius) px-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    isScoped
                      ? "bg-sidebar-row-active font-medium text-sidebar-foreground"
                      : "text-sidebar-foreground/90 hover:bg-sidebar-row-hover hover:text-sidebar-foreground",
                  )}
                >
                  <FolderIcon
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0",
                      isScoped ? "text-sidebar-foreground" : "text-sidebar-muted-foreground",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{project.displayName}</span>
                </button>
                <span className="absolute inset-y-0 right-1 flex items-center opacity-0 focus-within:opacity-100 group-hover/project-row:opacity-100 pointer-coarse:opacity-100">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          data-sidebar-action-for={rowId}
                          type="button"
                          size="icon-xs"
                          variant="ghost-muted"
                          aria-label={gt("New thread in {project}", {
                            project: project.displayName,
                          })}
                          onClick={(event) => {
                            event.stopPropagation();
                            props.onNewThreadInProject(project);
                          }}
                        />
                      }
                    >
                      <SquarePenIcon aria-hidden className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipPopup side="top">
                      <T>
                        New thread in <Var>{project.displayName}</Var>
                      </T>
                    </TooltipPopup>
                  </Tooltip>
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </SortableSidebarMarker>
  );
});
