"use client";

import { Sparkles, User } from "lucide-react";
import type { Message } from "@/types";

type MessageBubbleProps = {
  message: Message;
};

// ============================================================
// INLINE MARKDOWN
// ============================================================

function renderInlineText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong
          key={index}
          className="font-semibold text-white"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    return (
      <span key={index}>
        {part}
      </span>
    );
  });
}

// ============================================================
// MARKDOWN TABLE
// ============================================================

function isTableRow(line: string) {
  return (
    line.trim().startsWith("|") &&
    line.trim().endsWith("|")
  );
}

function isSeparatorRow(line: string) {
  if (!isTableRow(line)) {
    return false;
  }

  const cells = line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());

  return cells.length > 0 &&
    cells.every((cell) =>
      /^:?-{3,}:?$/.test(cell)
    );
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(
  lines: string[],
  startIndex: number
) {
  const tableLines: string[] = [];

  let index = startIndex;

  while (
    index < lines.length &&
    isTableRow(lines[index])
  ) {
    tableLines.push(lines[index]);
    index++;
  }

  if (
    tableLines.length < 2 ||
    !isSeparatorRow(tableLines[1])
  ) {
    return null;
  }

  const headers = parseTableRow(
    tableLines[0]
  );

  const rows = tableLines
    .slice(2)
    .map(parseTableRow);

  return {
    element: (
      <div className="my-4 w-full overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full min-w-[520px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.04]">
              {headers.map(
                (header, headerIndex) => (
                  <th
                    key={headerIndex}
                    className="px-4 py-3 font-semibold text-white"
                  >
                    {renderInlineText(
                      header
                    )}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map(
              (row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-white/[0.06] last:border-b-0"
                >
                  {headers.map(
                    (_, columnIndex) => (
                      <td
                        key={columnIndex}
                        className="px-4 py-3 align-top leading-5 text-white/65"
                      >
                        {renderInlineText(
                          row[columnIndex] || ""
                        )}
                      </td>
                    )
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    ),
    nextIndex: index,
  };
}

// ============================================================
// MESSAGE CONTENT
// ============================================================

function renderFormattedText(
  text: string
) {
  const lines = text.split("\n");

  const elements: React.ReactNode[] = [];

  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    // --------------------------------------------------------
    // TABLE
    // --------------------------------------------------------

    if (isTableRow(line)) {
      const table = renderTable(
        lines,
        index
      );

      if (table) {
        elements.push(
          <div key={`table-${index}`}>
            {table.element}
          </div>
        );

        index = table.nextIndex;
        continue;
      }
    }

    // --------------------------------------------------------
    // EMPTY LINE
    // --------------------------------------------------------

    if (!line.trim()) {
      elements.push(
        <div
          key={`empty-${index}`}
          className="h-2"
        />
      );

      index++;
      continue;
    }

    // --------------------------------------------------------
    // HEADING
    // --------------------------------------------------------

    if (line.startsWith("### ")) {
      elements.push(
        <div
          key={index}
          className="mb-2 mt-3 text-sm font-semibold text-white"
        >
          {renderInlineText(
            line.slice(4)
          )}
        </div>
      );

      index++;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <div
          key={index}
          className="mb-2 mt-3 text-base font-semibold text-white"
        >
          {renderInlineText(
            line.slice(3)
          )}
        </div>
      );

      index++;
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <div
          key={index}
          className="mb-3 mt-3 text-lg font-semibold text-white"
        >
          {renderInlineText(
            line.slice(2)
          )}
        </div>
      );

      index++;
      continue;
    }

    // --------------------------------------------------------
    // BULLET LIST
    // --------------------------------------------------------

    if (
      line.trim().startsWith("- ") ||
      line.trim().startsWith("* ")
    ) {
      const bulletLines: string[] = [];

      while (
        index < lines.length &&
        (
          lines[index]
            .trim()
            .startsWith("- ") ||
          lines[index]
            .trim()
            .startsWith("* ")
        )
      ) {
        bulletLines.push(
          lines[index]
            .trim()
            .slice(2)
        );

        index++;
      }

      elements.push(
        <ul
          key={`list-${index}`}
          className="my-2 space-y-1.5"
        >
          {bulletLines.map(
            (item, itemIndex) => (
              <li
                key={itemIndex}
                className="flex gap-2 text-white/70"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" />

                <span>
                  {renderInlineText(
                    item
                  )}
                </span>
              </li>
            )
          )}
        </ul>
      );

      continue;
    }

    // --------------------------------------------------------
    // NUMBERED LIST
    // --------------------------------------------------------

    if (/^\d+\.\s/.test(line.trim())) {
      const numberedLines: string[] = [];

      while (
        index < lines.length &&
        /^\d+\.\s/.test(
          lines[index].trim()
        )
      ) {
        numberedLines.push(
          lines[index]
            .trim()
            .replace(
              /^\d+\.\s/,
              ""
            )
        );

        index++;
      }

      elements.push(
        <ol
          key={`numbered-${index}`}
          className="my-2 list-decimal space-y-1.5 pl-5 text-white/70"
        >
          {numberedLines.map(
            (item, itemIndex) => (
              <li key={itemIndex}>
                {renderInlineText(
                  item
                )}
              </li>
            )
          )}
        </ol>
      );

      continue;
    }

    // --------------------------------------------------------
    // NORMAL TEXT
    // --------------------------------------------------------

    elements.push(
      <div
        key={index}
        className="min-h-[1.5rem]"
      >
        {renderInlineText(line)}
      </div>
    );

    index++;
  }

  return elements;
}

// ============================================================
// MESSAGE BUBBLE
// ============================================================

export default function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isUser =
    message.role === "user";

  return (
    <div
      className={`flex w-full ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[88%] gap-3 ${
          isUser
            ? "flex-row-reverse"
            : ""
        }`}
      >
        {/* Avatar */}

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isUser
              ? "border border-white/10 bg-white/[0.06]"
              : "bg-white text-black"
          }`}
        >
          {isUser ? (
            <User size={14} />
          ) : (
            <Sparkles size={14} />
          )}
        </div>

        {/* Message */}

        <div className="min-w-0">
          <div
            className={`mb-1 text-[10px] uppercase tracking-[0.12em] ${
              isUser
                ? "text-right text-white/25"
                : "text-white/25"
            }`}
          >
            {isUser
              ? "You"
              : "Vizzy"}
          </div>

          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              isUser
                ? "rounded-br-md bg-white text-black"
                : "rounded-bl-md border border-white/[0.08] bg-white/[0.04] text-white/75"
            }`}
          >
            {renderFormattedText(
              message.content
            )}
          </div>
        </div>
      </div>
    </div>
  );
}