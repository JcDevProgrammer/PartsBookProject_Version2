import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";

const PdfViewer = forwardRef(({ base64Data, uri }, ref) => {
  const [html, setHtml] = useState(null);
  const [isWebLoading, setIsWebLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    if (base64Data) {
      const customHtml = createPdfHtml(base64Data);
      setHtml(customHtml);
    }
  }, [base64Data]);

  const webviewRef = React.useRef(null);
  useImperativeHandle(ref, () => ({
    postMessage: (msg) => {
      if (webviewRef.current) {
        webviewRef.current.postMessage(msg);
      }
    },
  }));

  if (Platform.OS === "web") {
    if (base64Data) {
      return (
        <View style={{ position: "relative", width: "100%", height: "100%" }}>
          {isWebLoading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1,
                backgroundColor: "#fff",
              }}
            >
              <ActivityIndicator size="large" color="#283593" />
            </View>
          )}
          <iframe
            onLoad={() => setIsWebLoading(false)}
            src={"data:application/pdf;base64," + base64Data}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="PDF Viewer"
          />
        </View>
      );
    } else if (uri) {
      return (
        <View style={{ position: "relative", width: "100%", height: "100%" }}>
          {isWebLoading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1,
                backgroundColor: "#fff",
              }}
            >
              <ActivityIndicator size="large" color="#283593" />
            </View>
          )}
          <iframe
            onLoad={() => setIsWebLoading(false)}
            src={uri}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="PDF Viewer"
          />
        </View>
      );
    } else {
      return <Text>No PDF available.</Text>;
    }
  }

  if (!base64Data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#283593" />
      </View>
    );
  }
  if (!html) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#283593" />
      </View>
    );
  }

  return (
    <WebView
      ref={webviewRef}
      originWhitelist={["*"]}
      source={{ html }}
      style={styles.webview}
      mixedContentMode="always"
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
});

function createPdfHtml(base64) {
  const htmlLines = [
    "<!DOCTYPE html>",
    "<html>",
    "<head>",
    '  <meta charset="utf-8"/>',
    "  <style>",
    "    body {",
    "      margin: 0;",
    "      padding: 0;",
    "      background: #ccc;",
    "      font-family: sans-serif;",
    "    }",
    "    #header {",
    "      display: flex;",
    "      align-items: center;",
    "      height: 60px;",
    "      background: #283593;",
    "      color: #fff;",
    "      position: fixed;",
    "      top: 0;",
    "      left: 0;",
    "      right: 0;",
    "      z-index: 1000;",
    "    }",
    "    #searchContainer {",
    "      flex: 1;",
    "      display: flex;",
    "      align-items: center;",
    "      height: 100%;",
    "      padding: 0 10px;",
    "    }",
    "    #searchInput {",
    "      flex: 1;",
    "      height: 40px;",
    "      font-size: 16px;",
    "      border: none;",
    "      border-radius: 4px;",
    "      padding-left: 10px;",
    "      outline: none;",
    "    }",
    "    #searchButton {",
    "      margin-left: 10px;",
    "      height: 40px;",
    "      padding: 0 16px;",
    "      background: #fff;",
    "      color: #283593;",
    "      border: none;",
    "      border-radius: 4px;",
    "      cursor: pointer;",
    "      display: flex;",
    "      align-items: center;",
    "      justify-content: center;",
    "      font-size: 16px;",
    "    }",
    "    #searchButton:hover {",
    "      background: #e0e0e0;",
    "    }",
    "    #searchIcon {",
    "      width: 20px;",
    "      height: 20px;",
    "      margin-right: 5px;",
    "    }",
    "    #outlinePanel {",
    "      position: fixed;",
    "      top: 60px;",
    "      left: 0;",
    "      width: 200px;",
    "      height: calc(100% - 60px);",
    "      background: #f0f0f0;",
    "      overflow-y: auto;",
    "      border-right: 1px solid #999;",
    "    }",
    "    #outlinePanel h3 {",
    "      margin: 0;",
    "      padding: 10px;",
    "      background: #ccc;",
    "      font-size: 14px;",
    "    }",
    "    .outlineItem {",
    "      padding: 8px 10px;",
    "      border-bottom: 1px solid #ddd;",
    "      cursor: pointer;",
    "    }",
    "    .outlineItem:hover {",
    "      background: #eee;",
    "    }",
    "    #viewerContainer {",
    "      margin-left: 200px;",
    "      margin-top: 60px;",
    "      overflow-y: auto;",
    "      height: calc(100% - 60px);",
    "      padding: 10px;",
    "    }",
    "    .pageContainer {",
    "      position: relative;",
    "      margin: 10px auto;",
    "      background: #fff;",
    "      min-height: 400px;",
    "    }",
    "    .pageCanvas {",
    "      display: block;",
    "    }",
    "    .textLayer {",
    "      position: absolute;",
    "      top: 0;",
    "      left: 0;",
    "      pointer-events: none;",
    "      width: 100%;",
    "      height: 100%;",
    "    }",
    "    .textLayer span {",
    "      color: transparent;",
    "      position: absolute;",
    "      white-space: pre;",
    "      line-height: 1;",
    "    }",
    "    .textLayer span.highlight {",
    "      background-color: rgba(255, 255, 0, 0.3);",
    "      color: transparent;",
    "      border-radius: 2px;",
    "      padding: 1px;",
    "    }",
    "  </style>",
    '  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>',
    '  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js"></script>',
    "</head>",
    "<body>",
    '  <div id="header">',
    '    <div id="searchContainer">',
    '      <input type="text" id="searchInput" placeholder="Search in PDF..." />',
    '      <button id="searchButton">',
    '        <img id="searchIcon" src="https://cdn-icons-png.flaticon.com/512/54/54481.png" alt="Search Icon" />',
    "        <span>Search</span>",
    "      </button>",
    "    </div>",
    "  </div>",
    '  <div id="outlinePanel">',
    "    <h3>Document Outline</h3>",
    '    <div id="outlineItems"></div>',
    "  </div>",
    '  <div id="viewerContainer"></div>',
    "  <script>",
    '    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";',
    "    var pdfDoc = null;",
    "    var pageCount = 0;",
    "    var devicePixelRatio = window.devicePixelRatio || 1;",
    "    function escapeRegExp(str) {",
    "      var pattern = /[.*+?^${}()|[\\]\\\\]/g;",
    '      return str.replace(pattern, "\\\\$&");',
    "    }",
    "    function renderPage(pageNum) {",
    "      return pdfDoc.getPage(pageNum).then(function(page) {",
    "        var scale = 1.0;",
    "        var viewport = page.getViewport({ scale: scale });",
    '        var container = document.getElementById("pageContainer-" + pageNum);',
    "        container.style.width = viewport.width + 'px';",
    "        container.style.height = viewport.height + 'px';",
    '        var canvas = document.createElement("canvas");',
    '        canvas.className = "pageCanvas";',
    "        canvas.width = viewport.width * devicePixelRatio;",
    "        canvas.height = viewport.height * devicePixelRatio;",
    "        canvas.style.width = viewport.width + 'px';",
    "        canvas.style.height = viewport.height + 'px';",
    "        container.appendChild(canvas);",
    "        var ctx = canvas.getContext('2d');",
    "        ctx.scale(devicePixelRatio, devicePixelRatio);",
    "        return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function() {",
    "          return page.getTextContent();",
    "        }).then(function(textContent) {",
    '          var textLayerDiv = document.createElement("div");',
    '          textLayerDiv.className = "textLayer";',
    "          textLayerDiv.style.width = viewport.width + 'px';",
    "          textLayerDiv.style.height = viewport.height + 'px';",
    "          container.appendChild(textLayerDiv);",
    "          return pdfjsLib.renderTextLayer({",
    "            textContent: textContent,",
    "            container: textLayerDiv,",
    "            viewport: viewport,",
    "            textDivs: []",
    "          }).promise.then(function() {",
    "            container.setAttribute('data-rendered', 'true');",
    "          });",
    "        });",
    "      });",
    "    }",
    "    pdfjsLib.getDocument({",
    '      data: Uint8Array.from(atob("' +
      base64 +
      '"), function(c) { return c.charCodeAt(0); })',
    "    }).promise.then(function(pdf) {",
    "      pdfDoc = pdf;",
    "      pageCount = pdf.numPages;",
    "      var viewerContainer = document.getElementById('viewerContainer');",
    "      for (var i = 1; i <= pageCount; i++) {",
    '        var pageContainer = document.createElement("div");',
    '        pageContainer.className = "pageContainer";',
    '        pageContainer.id = "pageContainer-" + i;',
    "        viewerContainer.appendChild(pageContainer);",
    "      }",
    "      async function renderAllPages() {",
    "        for (let i = 1; i <= pageCount; i++) {",
    "          await renderPage(i);",
    "        }",
    "      }",
    "      renderAllPages();",
    "      pdfDoc.getOutline().then(function(outline) {",
    "        if (!outline || !outline.length) {",
    '          document.getElementById("outlineItems").innerHTML = "<p>No Outline found.</p>";',
    "          return;",
    "        }",
    '        var outlineItemsDiv = document.getElementById("outlineItems");',
    "        outline.forEach(function(item) {",
    '          var div = document.createElement("div");',
    '          div.className = "outlineItem";',
    "          div.textContent = item.title;",
    "          div.onclick = function() {",
    "            if (item.dest) {",
    "              pdfDoc.getPageIndex(item.dest[0]).then(function(pageIndex) {",
    "                var target = document.getElementById('pageContainer-' + (pageIndex + 1));",
    "                if (target) {",
    "                  target.scrollIntoView({ behavior: 'smooth' });",
    "                }",
    "              });",
    "            }",
    "          };",
    "          outlineItemsDiv.appendChild(div);",
    "        });",
    "      });",
    "    });",
    "    function searchInPDF() {",
    '      var term = document.getElementById("searchInput").value;',
    "      if (!term) {",
    "        return;",
    "      }",
    "      var lowerTerm = term.toLowerCase();",
    "      var escaped = escapeRegExp(term);",
    '      var regex = new RegExp("(" + escaped + ")", "gi");',
    "      for (var p2 = 1; p2 <= pageCount; p2++) {",
    "        var container = document.getElementById('pageContainer-' + p2);",
    "        if (!container) continue;",
    "        var spans = container.querySelectorAll('.textLayer span');",
    "        spans.forEach(function(span) {",
    '          var originalText = span.getAttribute("data-original") || span.textContent;',
    "          if (originalText.toLowerCase().includes(lowerTerm)) {",
    "            var highlighted = originalText.replace(regex, '<span class=\"highlight\">$1</span>');",
    "            span.innerHTML = highlighted;",
    "          } else {",
    "            span.innerHTML = originalText;",
    "          }",
    "        });",
    "      }",
    "    }",
    '    document.getElementById("searchButton").addEventListener("click", function(){',
    "      searchInPDF();",
    "    });",
    '    document.getElementById("searchInput").addEventListener("input", searchInPDF);',
    '    document.addEventListener("message", function(e) {',
    '      if (e.data === "focusSearch") {',
    '        document.getElementById("searchInput").focus();',
    "      }",
    "    });",
    "  </script>",
    "</body>",
    "</html>",
  ];
  return htmlLines.join("\n");
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PdfViewer;
