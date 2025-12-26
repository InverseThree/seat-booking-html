document.addEventListener('DOMContentLoaded', function () {

  window.onscroll = function() {goToTop()};

  function goToTop() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      $("#goToTop").show();
    } else {
      $("#goToTop").hide();
    }
  }

  document.getElementById("goToTop").addEventListener('click', function () {
    document.body.scrollTop = 0; 
    document.documentElement.scrollTop = 0;
  })
});

