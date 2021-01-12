$(function () {
    $(document).scroll(function () {
        var $nav = $(".navibar");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });
});