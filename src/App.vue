<script setup lang="ts">
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
  <UApp>
    <div class="app">
      <h1>Gestime APHP Export</h1>

      <UButton
        loading-auto
        label="Download calendar"
        @click="downloadCalendar"
      />
    </div>
  </UApp>
</template>
