<script setup lang="ts">
import AppCounter from "@/components/AppCounter.vue";
import { ref } from "vue";

type WorkEvent = {
  day: number;
  work: boolean;
};

const data = ref<{
  events: WorkEvent[];
  month: number;
  year: number;
}>();

async function extractData() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) {
      console.error("No active tab found");
      return null;
    }

    const urlMatch = tab.url?.match(/\/(\d{2})-(\d{4})$/);
    if (!urlMatch?.[1] || !urlMatch[2]) {
      console.error("Could not extract month and year from URL");
      return null;
    }

    const [eventsQuery] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const trs = document.querySelectorAll("#clearfix-individuel table tr");

        const events: WorkEvent[] = [];

        for (const tr of trs) {
          const tds = tr.querySelectorAll("td");
          const dateText = tds[0]?.textContent?.trim() ?? "";

          const dateMatch = dateText.match(/^[A-Z][a-z]{2}\s+(\d{2})$/);
          if (!dateMatch) continue;

          const workText = tds[1]?.textContent?.trim() ?? "";

          events.push({
            day: parseInt(dateMatch[1]!),
            work: /^\d+:\d+ - \d+:\d+$/.test(workText),
          });
        }

        return events;
      },
    });
    if (!eventsQuery?.result) return null;

    data.value = {
      events: eventsQuery.result,
      month: parseInt(urlMatch[1]),
      year: parseInt(urlMatch[2]),
    };

    return {
      events: eventsQuery.result,
      month: parseInt(urlMatch[1]),
      year: parseInt(urlMatch[2]),
    };
  } catch (error) {
    console.error("Error getting elements data:", error);
    return null;
  }
}
</script>

<template>
  <div class="app">
    <h1>Gestime APHP Export</h1>

    <div class="query-section">
      <button @click="extractData">Extract</button>
    </div>

    <div>
      {{ JSON.stringify(data) }}
    </div>

    <hr />

    <AppCounter />
  </div>
</template>

<style scoped>
.app {
  padding: 16px;
  min-width: 400px;
  max-width: 600px;
}

h1 {
  font-size: 20px;
  margin-bottom: 16px;
}

.query-section {
  margin-bottom: 24px;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 8px;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.url-info {
  margin-top: 12px;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  word-break: break-all;
}

.result {
  margin-top: 12px;
  padding: 12px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.result pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

hr {
  margin: 24px 0;
  border: none;
  border-top: 1px solid #ddd;
}
</style>
