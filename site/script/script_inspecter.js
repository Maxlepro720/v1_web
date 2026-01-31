const _u = localStorage.getItem('username');

if (_u === atob('bWF4YnJ5eDEx')) {
  // saut / bypass
} else {
  document.addEventListener("contextmenu", e => e.preventDefault());

  document.addEventListener("keydown", e => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key)) ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
      return false;
    }
  });
}