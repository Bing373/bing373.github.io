window.onscroll = function() {stickyFunction()};

var navigationBar = document.getElementById("navigationBar");
var box2OffsetTop = document.getElementsByClassName("box2")[0].offsetTop;

function stickyFunction() {
    if (window.pageYOffset >= box2OffsetTop) {
        navigationBar.classList.add("sticky");
    } else {
        navigationBar.classList.remove("sticky");
    }
}