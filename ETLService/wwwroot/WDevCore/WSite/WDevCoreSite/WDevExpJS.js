import { Layout } from "../Template/Layout.js";
const layout = new Layout({ action: () => cargarMarkdown() });

window.onload = async () => {
    document.body.append(layout);
}
async function cargarMarkdown() {
    const response = await fetch("../../README.md");
    const md = await response.text();
    document.getElementById("content").innerHTML = marked.parse(md);
    Prism.highlightAll();
}