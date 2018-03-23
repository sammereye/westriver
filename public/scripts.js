$('.classButton').click(() => {
    $('.classSidebar').slideToggle('1000');
    var angle = 0, toAngle = 180;
    if ($('.arrow').getRotateAngle() > 160) {
        angle = 180, toAngle = 0;
    }
    $(".arrow").rotate({
        duration: 1000,
        angle: angle,
        animateTo: toAngle
    });
});