<template>
    <div>
    <NavBar />
    <MainPage>
        <NuxtPage />
    </MainPage>
    </div>
    
</template>

<script>
export default {
    mounted() {
        setInterval(async () => {
            if (!navigator.onLine) {
            alert('Vous êtes hors ligne! Veuillez vous connecter à internet et rafraichir la page')
        }
        },1000)
    }
}
</script>

<style></style>