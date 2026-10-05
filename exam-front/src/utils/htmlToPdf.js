// 导出页面为PDF格式
import html2Canvas from 'html2canvas'
import JsPDF from 'jspdf'
export default {
  install(Vue, options) {
    Vue.prototype.getPdf = function() {
      var title = this.htmlTitle // 导出名称
      var type = this.downType // 导出类型 true ->图片 false-> pdf
      var htmlID = document.getElementById('pdfDom')
      // window.pageYoffset = 0; // 如果有滚动条影响，会导致导出的内容不全，可以直接设置导出前置顶
      // document.documentElement.scrollTop = 0;
      // document.body.scrollTop = 0;
      html2Canvas(htmlID, {
        allowTaint: true,
        // scrollY: 50, // 偏移量吧，如果有滚动条影响，但是不想设置滚动条置顶， 可以设置这个，但是要计算滚动了多少
        // scrollX:0,
        // x:0, // 距离左边距离
        // y:10,
        // width: 1000,
        // height: 800
        // 下面两个用来提高清晰度
        dpi: window.devicePixelRatio * 4, // 将分辨率提高到特定的DPI 提高四倍
        scale: 4, // 按比例增加分辨率
        useCORS: true // 【重要】开启跨域配置
      }).then(function(canvas) {
        const contentWidth = canvas.width
        const contentHeight = canvas.height

        // 一页pdf显示html页面生成的canvas高度
        const pageHeight = contentWidth / 592.28 * 841.89
        // 未生成pdf的html页面高度
        let leftHeight = contentHeight
        // 页面偏移
        let position = 0
        const imgWidth = 592.28
        // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
        // let imgHeight = 592.28 / contentWidth * contentHeight
        const imgHeight = 592.28 / contentWidth * contentHeight
        // 1.0 清晰度0-1
        const pageData = canvas.toDataURL('image/jpeg', 1.0)

        if (type) {
        // 生成图片
          // 创建一个 a 标签，并设置 href 和 download 属性
          const el = document.createElement('a')
          // 设置 href 为图片经过 base64 编码后的字符串，默认为 png 格式
          el.href = pageData
          el.download = title
          // 创建一个点击事件并对 a 标签进行触发
          const event = new MouseEvent('click')
          el.dispatchEvent(event)
        } else {
          // 生成 pdf
        // 有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
        // 当内容未超过pdf一页显示的范围，无需分页
        // l 横向 默认竖向
          const PDF = new JsPDF('l', 'pt', 'a4')
          if (leftHeight < pageHeight) {
            PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
          } else {
            while (leftHeight > 0) {
              PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
              leftHeight -= pageHeight
              position -= 841.89
              if (leftHeight > 0) {
                PDF.addPage()
              }
            }
          }
          PDF.save(title + '.pdf')
        }
      })
    }
  }
}

