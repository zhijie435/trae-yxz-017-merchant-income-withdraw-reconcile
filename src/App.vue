<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-zinc-50">
    <NavBar />
    <router-view />
  </div>
</template>