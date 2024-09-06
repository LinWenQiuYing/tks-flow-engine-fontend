<template>
  <div></div>
</template>
<script>
import { ref, reactive } from "vue";

export default {
  name: "CustomNode",
  setup() {
    onMounted(() => {
      console.log("bingo");
    });
    return {};
  },
};
</script>
<style lang="less" scoped></style>
