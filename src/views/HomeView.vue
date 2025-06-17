<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { showToast } from 'vant'

// 数据
const searchValue = ref('')
const banners = ref([])
const categories = ref([])
const products = ref([])
const loading = ref(false)
const finished = ref(false)
const activeTab = ref(0)
const tabs = ref(['全部', '菜谱', '早餐', '休闲', '人气'])

// 获取轮播图数据
const getBanners = async () => {
  try {
    const res = await axios.get('/banners')
    if (res.data.code === 200) {
      banners.value = res.data.data
    }
  } catch (error) {
    console.error('获取轮播图失败', error)
  }
}

// 获取分类数据
const getCategories = async () => {
  try {
    const res = await axios.get('/categories')
    if (res.data.code === 200) {
      categories.value = res.data.data
    }
  } catch (error) {
    console.error('获取分类失败', error)
  }
}

// 获取商品数据
const getProducts = async () => {
  try {
    loading.value = true
    const res = await axios.get('/products')
    if (res.data.code === 200) {
      products.value = res.data.data
      finished.value = true
    }
  } catch (error) {
    console.error('获取商品失败', error)
  } finally {
    loading.value = false
  }
}

// 搜索商品
const onSearch = async () => {
  try {
    loading.value = true
    const res = await axios.get(`/search?keyword=${searchValue.value}`)
    if (res.data.code === 200) {
      products.value = res.data.data
      finished.value = true
    }
  } catch (error) {
    console.error('搜索商品失败', error)
  } finally {
    loading.value = false
  }
}

// 添加到购物车
const addToCart = async (product) => {
  try {
    const res = await axios.post('/cart/add', {
      productId: product.id,
      quantity: 1
    })
    if (res.data.code === 200) {
      showToast('添加成功')
    }
  } catch (error) {
    console.error('添加购物车失败', error)
    showToast('添加失败')
  }
}

// 切换标签页
const onTabChange = (index) => {
  activeTab.value = index
  // 这里可以根据标签筛选商品
  getProducts()
}

onMounted(() => {
  getBanners()
  getCategories()
  getProducts()
})
</script>

<template>
  <div class="home">
    <!-- 搜索栏 -->
    <div class="search-container">
      <van-search
        v-model="searchValue"
        placeholder="水果"
        shape="round"
        background="#42b983"
        @search="onSearch"
      >
        <template #left>
          <van-icon name="location-o" size="18" />
        </template>
        <template #right>
          <van-icon name="chat-o" size="18" style="margin-right: 10px" />
        </template>
      </van-search>
    </div>

    <!-- 轮播图 -->
    <van-swipe class="banner" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="banner in banners" :key="banner.id">
        <img :src="banner.image" alt="banner" />
      </van-swipe-item>
    </van-swipe>

    <!-- 商品分类 -->
    <div class="category-container">
      <van-grid :column-num="5" :border="false">
        <van-grid-item v-for="category in categories.slice(0, 5)" :key="category.id" :icon="category.icon" :text="category.name" />
      </van-grid>
      <van-grid :column-num="5" :border="false">
        <van-grid-item v-for="category in categories.slice(5, 10)" :key="category.id" :icon="category.icon" :text="category.name" />
      </van-grid>
    </div>

    <!-- 商品标签页 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" sticky>
      <van-tab v-for="(tab, index) in tabs" :key="index" :title="tab">
        <!-- 商品列表 -->
        <van-pull-refresh @refresh="getProducts">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
          >
            <div class="product-list">
              <div class="product-item" v-for="product in products" :key="product.id">
                <van-image :src="product.image" width="100%" height="100px" />
                <div class="product-info">
                  <div class="product-title">{{ product.title }}</div>
                  <div class="product-price-cart">
                    <span class="product-price">¥{{ product.price.toFixed(2) }}</span>
                    <van-icon name="cart-o" class="cart-icon" @click="addToCart(product)" />
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 50px;
}

.search-container {
  position: sticky;
  top: 0;
  z-index: 999;
}

.banner {
  height: 150px;
  margin-bottom: 10px;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-container {
  margin-bottom: 10px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}

.product-item {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-info {
  padding: 8px;
}

.product-title {
  font-size: 14px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price-cart {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  color: #f44;
  font-weight: bold;
}

.cart-icon {
  font-size: 20px;
  color: #42b983;
}
</style>
