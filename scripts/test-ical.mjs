// Feed real-format iCal fixtures (Airbnb + Booking) into parseIcal,
// extractGuestName, and isBlockEvent. Prove they produce the right output.

import { parseIcal, extractGuestName, isBlockEvent } from "../src/lib/ical.ts";

// Real-format Airbnb VCALENDAR. Anonymized but structurally identical to what
// Airbnb's /calendar/ical/<id>.ics endpoint returns (RFC 5545, VALUE=DATE).
const airbnbIcs = `BEGIN:VCALENDAR
PRODID:-//Airbnb Inc//Hosting Calendar 0.8.8//EN
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTEND;VALUE=DATE:20260615
DTSTART;VALUE=DATE:20260612
SUMMARY:Reserved
UID:abc111@airbnb.com
DESCRIPTION:Reservation URL: https://www.airbnb.com/hosting/reservations/details/HMABC1
END:VEVENT
BEGIN:VEVENT
DTEND;VALUE=DATE:20260622
DTSTART;VALUE=DATE:20260620
SUMMARY:Reserved - Marina Souza
UID:abc222@airbnb.com
DESCRIPTION:CHECKIN: 20/06/2026\\nCHECKOUT: 22/06/2026\\nPHONE: (Last 4 Digits): 1234
END:VEVENT
BEGIN:VEVENT
DTEND;VALUE=DATE:20260701
DTSTART;VALUE=DATE:20260625
SUMMARY:Reservation: Tiago Lima (HMXYZ789)
UID:abc333@airbnb.com
END:VEVENT
BEGIN:VEVENT
DTEND;VALUE=DATE:20260705
DTSTART;VALUE=DATE:20260702
SUMMARY:Airbnb (Not available)
UID:block111@airbnb.com
END:VEVENT
BEGIN:VEVENT
DTEND;VALUE=DATE:20260710
DTSTART;VALUE=DATE:20260708
SUMMARY:Closed - Not available for check-in
UID:block222@airbnb.com
END:VEVENT
END:VCALENDAR`;

// Booking.com style (also RFC 5545, but with CONFIRMED suffix in SUMMARY).
const bookingIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Booking.com//Hotel Calendar//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:CLOSED - Not available
DTSTART;VALUE=DATE:20260601
DTEND;VALUE=DATE:20260603
UID:booking-block-1@booking.com
END:VEVENT
BEGIN:VEVENT
SUMMARY:Família Oliveira (CONFIRMED)
DTSTART;VALUE=DATE:20260710
DTEND;VALUE=DATE:20260715
UID:booking-resv-9988@booking.com
END:VEVENT
END:VCALENDAR`;

// Long line folding test — RFC 5545 line continuation (lines beginning with
// space). parseIcal must un-fold these into the original logical line.
const foldedIcs = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Reserved - Ana Pereira Silva Almeida Loureiro Vieira Pinheiro Mac
 hado Júnior
DTSTART;VALUE=DATE:20260801
DTEND;VALUE=DATE:20260803
UID:long@airbnb.com
END:VEVENT
END:VCALENDAR`;

console.log("======================================================================");
console.log(" parseIcal — Airbnb fixture (5 events: 3 reservations, 2 blocks)");
console.log("======================================================================");
const airbnbEvents = parseIcal(airbnbIcs);
console.log(`Parsed ${airbnbEvents.length} events.\n`);
for (const ev of airbnbEvents) {
  const block = isBlockEvent(ev.summary);
  const guest = block ? "—" : extractGuestName(ev.summary, "airbnb");
  console.log(`  UID:          ${ev.uid}`);
  console.log(`  Dates:        ${ev.start} → ${ev.end}`);
  console.log(`  Summary:      ${JSON.stringify(ev.summary)}`);
  console.log(`  isBlockEvent: ${block}`);
  console.log(`  Guest name:   ${guest}`);
  console.log("");
}

console.log("======================================================================");
console.log(" parseIcal — Booking.com fixture (2 events: 1 block, 1 reservation)");
console.log("======================================================================");
const bookingEvents = parseIcal(bookingIcs);
console.log(`Parsed ${bookingEvents.length} events.\n`);
for (const ev of bookingEvents) {
  const block = isBlockEvent(ev.summary);
  const guest = block ? "—" : extractGuestName(ev.summary, "booking");
  console.log(`  UID:          ${ev.uid}`);
  console.log(`  Dates:        ${ev.start} → ${ev.end}`);
  console.log(`  Summary:      ${JSON.stringify(ev.summary)}`);
  console.log(`  isBlockEvent: ${block}`);
  console.log(`  Guest name:   ${guest}`);
  console.log("");
}

console.log("======================================================================");
console.log(" parseIcal — RFC 5545 line folding test");
console.log("======================================================================");
const folded = parseIcal(foldedIcs);
const f = folded[0];
console.log(`Parsed ${folded.length} event.`);
console.log(`  Summary (unfolded): ${JSON.stringify(f.summary)}`);
console.log(`  Guest name:         ${extractGuestName(f.summary, "airbnb")}`);
const expectedName = "Ana Pereira Silva Almeida Loureiro Vieira Pinheiro Machado Júnior";
const actualName = extractGuestName(f.summary, "airbnb");
console.log(`  ${actualName === expectedName ? "OK " : "FAIL "} folded lines correctly joined`);

console.log("");
console.log("======================================================================");
console.log(" Assertions");
console.log("======================================================================");
const assertions = [
  ["Airbnb parsed 5 VEVENTs", airbnbEvents.length === 5],
  ["Reserved (no name)         → 'Hóspede Airbnb'", extractGuestName("Reserved", "airbnb") === "Hóspede Airbnb"],
  ["Reserved - Marina Souza    → 'Marina Souza'",   extractGuestName("Reserved - Marina Souza", "airbnb") === "Marina Souza"],
  ["Reservation: Tiago (HMXYZ) → 'Tiago Lima'",     extractGuestName("Reservation: Tiago Lima (HMXYZ789)", "airbnb") === "Tiago Lima"],
  ["Airbnb (Not available)     → block",            isBlockEvent("Airbnb (Not available)") === true],
  ["Closed - Not available...  → block",            isBlockEvent("Closed - Not available for check-in") === true],
  ["CLOSED - Not available     → block",            isBlockEvent("CLOSED - Not available") === true],
  ["Família Oliveira (CONF...) → keep, extract",    !isBlockEvent("Família Oliveira (CONFIRMED)")],
  ["Booking missing name fallback works",           extractGuestName(null, "booking") === "Hóspede Booking"],
  ["Folded line joins correctly",                   actualName === expectedName],
  ["Date '20260612' → '2026-06-12'",                airbnbEvents[0].start === "2026-06-12"],
  ["Dedup-key UID is preserved verbatim",           airbnbEvents[1].uid === "abc222@airbnb.com"],
];
let pass = 0, fail = 0;
for (const [label, ok] of assertions) {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  ok ? pass++ : fail++;
}
console.log(`\n${pass}/${assertions.length} assertions passed.`);
if (fail > 0) process.exit(1);
