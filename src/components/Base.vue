<template>
  <div class="base-layout">
    <router-view />
    <van-tabbar v-model="active" route>
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="apps-o" to="/category">分类</van-tabbar-item>
      <van-tabbar-item icon="shopping-cart-o" to="/cart">购物车</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Tabbar as VanTabbar, TabbarItem as VanTabbarItem } from 'vant';

const active = ref(0);
</script>

<style scoped>
.base-layout {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Ensure full viewport height */
}

/* Ensure router-view takes up available space above tabbar */
.base-layout > :first-child {
  flex-grow: 1;
  overflow-y: auto; /* Allow scrolling for content */
}

/* Optional: Add some padding to the content area if needed */
/* .base-layout > :first-child {
  padding-bottom: 50px; /* Adjust based on tabbar height */
/*}*/
</style>