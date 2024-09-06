<template>
  <div class="data-manage">
    <router-view></router-view>
  </div>
</template>
<script>
  export default {
    name: "dataManage",
    setup() {},
  };
</script>
<style lang="less" scoped>
  .data-manage {
    width: 100%;
    height: 100%;
    overflow: auto;
    border-radius: 6px;
  }
</style>
