---
layout: null
---
$(document).ready(function () {
  function openPanel(e) {
    if ($('.panel-cover').hasClass('panel-cover--collapsed')) return
    currentWidth = $('.panel-cover').width()
    if (currentWidth < 960) {
      $('.panel-cover').addClass('panel-cover--collapsed')
      $('.content-wrapper').addClass('animated slideInRight')
    } else {
      $('.panel-cover').css('max-width', currentWidth)
      $('.panel-cover').animate({'max-width': '530px', 'width': '40%'}, 400, swing = 'swing', function () {})
    }
  }

  function showPageDiv(pagename) {
    $(pagename).show();
    $(pagename).siblings().hide();
  }

  $('a.blog-button').click(function(e) {
    openPanel(e);
    showPageDiv('div.main-post-list');
  });
  $('a.about-button').click(function(e) {
    openPanel(e);
    showPageDiv('div.about');
  });

  if (window.location.hash && (window.location.hash == '#blog' || window.location.hash == '#about')) {
    $('.panel-cover').addClass('panel-cover--collapsed')
    if (window.location.hash == '#blog') {
      showPageDiv('div.main-post-list');
    }
    else if (window.location.hash == '#about') {
      showPageDiv('div.about');
    }
  }

  if (window.location.pathname !== '{{ site.baseurl }}' && window.location.pathname !== '{{ site.baseurl }}index.html') {
    $('.panel-cover').addClass('panel-cover--collapsed')
  }

  $('.btn-mobile-menu').click(function () {
    $('.navigation-wrapper').toggleClass('visible animated bounceInDown')
    $('.btn-mobile-menu__icon').toggleClass('icon-list icon-x-circle animated fadeIn')
  })

  $('.navigation-wrapper .blog-button').click(function () {
    $('.navigation-wrapper').toggleClass('visible')
    $('.btn-mobile-menu__icon').toggleClass('icon-list icon-x-circle animated fadeIn')
  })

})
