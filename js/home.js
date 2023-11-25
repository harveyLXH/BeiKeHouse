$(function () {
  var $searchHouseInput = $('.header .house-search')
  var $searchList = $('.header .search-list')
  var $searchTips = $('.header .search-tips')
  var $searchMenuUl = $('.header .search-menu > ul')
  var $searchMenuArrow = $('.header .arrow')

  var cacheSearchListData = [] // 将热门推荐的数据缓存到这个数组中
  var homePageInfoData = {} // 首页的所有的数据

  var currentSearchPlaceHolder = '请输入区域、商圈或小区名开始'
  var currentSearchBarSelector = 'site'

  // 初始化页面
  initPage()

  // 监听搜索房子输入框的foucs事件

  $searchHouseInput.on('focus', function () {
    // 如果input有数据，应该搜索
    var value = $(this).val()
    if (value.trim()) {
      // 搜索房子（通过代码来模拟用户的输入事件）
      $(this).trigger('input')
      return
    }

    // 如果没有就是热门推荐
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

  $searchHouseInput.on(
    'input',
    debounce(function () {
      var value = $(this).val()
      // url?key=value
      // data: {}
      //
      var curLocation = homePageInfoData.curLocation
      // console.log(curLocation) // { "city": "广州", "cityCode": "440100"}
      HYReq.get(HYAPI.HOME_SEARCH, {
        cityId: curLocation.cityCode,
        cityName: curLocation.city,
        channel: currentSearchBarSelector,
        keyword: value,
        query: value,
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
  )

  $searchMenuUl.on('click', 'li', function () {
    // 1. 修改li的高亮
    var $li = $(this)
    $li.addClass('active').siblings().removeClass('active')

    // 2. 移动箭头
    var liWidth = $li.width()
    var position = $li.position()
    var arrowLeft = position.left + liWidth / 2
    $searchMenuArrow.css('left', arrowLeft)

    // 3. 修改placeholder
    $searchHouseInput.prop({
      placeholder: currentSearchPlaceHolder + $li.text(),
    })

    // 4. 拿到li中绑定的key
    // console.log($li.data('key'))
    currentSearchBarSelector = $li.data('key')
  })

  function initPage() {
    // 1. 拿到首页的数据
    HYReq.get(HYAPI.HOME_PAGE_INFO).then(function (res) {
      homePageInfoData = res
      // 1. 渲染头部的地址
      renderHeaderAddress(res)
      // 2. 渲染搜索栏
      renderSearchBar(res)
    })
  }

  // 渲染头部的地址
  function renderHeaderAddress(res) {
    // 1. 更新左上角的地址
    var addr = res.curLocation || {}
    $('.header .address').text(addr.city)
  }

  //
  function renderSearchBar(res) {
    var searchBarData = res.searchMenus || {}
    var htmlString = ``
    searchBarData.forEach(function (item, index) {
      var active = index === 0 ? 'active' : ''

      htmlString += `<li class="item ${active}" data-key="${item.key}">
        <span>${item.title}</span>
      </li>`
    })

    $searchMenuUl.empty().append(htmlString)
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
