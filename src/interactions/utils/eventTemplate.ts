export function getEventTemplate(
  eventTitle: string,
  startTimeUnix: string,
  slots: number,
  peoplePerSlot: number,
  duration: number,
  description: string,
  slotList: string,
) {
  const template = `
    **::OPERATION:: ${eventTitle}**
${description ? `\n${description}\n` : ''}

**Notes:**
- The event starts on <t:${startTimeUnix}:F>.
- There are ${slots} slots with ${peoplePerSlot} people per slot.
- Each slot lasts ${duration} minutes.

**Slot Times:**
${"``DJ``"}
${slotList}
`.trim();

  return template;
}
