const numCampers = document.querySelector("#numcamper");
const numDays = document.querySelector("#num-days");
numCampers.addEventListener("keyup", function () {
  const num = numCampers.value || 0;
  const num1 = numDays.value || 0;
  createFields(num);
  generatePrice(num, num1);
});
numCampers.addEventListener("mouseup", function () {
  const num = numCampers.value || 0;
  const num1 = numDays.value || 0;
  createFields(num);
  generatePrice(num, num1);
});
numDays.addEventListener("keyup", function () {
  const num = numCampers.value || 0;
  const num1 = numDays.value || 0;
  generatePrice(num, num1);
});
numDays.addEventListener("mouseup", function () {
  const num = numCampers.value || 0;
  const num1 = numDays.value || 0;
  generatePrice(num, num1);
});

function generatePrice(camper, days) {
  let parent = document.getElementById("price-field");
  let Price = campPrice * camper * days;
  parent.innerText = `${Price}/-`;
}

function createFields(num) {
  let parent = document.getElementById("name-field");
  let child = parent.lastElementChild;
  while (child) {
    parent.removeChild(child);
    child = parent.lastElementChild;
  }
  for (i = 0; i < num; ++i) {
    let nameInput = document.createElement("input");
    let ageInput = document.createElement("input");
    let labelAge = document.createElement("label");
    let labelName = document.createElement("label");
    let Div1 = document.createElement("div");
    let Div2 = document.createElement("div");
    let Div3 = document.createElement("div");
    let Div4 = document.createElement("div");
    let Div5 = document.createElement("div");

    Div1.classList.add("row");
    Div1.classList.add("mb-2");

    Div2.classList.add("col-6");
    Div4.classList.add("col-2");

    Div3.classList.add("input-group");
    Div5.classList.add("input-group");

    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("name", `name[name]`);
    nameInput.setAttribute("id", `name${i + 1}`);
    nameInput.setAttribute("required", "true");
    nameInput.setAttribute("placeholder", `Name of Camper ${i + 1}`);
    nameInput.classList.add("form-control");

    ageInput.setAttribute("type", "number");
    ageInput.setAttribute("min", "8");
    ageInput.setAttribute("max", "65");
    ageInput.setAttribute("id", `age${i + 1}`);
    ageInput.setAttribute("name", `age[age]`);
    ageInput.classList.add("form-control");
    ageInput.setAttribute("required", "true");

    labelName.setAttribute("for", `name${i + 1}`);
    labelName.classList.add("col-2");
    labelName.classList.add("col-form-label");
    labelName.innerText = "Name:";

    labelAge.setAttribute("for", `age${i + 1}`);
    labelAge.classList.add("col-2");
    labelAge.classList.add("col-form-label");
    labelAge.innerText = "Age:";

    Div3.appendChild(nameInput);
    Div2.appendChild(Div3);

    Div5.appendChild(ageInput);
    Div4.appendChild(Div5);

    Div1.appendChild(labelName);
    Div1.appendChild(Div2);
    Div1.appendChild(labelAge);
    Div1.appendChild(Div4);

    parent.appendChild(Div1);
  }
}
