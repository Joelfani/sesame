<template>
  <div>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
  </div>
</template>

<style>
html,body {
  font-family: 'Vollkorn', serif;
}
/* Fade transition for page changes */
.page-enter-active, .page-leave-active {
  transition: all 0.5s;
}
/* Fade transition for entering and leaving elements */
.page-enter-from, .page-leave-to {
  opacity: 0;
  
}
</style>
