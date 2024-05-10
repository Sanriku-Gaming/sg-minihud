/* Variables */
let isPlayerDataLoaded = false;
let isMoving = false;
let isSettingsVisible = false;
let hudPosition = { x: 0, y: 0 };
let settingsPosition = 0;

/* Event Listeners */
window.addEventListener('message', event => {
  const data = event.data;

  switch (data.action) {
    case 'playerData':
      if (data.id) {
        $('.id').text(data.id);
      }
      if (data.cash) {
        $('.cash').text('$' + data.cash);
      }
      if (data.bank) {
        $('.bank').text('$' + data.bank);
      }
      if (data.job) {
        $('.job').text(data.job);
      }
      if (data.gang) {
        $('.gang').text(data.gang);
      }
      isPlayerDataLoaded = true
      break;
    case 'jobChange':
      if (data.job) {
        $('.job').text(data.job).css('animation', `flash-change 1.5s ease-in-out`);
        setTimeout(() => {
          $('.job').css('animation', '');
        }, 1500);
      }
      break;
    case 'gangChange':
      if (data.gang) {
        $('.gang').text(data.gang).css('animation', `flash-change 1.5s ease-in-out`);
        setTimeout(() => {
          $('.gang').css('animation', '');
        }, 1500);
      }
      break;
    case 'moneyChange':
      if (data.account === 'cash') {
        $('.cash').text('$' + data.amount).css('animation', `flash-${data.changeType} 1.5s ease-in-out`);
        setTimeout(() => {
          $('.cash').css('animation', '');
        }, 1500);
      }
      if (data.account === 'bank') {
        $('.bank').text('$' + data.amount).css('animation', `flash-${data.changeType} 1.5s ease-in-out`);
        setTimeout(() => {
          $('.bank').css('animation', '');
        }, 1500);
      }
      break;
    case 'startMove':
      startMoving();
      break;
    case 'toggleDisplay':
      handleToggleDisplay(data);
      break;
    case 'setPosition':
      handleSetPosition(data);
      break;
  }
});

/* Functions */
function loadSavedState() {
  const savedPosition = localStorage.getItem('hudPosition');
  if (savedPosition) {
    const { left, top } = JSON.parse(savedPosition);
    $('.huditems').css({
      left: left + 'px',
      top: top + 'px'
    });
    hudPosition = { x: left, y: top };
  }

  const savedVisibility = localStorage.getItem('hudVisible');
  if (savedVisibility === 'true') {
    $('.huditems').show();
    $.post(`https://${GetParentResourceName()}/setDisplayState`, JSON.stringify({ displayState: true }));
  } else {
    $('.huditems').hide();
    $.post(`https://${GetParentResourceName()}/setDisplayState`, JSON.stringify({ displayState: false }));
  }

  const savedSettingsPosition = localStorage.getItem('settingsPosition');
  if (savedSettingsPosition) {
    settingsPosition = parseInt(savedSettingsPosition, 10);
    $('.settings-container').css('top', `${settingsPosition}px`);
  }
}

function loadItemVisibility() {
  const itemVisibility = JSON.parse(localStorage.getItem('itemVisibility')) || {};
  $('.setting-item input[type="checkbox"]').each(function () {
    const item = $(this).data('item');
    if (itemVisibility.hasOwnProperty(item)) {
      const isVisible = itemVisibility[item];
      $(this).prop('checked', isVisible);
      const $statusItem = $(`.${item}`).closest('.status-item');
      if (isVisible) {
        $statusItem.fadeIn(300);
      } else {
        $statusItem.hide();
      }
    } else {
      $(this).prop('checked', true);
      $(`.${item}`).closest('.status-item').fadeIn(300);
    }
  });
}

function saveItemVisibility() {
  const itemVisibility = {};
  $('.setting-item input[type="checkbox"]').each(function () {
    const item = $(this).data('item');
    itemVisibility[item] = $(this).is(':checked');
  });
  localStorage.setItem('itemVisibility', JSON.stringify(itemVisibility));
}

function updateItemVisibility() {
  $('.setting-item input[type="checkbox"]').each(function () {
    const item = $(this).data('item');
    const isVisible = $(this).is(':checked');
    const $statusItem = $(`.${item}`).closest('.status-item');

    if (isVisible) {
      $statusItem.fadeIn(300);
    } else {
      $statusItem.fadeOut(300);
    }
  });
  saveItemVisibility();
}

function startMoving() {
  isMoving = true;
  $('.button-container').fadeIn(300);
}

function stopMoving() {
  isMoving = false;
  $('.button-container').fadeOut(300, function () {
    const position = $('.huditems').position();
    localStorage.setItem('hudPosition', JSON.stringify({
      left: position.left,
      top: position.top
    }));
    $.post(`https://${GetParentResourceName()}/stopMove`, JSON.stringify({}));
  });
  hideSettings();
}

function toggleSettings() {
  isSettingsVisible = !isSettingsVisible;
  if (isSettingsVisible) {
    $('.settings-container').removeClass('hide').addClass('show').stop(true, true).fadeIn(300);
  } else {
    hideSettings();
  }
}

function hideSettings() {
  isSettingsVisible = false;
  $('.settings-container').removeClass('show').addClass('hide').stop(true, true).fadeOut(300);
}

function handleToggleDisplay(data) {
  $('.button-container').hide();
  if (data) {
    if (data.init) {
      const savedVisibility = localStorage.getItem('hudVisible');
      if (savedVisibility === 'true') {
        $('.huditems').fadeIn(500);
        $.post(`https://${GetParentResourceName()}/setDisplayState`, JSON.stringify({ displayState: true }));
      } else {
        $('.huditems').fadeOut(300);
        $.post(`https://${GetParentResourceName()}/setDisplayState`, JSON.stringify({ displayState: false }));
      }
    } else if (data.show) {
      $('.huditems').fadeIn(500);
      localStorage.setItem('hudVisible', 'true');
    } else {
      $('.huditems').fadeOut(300);
      localStorage.setItem('hudVisible', 'false');
    }
  }
}

function handleSetPosition(data) {
  if (data && data.left && data.top) {
    $('.huditems').css({
      left: data.left + 'px',
      top: data.top + 'px'
    });
    hudPosition = { x: data.left, y: data.top };
    localStorage.setItem('hudPosition', JSON.stringify({ left: data.left, top: data.top }));
  } else {
    const savedPosition = localStorage.getItem('hudPosition');
    if (savedPosition) {
      const { left, top } = JSON.parse(savedPosition);
      $('.huditems').css({
        left: left + 'px',
        top: top + 'px'
      });
      hudPosition = { x: left, y: top };
    }
  }
}

$(function () {
  const $huditems = $('.huditems');
  const $settingsContainer = $('.settings-container');

  $huditems.draggable({
    containment: 'window',
    stop: function (ui) {
      hudPosition = ui.position;
    }
  });

  $settingsContainer.draggable({
    axis: 'y',
    containment: 'window',
    stop: function (ui) {
      if (ui.position) {
        settingsPosition = ui.position.top;
        localStorage.setItem('settingsPosition', settingsPosition);
      }
    }
  });

  $('.settings-button').click(function () {
    toggleSettings();
  });

  $('.close-button').click(function () {
    stopMoving();
  });

  $(document).keydown(function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      stopMoving();
    }
  });

  const checkPlayerDataInterval = setInterval(function () {
    if (isPlayerDataLoaded) {
      clearInterval(checkPlayerDataInterval);
      loadItemVisibility();
      loadSavedState();
      $('.setting-item input[type="checkbox"]').on('change', updateItemVisibility);
    }
  }, 100);
});