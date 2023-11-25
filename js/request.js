;(function (window, $) {
  // 这个是公共的请求 request -> $.ajax
  function request(config = {}) {
    return $.ajax({
      url: config.url || '',
      method: config.method || 'GET',
      timeout: config.timeout || 5000,
      data: config.data || {},
      headers: config.headers || {},
      ...config,
    })
  }

  // get -> $.get()
  function get(url, data, config) {
    return request({
      url,
      method: 'GET',
      data,
      ...config,
    })
  }

  // post -> $.post()
  function post(url, data, config) {
    return request({
      url,
      method: 'POST',
      data,
      ...config,
    })
  }

  window.HYReq = {
    request,
    get,
    post,
  }
})(window, jQuery)
