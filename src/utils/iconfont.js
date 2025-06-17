// 在这里引入阿里图标库
// 示例：将下面的链接替换为您在阿里图标库生成的链接
const loadIconFont = () => {
  const script = document.createElement('script')
  script.src = '//at.alicdn.com/t/font_2553510_xxxx.js' // 替换为您的图标库链接
  document.body.appendChild(script)
}

export default loadIconFont