<template>
  <div class="category">
    <van-nav-bar title="分类" fixed placeholder />
    
    <div class="category-container">
      <!-- 左侧分类导航 -->
      <div class="category-nav">
        <van-sidebar v-model="activeCategory">
          <van-sidebar-item 
            v-for="category in categories" 
            :key="category.id"
            :title="category.name"
            @click="loadCategoryProducts(category.id)"
          />
        </van-sidebar>
      </div>
      
      <!-- 右侧商品列表 -->
      <div class="category-content">
        <div class="category-header" v-if="currentCategory">
          <div class="category-icon">
            <img :src="currentCategory.icon" :alt="currentCategory.name" />
          </div>
          <div class="category-name">{{ currentCategory.name }}</div>
        </div>
        
        <van-empty v-if="products.length === 0" description="暂无商品" />
        
        <van-list
          v-else
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="product-list">
            <van-cell 
              v-for="product in products" 
              :key="product.id"
              :title="product.title"
              :label="`¥${product.price}`"
              center
            >
              <template #icon>
                <div class="product-img">
                  <img :src="product.image" :alt="product.title" />
                </div>
              </template>
              <template #right-icon>
                <van-icon name="cart-o" class="cart-icon" @click.stop="addToCart(product)" />
              </template>
            </van-cell>
          </div>
        </van-list>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { showToast } from 'vant'
import axios from 'axios'
import { useRoute } from 'vue-router'

// 导入图标
import 餐饮美食Icon from '@/assets/icons/餐饮美食.svg'
import 乳品烘焙Icon from '@/assets/icons/乳品烘焙.svg'
import 美妆百货Icon from '@/assets/icons/美妆百货.svg'
import 酒水饮料Icon from '@/assets/icons/酒水饮料.svg'
import 粮油调味Icon from '@/assets/icons/粮油调味.svg'
import 冰品面点Icon from '@/assets/icons/冰品面点.svg'
import 海鲜水产Icon from '@/assets/icons/海鲜水产.svg'
import 肉禽蛋品Icon from '@/assets/icons/肉禽蛋品.svg'
import 新鲜蔬菜Icon from '@/assets/icons/新鲜蔬菜.svg'
import 时令水果Icon from '@/assets/icons/时令水果.svg'

// 获取路由实例和参数
const route = useRoute()

// 状态变量
const categories = ref([])
const products = ref([])
const activeCategory = ref(0)
const loading = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 计算当前选中的分类
const currentCategory = computed(() => {
  if (categories.value.length === 0) return null
  return categories.value[activeCategory.value]
})

// 直接定义分类数据，使用导入的图标
const initCategories = () => {
  categories.value = [
    { id: 1, name: '餐饮美食', icon: 餐饮美食Icon },
    { id: 2, name: '乳品烘焙', icon: 乳品烘焙Icon },
    { id: 3, name: '美妆百货', icon: 美妆百货Icon },
    { id: 4, name: '酒水饮料', icon: 酒水饮料Icon },
    { id: 5, name: '粮油调味', icon: 粮油调味Icon },
    { id: 6, name: '冰品面点', icon: 冰品面点Icon },
    { id: 7, name: '海鲜水产', icon: 海鲜水产Icon },
    { id: 8, name: '肉禽蛋品', icon: 肉禽蛋品Icon },
    { id: 9, name: '新鲜蔬菜', icon: 新鲜蔬菜Icon },
    { id: 10, name: '时令水果', icon: 时令水果Icon }
  ]
  
  // 检查URL参数中是否有categoryId
  const categoryId = Number(route.query.categoryId)
  if (categoryId) {
    // 找到对应分类的索引
    const index = categories.value.findIndex(c => c.id === categoryId)
    if (index !== -1) {
      activeCategory.value = index
      loadCategoryProducts(categoryId)
      return
    }
  }
  
  // 如果没有参数或找不到对应分类，加载第一个分类
  if (categories.value.length > 0) {
    loadCategoryProducts(categories.value[0].id)
  }
}

// 加载指定分类的商品
const loadCategoryProducts = async (categoryId) => {
  try {
    // 重置分页和加载状态
    currentPage.value = 1
    finished.value = false
    products.value = []
    
    // 获取商品数据
    await fetchCategoryProducts(categoryId)
  } catch (error) {
    console.error('加载分类商品失败:', error)
    showToast('加载分类商品失败')
  }
}

// 获取分类商品数据
const fetchCategoryProducts = async (categoryId) => {
  try {
    const response = await axios.get('/products')
    if (response.data.code === 200) {
      // 过滤出当前分类的商品
      const allProducts = response.data.data
      const filteredProducts = allProducts.filter(p => p.category_id === categoryId)
      
      // 模拟分页
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      const pageProducts = filteredProducts.slice(start, end)
      
      // 追加商品数据
      products.value = [...products.value, ...pageProducts]
      
      // 判断是否加载完成
      if (products.value.length >= filteredProducts.length) {
        finished.value = true
      }
      
      // 更新页码
      currentPage.value++
    }
    
    // 完成加载状态
    loading.value = false
  } catch (error) {
    console.error('获取商品失败:', error)
    loading.value = false
    showToast('获取商品失败')
  }
}

// 加载更多
const onLoad = () => {
  if (currentCategory.value) {
    fetchCategoryProducts(currentCategory.value.id)
  } else {
    loading.value = false
  }
}

// 添加到购物车
const addToCart = async (product) => {
  try {
    const response = await axios.post('/cart/add', {
      productId: product.id,
      quantity: 1
    })
    
    if (response.data.code === 200) {
      showToast('添加成功')
    }
  } catch (error) {
    console.error('添加购物车失败:', error)
    showToast('添加购物车失败')
  }
}

// 监听路由参数变化
watch(() => route.query.categoryId, (newCategoryId) => {
  if (newCategoryId && categories.value.length > 0) {
    const categoryId = Number(newCategoryId)
    const index = categories.value.findIndex(c => c.id === categoryId)
    if (index !== -1) {
      activeCategory.value = index
      loadCategoryProducts(categoryId)
    }
  }
})

// 页面加载时初始化分类数据
onMounted(() => {
  initCategories()
})
</script>

<style scoped>
.category {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.category-container {
  display: flex;
  height: calc(100vh - 46px);
  overflow: hidden;
}

.category-nav {
  width: 85px;
  height: 100%;
  overflow-y: auto;
  background-color: #f7f8fa;
  flex-shrink: 0;
}

.category-content {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  background-color: #fff;
}

.category-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 0;
  background-color: #e6f7ff;
}

.category-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 5px;
}

.category-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.category-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.product-list {
  padding: 0 10px;
}

.product-img {
  width: 60px;
  height: 60px;
  margin-right: 10px;
  overflow: hidden;
  border-radius: 4px;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-icon {
  font-size: 20px;
  color: #1989fa;
  padding: 5px;
}

/* 自定义Vant组件样式 */
:deep(.van-sidebar-item--select) {
  color: #1989fa;
  font-weight: bold;
  border-color: #1989fa;
}

:deep(.van-cell__title) {
  flex: 3;
}

:deep(.van-cell__value) {
  flex: 1;
  text-align: right;
}
</style>