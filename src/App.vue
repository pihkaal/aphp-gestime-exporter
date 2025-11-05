<script setup lang="ts">
import AppCounter from "@/components/AppCounter.vue";
import { extractData } from "@/utils/data";
import { generateIcsCalendar } from "ts-ics";

const downloadCalendar = async () => {
  const calendar = await extractData();
  if (!calendar) {
    // TODO: report error
    return;
  }

  const icsContent = generateIcsCalendar(calendar.data);

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = calendar.name;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
};
</script>

<template>
  <div class="app">
    <h1>Gestime APHP Export</h1>

    <div class="query-section">
      <button @click="downloadCalendar">Download calendar</button>
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
