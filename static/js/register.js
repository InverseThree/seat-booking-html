import {
  updateImg,
  register
} from './functionList.js'

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('input[type="file"]').addEventListener('change', () => updateImg());
  document.querySelector('input[type="reset"]').addEventListener('click', () => document.querySelector('img').src = './assets/icon.jpg');
  document.getElementById('registerButton').addEventListener('click', () => register(true))
})
