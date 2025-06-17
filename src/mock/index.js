import Mock from 'mockjs'

// 模拟商品分类数据
const categories = [
  { id: 1, name: '餐饮美食', icon: 'food-o' },
  { id: 2, name: '乳品烘焙', icon: 'cake-o' },
  { id: 3, name: '美妆百货', icon: 'gift-o' },
  { id: 4, name: '酒水饮料', icon: 'coffee-o' },
  { id: 5, name: '粮油调味', icon: 'shop-o' },
  { id: 6, name: '冰品面点', icon: 'ice-cream-o' },
  { id: 7, name: '海鲜水产', icon: 'fish-o' },
  { id: 8, name: '肉禽蛋品', icon: 'fire-o' },
  { id: 9, name: '新鲜蔬菜', icon: 'flower-o' },
  { id: 10, name: '时令水果', icon: 'apple-o' }
]

// 模拟轮播图数据
const banners = [
  { id: 1, image: 'https://img01.yzcdn.cn/vant/apple-1.jpg', url: '#' },
  { id: 2, image: 'https://img01.yzcdn.cn/vant/apple-2.jpg', url: '#' },
  { id: 3, image: 'https://img01.yzcdn.cn/vant/apple-3.jpg', url: '#' }
]

// 模拟商品数据
const products = Mock.mock({
  'list|30': [{
    'id|+1': 1,
    'title': '@ctitle(5, 10)',
    'price|1-100.1-2': 1,
    'image': 'https://img01.yzcdn.cn/vant/ipad.jpeg',
    'category_id|1-10': 1,
    'sales|30-500': 30,
    'stock|10-100': 10,
    'description': '@cparagraph(1, 3)'
  }]
}).list

// 模拟搜索接口
Mock.mock(/\/api\/search/, 'get', (options) => {
  const url = new URL(options.url, 'http://example.com')
  const keyword = url.searchParams.get('keyword') || ''
  
  if (!keyword) {
    return {
      code: 200,
      data: products.slice(0, 10),
      message: '获取成功'
    }
  }
  
  const filteredProducts = products.filter(item => 
    item.title.includes(keyword)
  )
  
  return {
    code: 200,
    data: filteredProducts,
    message: '搜索成功'
  }
})

// 模拟获取分类接口
Mock.mock('/api/categories', 'get', {
  code: 200,
  data: categories,
  message: '获取成功'
})

// 模拟获取轮播图接口
Mock.mock('/api/banners', 'get', {
  code: 200,
  data: banners,
  message: '获取成功'
})

// 模拟获取商品列表接口
Mock.mock('/api/products', 'get', {
  code: 200,
  data: products,
  message: '获取成功'
})

// 模拟获取商品详情接口
Mock.mock(/\/api\/products\/\d+/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/products\/(\d+)/)[1])
  const product = products.find(item => item.id === id)
  
  if (product) {
    return {
      code: 200,
      data: product,
      message: '获取成功'
    }
  } else {
    return {
      code: 404,
      data: null,
      message: '商品不存在'
    }
  }
})

// 模拟添加到购物车接口
Mock.mock('/api/cart/add', 'post', (options) => {
  const { productId, quantity } = JSON.parse(options.body)
  
  return {
    code: 200,
    data: {
      cartId: Mock.Random.guid(),
      productId,
      quantity
    },
    message: '添加成功'
  }
})

export default Mock