function showPassword() {
  let x = document.getElementById("password");
  let y = document.getElementById("show1");
  let z = document.getElementById("hide1");
  if (x.type === "password") {
    x.type = "text";
    y.style.display = "block";
    z.style.display = "none";
  } else {
    x.type = "password";
    y.style.display = "none";
    z.style.display = "block";
  }
}

function showConfirmPassword() {
  let x = document.getElementById("confirmPassword");
  let y = document.getElementById("show2");
  let z = document.getElementById("hide2");
  if (x.type === "password") {
    x.type = "text";
    y.style.display = "block";
    z.style.display = "none";
  } else {
    x.type = "password";
    y.style.display = "none";
    z.style.display = "block";
  }
}
