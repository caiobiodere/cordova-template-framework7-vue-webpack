<template>
    <!-- App -->
    <div id="app">
        <f7-statusbar></f7-statusbar>
        <f7-panel left cover>
            <f7-view url="/panel-left/" links-view=".view-main" />
        </f7-panel>
        <f7-view url="/" :main="true" class="ios-edges"></f7-view>
    </div>
</template>
<script>
export default {
    mounted() {
        console.log(this.$device)
    },
}
</script>