import Mock from 'mockjs'

// 模拟商品分类数据
const categories = [
  { id: 1, name: '餐饮美食', icon: '/icons/餐饮美食.svg' },
  { id: 2, name: '乳品烘焙', icon: '/icons/乳品烘焙.svg' },
  { id: 3, name: '美妆百货', icon: '/icons/美妆百货.svg' },
  { id: 4, name: '酒水饮料', icon: '/icons/酒水饮料.svg' },
  { id: 5, name: '粮油调味', icon: '/icons/粮油调味.svg' },
  { id: 6, name: '冰品面点', icon: '/icons/冰品面点.svg' },
  { id: 7, name: '海鲜水产', icon: '/icons/海鲜水产.svg' },
  { id: 8, name: '肉禽蛋品', icon: '/icons/肉禽蛋品.svg' },
  { id: 9, name: '新鲜蔬菜', icon: '/icons/新鲜蔬菜.svg' },
  { id: 10, name: '时令水果', icon: '/icons/时令水果.svg' }
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
        'id|+1': 1,                      // 自增 ID，从 1 开始
        'title': '@ctitle(5, 10)',       // 随机生成 5-10 个汉字的中文标题
        'price|1-100.1-2': 1,           // 随机价格（1-100，小数点后 1-2 位）
        'image': 'https://img01.yzcdn.cn/vant/ipad.jpeg', // 固定图片 URL
        'category_id|1-10': 1,          // 随机分类 ID（1-10 的整数）
        'sales|30-500': 30,             // 随机销量（30-500 的整数）
        'stock|10-100': 10,             // 随机库存（10-100 的整数）
        'description': '@cparagraph(1, 3)' // 随机生成 1-3 段中文描述
    }]
}).list; // 最终提取 `list` 数组赋值给 `products`

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