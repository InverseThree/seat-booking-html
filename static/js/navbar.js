document.addEventListener('DOMContentLoaded', function () {
  fetch('/auth/me')
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 'failed')
        $("a[href!='user.html']").show(500);
      else
        $("a[href!='login.html']").show(500);
    })
})
