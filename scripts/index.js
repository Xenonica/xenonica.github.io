// Make navbar stick to top of the page when scrolling
$(function () {
    $(document).scroll(function () {
        var $nav = $(".navibar");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });
});