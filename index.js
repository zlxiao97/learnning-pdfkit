const PDFDocument = require('pdfkit');
const fs = require('fs')
const path = require('path');


/** PDF 页面A4纸打印宽高 */
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

/** 文本配置 */
const TEXT_SIZE = 10
const TEXT_RED_COLOR = [192, 80, 77]
const TEXT_BLUE_COLOR = [0, 0, 255]

/** 表格数据 */
const formData = require('./data/form.json')
const DOC_POSTION_X = formData.startX
const DOC_POSTION_Y = formData.startY
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
  .fontSize(size)
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
const drawRect = ({ offsetX = 0, offsetY = 0, column = DOC_MAX_COLUMNS, rowHeight }) => doc.strokeColor('red').rect(getX(DOC_POSTION_X + offsetX), getY(DOC_POSTION_Y + offsetY), getX(column / DOC_MAX_COLUMNS * DOC_WIDTH), getY(rowHeight)).stroke()

/** 创建 PDF 给定文档配置 */
const doc = new PDFDocument({
  margin: 0,
  font: 'fonts/puhui/Alibaba-PuHuiTi-Medium.ttf',
  size: 'A4'
});

/** 文件存储位置 */
doc.pipe(fs.createWriteStream(path.resolve(__dirname, './dist/demo.pdf')))

/** 底图：空白合同 */
doc.image('img/demo_empty.jpg', {
  width: A4_WIDTH,
  height: A4_HEIGHT,
  align: 'center',
  valign: 'center'
})

/** 绘制表格 */
formData.rows.reduce((lastOffsetY, row) => {
  drawRect({ offsetX: 0, offsetY: lastOffsetY, rowHeight: row.height })
  return lastOffsetY + row.height
}, 0)


/** 插入数据 */
setText({
  text: '熊巍',
  positionX: 32,
  positionY: 15.8,
  color: TEXT_RED_COLOR
})

setText({
  text: 'WYB4202021529032036',
  positionX: 25,
  positionY: 12.8,
  color: TEXT_RED_COLOR
})

setText({
  text: '2021/5/29',
  positionX: 83.2,
  positionY: 12.8,
  color: TEXT_RED_COLOR
})

setText({
  text: '695668628@qq.com',
  positionX: 75,
  positionY: 18.5,
  color: TEXT_RED_COLOR
})

setText({
  text: '100,000.00',
  positionX: 29.5,
  positionY: 46.8,
  color: TEXT_BLUE_COLOR
})

setCheckBox({
  text: '家庭自用',
  positionX: 75,
  positionY: 38.3,
  color: TEXT_BLUE_COLOR
})


doc.end();

