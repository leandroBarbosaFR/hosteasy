// Minimal iCal (RFC 5545) parser tailored to Airbnb and Booking.com calendar
// exports. We only care about VEVENT blocks with DTSTART, DTEND, SUMMARY and
// UID. Lines are unfolded per the spec (continuation lines start with a
// space or tab and are joined to the previous line).

export type IcalEvent = {
  uid: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD (exclusive end per RFC for VALUE=DATE)
  summary: string | null;
  description: string | null;
};

export function parseIcal(text: string): IcalEvent[] {
  const unfolded = unfoldLines(text);
  const events: IcalEvent[] = [];
  let inEvent = false;
  let cur: Partial<IcalEvent> & { uid?: string } = {};

  for (const line of unfolded) {
    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      cur = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (inEvent && cur.uid && cur.start && cur.end) {
        events.push({
          uid: cur.uid,
          start: cur.start,
          end: cur.end,
          summary: cur.summary ?? null,
          description: cur.description ?? null,
        });
      }
      inEvent = false;
      cur = {};
      continue;
    }
    if (!inEvent) continue;

    const [propRaw, ...valueParts] = splitOnce(line, ":");
    if (!propRaw) continue;
    const value = valueParts.join(":");
    const propName = propRaw.split(";")[0]?.toUpperCase();

    switch (propName) {
      case "UID":
        cur.uid = value.trim();
        break;
      case "DTSTART":
        cur.start = parseIcalDate(value);
        break;
      case "DTEND":
        cur.end = parseIcalDate(value);
        break;
      case "SUMMARY":
        cur.summary = unescapeText(value);
        break;
      case "DESCRIPTION":
        cur.description = unescapeText(value);
        break;
    }
  }

  return events;
}

function unfoldLines(text: string): string[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      if (out.length > 0) out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function splitOnce(s: string, sep: string): [string, ...string[]] {
  const i = s.indexOf(sep);
  if (i === -1) return [s];
  return [s.slice(0, i), s.slice(i + 1)];
}

function parseIcalDate(raw: string): string {
  // Strip parameters like ";VALUE=DATE" if present in value path
  const v = raw.trim();
  // YYYYMMDD
  const dateOnly = v.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnly) return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
  // YYYYMMDDTHHMMSSZ or local
  const dt = v.match(/^(\d{4})(\d{2})(\d{2})T/);
  if (dt) return `${dt[1]}-${dt[2]}-${dt[3]}`;
  return v;
}

function unescapeText(s: string): string {
  return s
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

// Airbnb summary patterns we care about:
//   "Reserved"                                 → no guest name available
//   "Reserved - Marina Souza"                  → guest "Marina Souza"
//   "Reservation: Marina Souza (HMABCXYZ)"     → guest "Marina Souza"
//   "Not available"                            → block, skip
//   "Closed - Not available for check-in"      → block, skip
//
// Booking summary patterns:
//   "CLOSED - Not available"                   → block, skip
//   "Booking.com (CONFIRMED) ..."              → reservation
export function isBlockEvent(summary: string | null): boolean {
  if (!summary) return false;
  const s = summary.toLowerCase();
  return (
    s.includes("not available") ||
    s.includes("blocked") ||
    s === "closed" ||
    s.startsWith("closed -") ||
    s.startsWith("closed:")
  );
}

export function extractGuestName(
  summary: string | null,
  sourceType: "airbnb" | "booking" | "other",
): string {
  const fallback =
    sourceType === "airbnb"
      ? "Hóspede Airbnb"
      : sourceType === "booking"
        ? "Hóspede Booking"
        : "Hóspede";
  if (!summary) return fallback;

  // "Reserved - Name" or "Reservation: Name (HM...)"
  const dashMatch = summary.match(/^(?:reserved|reservation)\s*[-–:]\s*(.+)$/i);
  if (dashMatch) {
    const tail = dashMatch[1];
    // Strip trailing "(HMABC123)" booking code
    return tail.replace(/\s*\([^)]+\)\s*$/, "").trim() || fallback;
  }

  if (/^reserved$/i.test(summary.trim())) return fallback;
  // Booking.com often has guest name on a second line / DESCRIPTION
  return summary.trim() || fallback;
}
