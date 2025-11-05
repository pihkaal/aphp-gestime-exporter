import type { IcsCalendar, IcsEvent } from "ts-ics";

type WorkEvent = {
  day: number;
  start: { hours: number; minutes: number };
  end: { hours: number; minutes: number };
};

const makeIcsEvent = (
  data: {
    year: number;
    month: number;
  } & WorkEvent,
): IcsEvent => ({
  uid: `${data.year}-${data.month}-${data.day}-work@gestime-aphp-export`,
  summary: "Travail",
  stamp: { date: new Date() },
  start: {
    // - 1 because Date takes month index, e.g 0-11
    date: new Date(
      data.year,
      data.month - 1,
      data.day,
      data.start.hours,
      data.start.minutes,
    ),
  },
  duration: {
    hours: Math.floor(
      (data.end.hours * 60 +
        data.end.minutes -
        (data.start.hours * 60 + data.start.minutes)) /
        60,
    ),
    minutes:
      (data.end.hours * 60 +
        data.end.minutes -
        (data.start.hours * 60 + data.start.minutes)) %
      60,
  },
  location: "Hôpital Pitié-Salpêtrière",
});

const makeIcsCalendar = (events: IcsEvent[]): IcsCalendar => ({
  version: "2.0",
  prodId: "-//pihkaal//Gestime APHP Export//FR",
  events,
});

export async function extractData(): Promise<{
  name: string;
  data: IcsCalendar;
}> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.id) {
    throw new Error("URL incorrecte");
  }

  const urlMatch = tab.url?.match(/\/(\d{2})-(\d{4})$/);
  if (!urlMatch) {
    throw new Error("URL incorrecte");
  }
  const year = parseInt(urlMatch[2]!);
  const month = parseInt(urlMatch[1]!);

  try {
    const [eventsQuery] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const trs = document.querySelectorAll("#clearfix-individuel table tr");

        const events: WorkEvent[] = [];

        // [Sam 01, RH]
        // [Dim 02, 7:00 - 19:00]
        for (const tr of trs) {
          const tds = tr.querySelectorAll("td");

          const dateText = tds[0]?.textContent?.trim() ?? "";
          const dateMatch = dateText.match(/^[A-Z][a-z]{2}\s+(\d{2})$/);
          if (!dateMatch) continue;

          const workText = tds[1]?.textContent?.trim() ?? "";
          const hoursMatch = workText.match(/^(\d+):(\d+) - (\d+):(\d+)$/);
          if (!hoursMatch) continue;

          events.push({
            day: parseInt(dateMatch[1]!),
            start: {
              hours: parseInt(hoursMatch[1]!),
              minutes: parseInt(hoursMatch[2]!),
            },
            end: {
              hours: parseInt(hoursMatch[3]!),
              minutes: parseInt(hoursMatch[4]!),
            },
          });
        }

        return events;
      },
    });
    if (!eventsQuery?.result) throw undefined;

    return {
      name: `gestime-${urlMatch[1]}-${urlMatch[2]}.ics`,
      data: makeIcsCalendar(
        eventsQuery.result.map((event) =>
          makeIcsEvent({ year, month, ...event }),
        ),
      ),
    };
  } catch {
    throw new Error(
      "Impossible d'extraires les données, contactez `hello@pihkaal.me`",
    );
  }
}
