export const isPlanningUrl = async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return (
    tab?.url !== undefined &&
    tab.url.startsWith("https://gestime.aphp.fr/planning/agent")
  );
};
