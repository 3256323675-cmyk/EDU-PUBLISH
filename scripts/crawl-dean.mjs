


import fs from "fs";
import path from "path";

const LIST_URL = "https://dean.xjtu.edu.cn/jxxx/jxtz2/620.htm";
const OUT = "public/notices.json";
const BASE = "https://dean.xjtu.edu.cn/jxxx/";

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120 Safari/537.36",
    },
  });
  return await res.text();
}

function loadExisting() {
  if (!fs.existsSync(OUT)) return [];
  try {
    return JSON.parse(fs.readFileSync(OUT, "utf8"));
  } catch {
    return [];
  }
}

function parseItems(html) {
  const items = [];
  const re =
    /<li[^>]*>\s*<a[^>]*href="([^"]+\.htm)"[^>]*(?:title="([^"]*)")?[^>]*>([^<]*)<\/a>[\s\S]*?<span>([^<]+)<\/span>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1];
    const titleAttr = m[2];
    const titleText = m[3];
    let date = m[4] ? m[4].trim() : "";

    let title = (titleAttr || titleText).replace(/\s+/g, " ").trim();
    if (!title) continue;

    // 过滤导航和无日期条目
    if (
      ["首页", "部门介绍", "机构设置", "领导分工", "联系方式", "党建工作"].includes(
        title
      )
    )
      continue;
    if (href.includes("/zjw/")) continue;
    if (!date) continue;

    // 处理相对路径
    if (href.startsWith("../../")) href = href.replace(/^\.\.\/\.\.\//, "");
    else if (href.startsWith("../")) href = href.replace(/^\.\.\//, "");
    const url = new URL(href, BASE).toString();
    const id = url;

    items.push({ id, title, url, date, category: "教务" });
  }
  return items;
}

const html = await fetchHtml(LIST_URL);
const fresh = parseItems(html);
const old = loadExisting();
const seen = new Set(old.map((x) => x.id));
const added = fresh.filter((x) => !seen.has(x.id));

const next = [...added, ...old].slice(0, 200);
fs.writeFileSync(OUT, JSON.stringify(next, null, 2) + "\n", "utf8");

console.log("抓到 " + fresh.length + " 条，新增 " + added.length + " 条");
