const PDFDocument = require('pdfkit');
const fs = require('fs')
const path = require('path');

/** demo 数据 */
const demo = require('./demo/data.json')
const USE_DEMO_DATA = true
const demoData = USE_DEMO_DATA ? demo : {}

/** 绘制参数 */
const config = require('./data/config')

/** 表格数据 */
const formData = require('./data/form.json')


/** 工具类 */
const utils = require('./utils')
const { setText, setCheckBox, drawRect, getCenteredPostion } = utils;


/** 主程序 */
(function () {
  /** 创建 PDF 给定文档配置 */
  const doc = new PDFDocument({
    margin: 0,
    font: 'fonts/puhui/Alibaba-PuHuiTi-Medium.ttf',
    size: 'A4'
  });

  /** 全局字体大小配置 */
  doc.fontSize(config.TEXT_SIZE)

  /** 文件存储位置 */
  doc.pipe(fs.createWriteStream(path.resolve(__dirname, './dist/demo.pdf')))

  /** 逐页绘制 */
  formData.pages.forEach((page, index) => {
    if (index) {
      doc.addPage()
    }
    /** 底图：空白合同 */
    doc.image(`img/page${index + 1}.jpg`, {
      width: config.A4_WIDTH,
      height: config.A4_HEIGHT,
      align: 'center',
      valign: 'center'
    })

    const drawRow = (lastOffsetY, row) => {
      /** 绘制边框，预览表格定位用代码 */
      // drawRect({ offsetX: 0, offsetY: lastOffsetY, rowHeight: row.height, page })
      const drawFiled = field => {
        /** 绘制边框，预览表格定位用代码 */
        // drawRect({ offsetX: field.startX, offsetY: lastOffsetY, rowHeight: row.height, column: field.column, color: 'blue', page })
        /** 插入数据 */
        if (field.dataIndex && demoData[field.dataIndex]) {
          const fieldData = demoData[field.dataIndex]
          const position = getCenteredPostion(doc, { offsetX: field.startX, offsetY: lastOffsetY, rowHeight: row.height, column: field.column, page, text: fieldData })
          setText(doc, {
            text: fieldData,
            color: config.TEXT_BLACK_COLOR,
            ...position
          })
        }
      }
      if (row.fields) {
        row.fields.forEach(drawFiled)
      }
      return lastOffsetY + row.height
    }
    const drawPage = (page) => page.rows.reduce(drawRow, 0)
    /** 绘制表格 */
    drawPage(page)
  })

  doc.end();

})()
