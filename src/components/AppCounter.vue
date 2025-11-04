<script setup lang="ts">
import { useCounterStore } from "@/stores/counter";

const counter = useCounterStore();
</script>

<template>
  <button @click="counter.increment">Count: {{ counter.count }}</button>
</template>
