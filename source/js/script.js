// Убираем класс js
if (document.querySelector('.no-js')) {
  document.querySelector('.no-js').classList.remove('no-js');
}

// Меню
var menu = document.querySelector('.main-nav');
var menuBtn = document.querySelector('.main-nav__toggle');

menuBtn.addEventListener('click', function (evt) {
  evt.preventDefault();
  menu.classList.toggle('main-nav--open');
});
