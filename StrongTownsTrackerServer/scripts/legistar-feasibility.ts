const LEGISTAR_BASE_URL = 'https://webapi.legistar.com/v1';
const LEGISTAR_CLIENT = process.env.LEGISTAR_CLIENT ?? 'madison';
const FEASIBILITY_BODY_NAME = 'TRANSPORTATION COMMISSION';

interface LegistarEvent {
  EventId: number;
  EventBodyName: string;
  EventDate: string;
}

interface LegistarEventItem {
  EventItemTitle: string | null;
  EventItemMatterId: number | null;
  EventItemMatterType: string | null;
  EventItemActionName: string | null;
  EventItemPassedFlagName: string | null;
  EventItemTally: string | null;
}

interface LegistarMatterAttachment {
  MatterAttachmentName: string;
  MatterAttachmentHyperlink: string | null;
}

interface LegistarMatter {
  MatterTypeName: string | null;
}

async function fetchFromLegistar<T>(path: string): Promise<T> {
  const url = `${LEGISTAR_BASE_URL}/${LEGISTAR_CLIENT}${path}`;
  const response = await fetch(url);
  console.log(`GET ${url} -> ${response.status}`);

  if (!response.ok) {
    throw new Error(`Legistar request failed with status ${response.status}: ${url}`);
  }

  return (await response.json()) as T;
}

async function findRecentEventWithApprovedMinutes(): Promise<LegistarEvent> {
  const filter = `EventBodyName+eq+%27${encodeURIComponent(FEASIBILITY_BODY_NAME)}%27+and+EventDate+le+datetime%27${new Date().toISOString().slice(0, 10)}%27+and+EventMinutesStatusName+eq+%27Approved%27`;
  const events = await fetchFromLegistar<LegistarEvent[]>(
    `/events?$filter=${filter}&$orderby=EventDate+desc&$top=1`,
  );
  const [mostRecentEventWithApprovedMinutes] = events;

  if (!mostRecentEventWithApprovedMinutes) {
    throw new Error(
      `No past event with approved minutes found for body "${FEASIBILITY_BODY_NAME}"`,
    );
  }

  return mostRecentEventWithApprovedMinutes;
}

function fetchEventItems(eventId: number): Promise<LegistarEventItem[]> {
  return fetchFromLegistar<LegistarEventItem[]>(
    `/Events/${eventId}/EventItems?AgendaNote=true&MinutesNote=true`,
  );
}

function printEventItemDecisions(items: LegistarEventItem[]): void {
  console.log(`\n${items.length} event items:`);
  for (const item of items) {
    console.log({
      title: item.EventItemTitle,
      matterType: item.EventItemMatterType,
      action: item.EventItemActionName,
      passedFlag: item.EventItemPassedFlagName,
      tally: item.EventItemTally,
    });
  }
}

async function printAttachmentsForFirstMatterThatHasAny(items: LegistarEventItem[]): Promise<void> {
  const matterIds = items
    .map((item) => item.EventItemMatterId)
    .filter((matterId): matterId is number => matterId != null);

  for (const matterId of matterIds) {
    const attachments = await fetchFromLegistar<LegistarMatterAttachment[]>(
      `/Matters/${matterId}/Attachments`,
    );

    if (attachments.length === 0) {
      continue;
    }

    console.log(`\nAttachments for matter ${matterId}:`);
    for (const attachment of attachments) {
      console.log({
        name: attachment.MatterAttachmentName,
        hyperlink: attachment.MatterAttachmentHyperlink,
      });
    }
    return;
  }

  console.log(`\nChecked ${matterIds.length} matter(s) tied to this event; none had attachments.`);
}

async function printDistinctMatterTypes(): Promise<void> {
  const matters = await fetchFromLegistar<LegistarMatter[]>('/matters?$top=200');
  const distinctMatterTypes = [...new Set(matters.map((matter) => matter.MatterTypeName))];

  console.log('\nDistinct MatterTypeName values across 200 recent matters:');
  console.log(distinctMatterTypes);
}

async function main(): Promise<void> {
  const event = await findRecentEventWithApprovedMinutes();
  console.log('Most recent event with approved minutes:', {
    id: event.EventId,
    body: event.EventBodyName,
    date: event.EventDate,
  });

  const items = await fetchEventItems(event.EventId);
  printEventItemDecisions(items);
  await printAttachmentsForFirstMatterThatHasAny(items);
  await printDistinctMatterTypes();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
