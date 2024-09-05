import "./index.css";
import styles from "!!raw-loader!./css/bookNotesStyles.css";
const saveToNewFile = require("./js/saveToNewFile");

// 将样式内容存储到全局变量中，以便在其他地方使用
window.bookNotesStyles = styles;

async function runOperations() {
  console.log("执行文件处理功能");
  await saveToNewFile();
  console.log("所有操作完成");
}

document.getElementById("processFile").addEventListener("click", () => {
  runOperations().catch(console.error);
});
