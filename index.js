const PDFDocument = require('pdfkit');
const fs = require('fs')
const path = require('path');

/** demo 数据 */
const demo = require('./demo/data.json')
const USE_DEMO_DATA = true
const demoData = USE_DEMO_DATA ? demo : {}


/** PDF 页面A4纸打印宽高 */
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

/** 文本配置 */
const TEXT_SIZE = 10
const TEXT_RED_COLOR = [192, 80, 77]
const TEXT_BLUE_COLOR = [0, 0, 255]
const TEXT_BLACK_COLOR = [0, 0, 0]

/** 表格数据 */
const formData = require('./data/form.json')

const DOC_WIDTH = formData.width
const DOC_MAX_COLUMNS = 24

/** 单位换算工具 */
const getX = xPercent => xPercent * 0.01 * A4_WIDTH
const getY = yPercent => yPercent * 0.01 * A4_HEIGHT
const getPercentX = x => x * 100 / A4_WIDTH
const getPercentY = y => y * 100 / A4_HEIGHT

/** 数据插入辅助方法 */
const setText = ({ text, positionX, positionY, color, size = TEXT_SIZE }) => doc
  .fillColor(color)
  .text(text, getX(positionX), getY(positionY));

const setCheckBox = ({ text, positionX, positionY, gap = 2, boxSize = 10, color, size = TEXT_SIZE }) => {
  doc
    .fillColor(color)
    .fontSize(size)
    .text(text, getX(positionX), getY(positionY));
  // const textWidth = doc.widthOfString(text)
  const textHeight = doc.heightOfString(text)
  doc.strokeColor('black').rect(getX((positionX - gap)), getY(positionY + getPercentY(textHeight / 2) - getPercentY(boxSize / 2)), boxSize, boxSize).stroke()
}

/** 表格绘制辅助方法 */
const drawRect = ({ offsetX = 0, offsetY = 0, column = DOC_MAX_COLUMNS, color = "red", rowHeight, page }) => {
  const docPostionX = page.startX
  const docPositionY = page.startY
  doc.strokeColor(color).rect(getX(docPostionX + offsetX), getY(docPositionY + offsetY), getX(column / DOC_MAX_COLUMNS * DOC_WIDTH), getY(rowHeight)).stroke()
}

/** 文本垂直水平居中辅助方法 */
const getCenteredPostion = ({ offsetX = 0, offsetY = 0, column = DOC_MAX_COLUMNS, rowHeight, page, text }) => {
  const docPostionX = page.startX
  const docPositionY = page.startY
  const containerX = docPostionX + offsetX
  const containerY = docPositionY + offsetY
  const containerWidth = column / DOC_MAX_COLUMNS * DOC_WIDTH
  const containerHeight = rowHeight
  const textWidth = getPercentX(doc.widthOfString(text))
  const textHeight = getPercentY(doc.heightOfString(text))
  return {
    positionX: containerX + 0.2,
    positionY: containerY + containerHeight / 2 - textHeight / 2,
  }

}

/** 创建 PDF 给定文档配置 */
const doc = new PDFDocument({
  margin: 0,
  font: 'fonts/puhui/Alibaba-PuHuiTi-Medium.ttf',
  size: 'A4'
});
doc.fontSize(TEXT_SIZE)

/** 文件存储位置 */
doc.pipe(fs.createWriteStream(path.resolve(__dirname, './dist/demo.pdf')))


/** 逐页绘制 */
formData.pages.forEach((page, index) => {
  if (index) {
    doc.addPage()
  }
  /** 底图：空白合同 */
  doc.image(`img/page${index + 1}.jpg`, {
    width: A4_WIDTH,
    height: A4_HEIGHT,
    align: 'center',
    valign: 'center'
  })
  /** 绘制表格 */
  page.rows.reduce((lastOffsetY, row) => {
    // drawRect({ offsetX: 0, offsetY: lastOffsetY, rowHeight: row.height, page }) //更新表格定位用代码
    if (row.fields) {
      row.fields.forEach(field => {
        // drawRect({ offsetX: field.startX, offsetY: lastOffsetY, rowHeight: row.height, column: field.column, color: 'blue', page }) //更新表格定位用代码
        /** 插入数据 */
        if (field.dataIndex && demoData[field.dataIndex]) {
          const fieldData = demoData[field.dataIndex]
          const position = getCenteredPostion({ offsetX: field.startX, offsetY: lastOffsetY, rowHeight: row.height, column: field.column, page, text: fieldData })
          setText({
            text: fieldData,
            color: TEXT_BLACK_COLOR,
            ...position
          })
        }
      })
    }
    return lastOffsetY + row.height
  }, 0)
})




doc.end();

