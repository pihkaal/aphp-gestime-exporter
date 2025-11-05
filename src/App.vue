<script setup lang="ts">
import { ref } from "vue";
import { extractData } from "@/utils/data";
import { generateIcsCalendar } from "ts-ics";

const error = ref<string | null>(null);

const downloadCalendar = async () => {
  error.value = null;

  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 500),
  );

  let downloadUrl: string | null = null;
  try {
    // extract data and convert to ics
    const calendar = await extractData();
    const icsContent = generateIcsCalendar(calendar.data);

    // create blob from ics content then download
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = calendar.name;
    link.click();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  }
};
</script>

<template>
  <UApp>
    <UCard class="w-[450px] rounded-none">
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">
            Gestime APHP Export
          </h1>

          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-github"
              to="https://github.com/pihkaal/gestime-aphp-export"
              target="_blank"
              color="neutral"
              variant="ghost"
              size="md"
            />
            <UColorModeButton size="md" />
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div class="space-y-2">
          <UButton
            loading-auto
            label="Download Calendar"
            icon="i-lucide-download"
            size="lg"
            block
            color="secondary"
            variant="subtle"
            @click="downloadCalendar"
          />
          <UAlert
            v-if="error"
            color="error"
            icon="i-lucide-circle-x"
            :title="error"
          />
        </div>

        <UButton
          label="Import in Google Calendar"
          icon="i-lucide-external-link"
          size="lg"
          block
          color="secondary"
          variant="subtle"
          to="https://calendar.google.com/calendar/u/0/r/settings/export"
          target="_blank"
        />
      </div>
    </UCard>
  </UApp>
</template>
