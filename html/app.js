/* Variables */
let isMoving = false;
let hudPosition = { x: 0, y: 0 };

/* Event Listeners */
window.addEventListener('message', event => {
  const data = event.data;

  switch (data.action) {
    case 'playerData':
      if(data.id){
        $('.id').text(data.id);
      }
      if(data.cash){
        $('.cash').text(data.cash);
      }
      if(data.bank){
        $('.bank').text(data.bank);
      }
      if(data.job){
        $('.job').text(data.job);
      }
      if(data.gang){
        $('.gang').text(data.gang);
      }
      break;
    case 'jobChange':
      if(data.job){
        $('.job').text(data.job).css('animation', `flash-change 1.5s ease-in-out`);
        setTimeout(() => {
          $('.job').css('animation', '');
        }, 1500);
      }
      break;
    case 'gangChange':
      if(data.gang){
        $('.gang').text(data.gang).css('animation', `flash-change 1.5s ease-in-out`);
        setTimeout(() => {
          $('.gang').css('animation', '');
        }, 1500);
      }
      break;
    case 'moneyChange':
      if (data.account === 'cash') {
        $('.cash').text(data.amount).css('animation', `flash-${data.changeType} 1.5s ease-in-out`);
        setTimeout(() => {
          $('.cash').css('animation', '');
        }, 1500);
      }
      if (data.account === 'bank') {
        $('.bank').text(data.amount).css('animation', `flash-${data.changeType} 1.5s ease-in-out`);
        setTimeout(() => {
          $('.bank').css('animation', '');
        }, 1500);
      }
      break;
    case 'toggleDisplay':
      $('.button-container').hide();
      if (data) {
        if (data.show) {
          $('.huditems').fadeIn(500);
        } else {
          $('.huditems').fadeOut(300);
        }
      }
      break;
    case 'setPosition':
      if(data){
        $('.huditems').css({
          left: data.left + 'px',
          top: data.top + 'px'
        });
        hudPosition = { x: data.left, y: data.top };
      }
      break;
    case 'startMove':
      $('.button-container').fadeIn(300, function() {
        isMoving = true;
      });
      break;
  }
});

/* Functions */
$(function () {
  const $huditems = $('.huditems');

  $huditems.draggable({
    containment: 'window',
    stop: function (ui) {
      hudPosition = ui.position;
    }
  });

  $('.close-button').click(function() {
    if (isMoving) {
      handleStopMove();
    }
  });

  $(document).keydown(function(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (isMoving) {
        handleStopMove();
      }
    }
  });

  function handleStopMove() {
    const $huditems = $('.huditems');
    const position = $huditems.position();

    $('.button-container').fadeOut(300, function() {
      isMoving = false;
      $.post('https://sg-minihud/stopMove', JSON.stringify({
        left: position.left,
        top: position.top
      }));
    });
  }
});