<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* 全局控制光标显示 - 更高优先级 */
*:not(input:focus):not(textarea:focus) {
  caret-color: transparent !important;
}

input:focus, textarea:focus {
  caret-color: auto !important;
}
</style>
<style scoped>
</style>
