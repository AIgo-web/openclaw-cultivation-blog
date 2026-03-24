// GitHub Pages SPA 路由恢复：将 404.html 重定向过来的路径还原
// 404.html 将路径编码为 ?p=/some/path 格式，这里负责还原
(function(l) {
  var search = l.search;
  // 匹配 ?p=/ 开头的参数（404.html 的编码格式）
  var match = search.match(/[?&]p=(\/[^&]*)/);
  if (match) {
    var path = match[1].replace(/~and~/g, '&');
    // 提取可能存在的 q= 参数（原始 query string）
    var qMatch = search.match(/[?&]q=([^&]*)/);
    var query = qMatch ? '?' + qMatch[1].replace(/~and~/g, '&') : '';
    // 去掉 pathname 末尾的 /，避免双斜杠
    var base = l.pathname.replace(/\/$/, '');
    window.history.replaceState(
      null, null,
      base + path + query + l.hash
    );
  }
}(window.location));
