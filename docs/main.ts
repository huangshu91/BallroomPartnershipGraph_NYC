// Sample TypeScript file for GitHub Pages

function greet(name: string): string {
  return `Hello, ${name}! Welcome to GitHub Pages with TypeScript.`;
}

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("ts-greeting");
  if (el) {
    el.textContent = greet("Visitor");
  }
});