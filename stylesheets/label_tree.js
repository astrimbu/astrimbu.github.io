$(function(){
    $('li').click(function(){
        $(this).closest('li').children('ul').slideToggle();
    });
});