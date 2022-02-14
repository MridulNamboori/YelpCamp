function showfilters() {
  const x = document.getElementById("name");
  const y = document.getElementById("price");
  const z = document.getElementById("time");
  x.classList.add("d-none");
  y.classList.add("d-none");
  z.classList.add("d-none");
  let selectedValue = document.getElementById("filters").value;
  if (selectedValue === "name") {
    x.classList.remove("d-none");
  } else if (selectedValue === "price") {
    y.classList.remove("d-none");
  } else if (selectedValue === "time") {
    z.classList.remove("d-none");
  }
}
