$(function () {
  var $searchHouseInput = $('.header .house-search')
  var $searchList = $('.header .search-list')
  var $searchTips = $('.header .search-tips')

  var cacheSearchListData = [] // 将热门推荐的数据缓存到这个数组中

  // 初始化页面
  initPage()

  // 监听搜索房子输入框的foucs事件

  $searchHouseInput.on('focus', function () {
    if (cacheSearchListData.length) {
      // 渲染界面
      renderSearchList(cacheSearchListData)
      return
    }

    // 1. 发起网络请求获取 热门推荐的数据
    HYReq.get(HYAPI.HOT_RECOMMEND).then(function (res) {
      var searchListData = res.rent_house_list.list || []
      if (!searchListData) {
        return
      }
      // 将复杂的数组映射为简单的数组
      searchListData = searchListData.map(item => {
        return {
          title: item.app_house_title,
        }
      })

      // 优化代码 缓存数据
      cacheSearchListData = searchListData

      // 渲染界面
      renderSearchList(cacheSearchListData)
      // var htmlString = `<li><span>热门搜索</span></li>`
      // searchListData.forEach(function (item) {
      //   htmlString += `
      //     <li>
      //       <span>${item.title}</span>
      //     </li>
      //   `
      // })

      // $searchList.empty().append(htmlString)
      // $searchTips.css('display', 'block')
    })
  })

  $searchHouseInput.on('blur', function () {
    $searchTips.css('display', 'none')
  })

  $searchHouseInput.on('input', function () {
    var value = $(this).val()
    // url?key=value
    // data: {}
    HYReq.get(HYAPI.HOME_SEARCH, {
      cityId: 440100,
      cityName: '广州',
      channel: 'site',
      keyword: '白云山',
      query: '白云山',
    }).then(function (res) {
      // 将复杂的数组转为简单的数组
      var searchListData = res.data.result || []
      searchListData = searchListData.map(item => {
        return {
          title: item.hlsText || item.text,
        }
      })
      // 渲染列表
      renderSearchList(searchListData)
    })
  })

  function initPage() {
    // 1. 拿到首页的数据
    HYReq.get(HYAPI.HOME_PAGE_INFO).then(function (res) {
      // 1. 渲染头部的地址
      renderHeaderAddress(res)
    })
  }

  // 渲染头部的地址
  function renderHeaderAddress(res) {
    // 1. 更新左上角的地址
    var addr = res.curLocation || {}
    $('.header .address').text(addr.city)
  }

  // 渲染搜索列表
  // searchListData: [{title: ''}]
  function renderSearchList(searchListData = []) {
    var htmlString = `<li><span>热门搜索</span></li>`
    searchListData.forEach(function (item) {
      htmlString += `
        <li>
          <span>${item.title}</span>
        </li>
      `
    })
    $searchList.empty().append(htmlString)
    $searchTips.css('display', 'block')
  }
})
