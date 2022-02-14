const password = document.getElementById("password");
const passwordStrength = document.getElementById("password-strength");
const lowerUpperCase = document.querySelector(".low-upper-case i");
const number = document.querySelector(".one-number i");
const specialChar = document.querySelector(".one-special-char i");
const eightChar = document.querySelector(".eight-character i");

password.addEventListener("keyup", function () {
  const pass = password.value;
  checkStrength(pass);
});

function checkStrength(password) {
  let strength = 0;
  if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
    strength += 1;
    lowerUpperCase.classList.remove("fa-circle");
    lowerUpperCase.classList.add("fa-check");
  } else {
    lowerUpperCase.classList.remove("fa-check");
    lowerUpperCase.classList.add("fa-circle");
  }

  if (password.match(/([0-9])/)) {
    strength += 1;
    number.classList.remove("fa-circle");
    number.classList.add("fa-check");
  } else {
    number.classList.remove("fa-check");
    number.classList.add("fa-circle");
  }

  if (password.match(/([!,@,#,$,%,^,&,*,?,_,~])/)) {
    strength += 1;
    specialChar.classList.remove("fa-circle");
    specialChar.classList.add("fa-check");
  } else {
    specialChar.classList.remove("fa-check");
    specialChar.classList.add("fa-circle");
  }

  if (password.length > 7) {
    strength += 1;
    eightChar.classList.remove("fa-circle");
    eightChar.classList.add("fa-check");
  } else {
    eightChar.classList.remove("fa-check");
    eightChar.classList.add("fa-circle");
  }

  if (strength === 0) {
    passwordStrength.style = "width: 0%";
  } else if (strength === 1) {
    passwordStrength.classList.remove("progress-bar-warning");
    passwordStrength.classList.remove("progress-bar-success");
    passwordStrength.classList.remove("progress-bar-sufficient");
    passwordStrength.classList.add("progress-bar-danger");
    passwordStrength.style = "width: 25%";
  } else if (strength === 2) {
    passwordStrength.classList.remove("progress-bar-danger");
    passwordStrength.classList.remove("progress-bar-success");
    passwordStrength.classList.remove("progress-bar-sufficient");
    passwordStrength.classList.add("progress-bar-warning");
    passwordStrength.style = "width: 50%";
  } else if (strength === 3) {
    passwordStrength.classList.remove("progress-bar-success");
    passwordStrength.classList.remove("progress-bar-danger");
    passwordStrength.classList.remove("progress-bar-warning");
    passwordStrength.classList.add("progress-bar-sufficient");
    passwordStrength.style = "width: 75%";
  } else if (strength === 4) {
    passwordStrength.classList.remove("progress-bar-warning");
    passwordStrength.classList.remove("progress-bar-danger");
    passwordStrength.classList.remove("progress-bar-sufficient");
    passwordStrength.classList.add("progress-bar-success");
    passwordStrength.style = "width: 100%";
  }
}
