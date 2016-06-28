$(function(){
    $('.parent').click(function(){
        $(this).closest('li').children('ul').slideToggle();
    });
});