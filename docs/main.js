// Sample TypeScript file for GitHub Pages
function greet(name) {
    return "Hello, ".concat(name, "! Welcome to GitHub Pages with TypeScript.");
}
document.addEventListener("DOMContentLoaded", function () {
    var el = document.getElementById("ts-greeting");
    if (el) {
        el.textContent = greet("Visitor");
    }
});
