export function getMoonlitTemplate(
    startTimeUnix: string,
    dj: string,
    leader: string,
    slotList: string,
  ) {
    const template = `
      **LAYER.// Moonlit EU/NA**
  
  **Notes:**
  - The event starts on <t:${startTimeUnix}:F>.
  - There are 4 slots with 5 people per slot.
  - The Leader of this ${leader}!
  - Each slot lasts 15 minutes.
  
  **Slot Times:**
  ${dj}
  ${slotList}
  `.trim();
  
    return template;
  }