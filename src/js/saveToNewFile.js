async function saveToNewFile() {
  try {
    // 步骤 1: 选择源文件
    const [sourceFileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "HTML Files",
          accept: { "text/html": [".html", ".htm"] },
        },
      ],
      multiple: false,
    });

    // 步骤 2: 选择目标文件
    const saveFileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: "HTML Files",
          accept: { "text/html": [".html", ".htm"] },
        },
      ],
    });

    // 步骤 3: 读取源文件内容
    const sourceFile = await sourceFileHandle.getFile();
    const content = await sourceFile.text();
    // console.log("原始字符串", content);

    // 步骤 4: 处理内容
    const processedContent = handleBodyContent(content);

    // 步骤 5: 删除空格、生成目录、添加内联样式
    const contentWithTOC = handleDom(processedContent);
    // console.log("处理后的字符串", contentWithTOC);

    // 步骤 6: 写入新文件
    const writable = await saveFileHandle.createWritable();
    await writable.write(contentWithTOC);
    await writable.close();

    // console.log("文件处理、添加目录并保存到新文件成功");
  } catch (error) {
    console.error("处理文件时出错:", error);
  }
}

function handleBodyContent(content) {
  // 内容处理逻辑保持不变
  content = content.replace(/<body>\s*<div class='bodyContainer'>/g, "<body>");
  content = content.replace(/<\/div>\s*<\/body>/g, "</body>");
  content = content.replace(/<style>[\s\S]*?<\/style>/g, "");

  return content;
}

function handleDom(htmlContent) {
  // 解析 HTML 字符串
  const parser = new DOMParser();
  let doc = parser.parseFromString(htmlContent, "text/html");

  // 处理内容: 删除多余空格
  doc = deleteSpace(doc);

  // 处理内容: 添加目录
  doc = addTableOfContents(doc);

  doc = addBodyContainer(doc);

  doc = calNoteCount(doc);

  doc = addStyle(doc);

  doc = addViewport(doc);

  // 将修改后的 DOM 序列化回 HTML 字符串
  return new XMLSerializer().serializeToString(doc);
}

function deleteSpace(doc) {
  //   处理noteText里的空格
  const noteText = doc.querySelectorAll(".noteText");
  noteText.forEach((item) => {
    item.textContent = item.textContent.replace(/\s+/g, "");
  });

  return doc;
}

function addTableOfContents(doc) {
  // 查找第一个 <hr> 元素
  const hr = doc.querySelector("hr");
  if (hr) {
    // 创建目录容器
    let tocBox = doc.createElement("div");
    let tocTitle = doc.createElement("div");

    tocBox.setAttribute("class", "tocBox");
    tocTitle.textContent = "目录";
    tocBox.appendChild(tocTitle);

    // 在 <hr> 元素后插入目录容器
    hr.parentNode.insertBefore(tocBox, hr.nextSibling);

    // 为所有 .sectionHeading 元素添加 id
    let h2 = doc.querySelectorAll(".sectionHeading");
    h2.forEach((item, index) => {
      item.setAttribute("id", `section-${index + 1}`);
    });

    // 创建目录列表
    let ul = doc.createElement("ul");
    h2.forEach((item, index) => {
      let li = doc.createElement("li");
      let a = doc.createElement("a");
      a.textContent = item.textContent;
      a.href = `#section-${index + 1}`;
      li.appendChild(a);
      ul.appendChild(li);
    });

    tocBox.appendChild(ul);
  }
  return doc;
}

function addBodyContainer(doc) {
  // 将 body 内部的内容添加到新创建的 .bodyContainer中
  let bodyContainer = doc.createElement("div");
  bodyContainer.setAttribute("class", "bodyContainer");
  let body = doc.querySelector("body");
  bodyContainer.innerHTML = body.innerHTML;
  body.innerHTML = "";
  body.appendChild(bodyContainer);

  return doc;
}

function calNoteCount(doc) {
  // 计算 h3 个数，并显示在顶部
  let h3Arr = doc.querySelectorAll("h3");
  let spanArr = doc.querySelectorAll("span");
  let spanParentArr = [];
  spanArr.forEach((item) => {
    let spanParent = item.parentNode;
    if (spanParent.nodeName === "H3") {
      spanParentArr.push(spanParent);
    }
  });

  // 筛选出在 h3Arr 里但没有在 spanParentArr 里的元素
  let filteredH3Arr = Array.from(h3Arr).filter((h3) => {
    // 检查这个 h3 元素是否不在 spanParentArr 中
    return !spanParentArr.some((spanParent) => spanParent === h3);
  });

  filteredH3Arr.forEach((h3) => {
    h3.classList.add("comment");
  });

  let notebookFor = doc.querySelector(".notebookFor");
  let h3Count = doc.querySelectorAll("h3").length;
  let commentCount = doc.querySelectorAll(".comment").length;
  notebookFor.textContent = `笔记总计 ${h3Count} 条`;
  let noteDetail = doc.createElement("div");
  noteDetail.classList.add("noteDetail");
  noteDetail.textContent = `高亮 ${
    h3Count - commentCount
  } 条，评论 ${commentCount} 条`;
  notebookFor.appendChild(noteDetail);

  return doc;
}

function addStyle(doc) {
  // 添加内联样式
  let style = doc.createElement("style");
  style.textContent = window.bookNotesStyles;
  doc.head.appendChild(style);

  return doc;
}

// 检查是否已存在viewport meta标签
function addViewport(doc) {
  // 检查是否已存在viewport meta标签
  if (!doc.querySelector('meta[name="viewport"]')) {
    // 创建新的meta元素
    const contentTypeMeta = doc.querySelector(
      'meta[http-equiv="Content-Type"]'
    );
    let viewportMeta = doc.createElement("meta");
    viewportMeta.name = "viewport";
    viewportMeta.content = "width=device-width, initial-scale=1.0";

    contentTypeMeta.insertAdjacentElement("afterend", viewportMeta);
  }

  return doc;
}

module.exports = saveToNewFile;
