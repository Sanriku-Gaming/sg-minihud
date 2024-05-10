fx_version 'cerulean'
game 'gta5'

name 'Mini Hud'
author 'Nicky - SG Scripts'
description 'Mini player hud for id, money, job and gang'
version '1.1.0'
lua54 'yes'

shared_scripts {
  "@ox_lib/init.lua",
  'config.lua'
}

client_scripts {
  'client.lua',
}

ui_page {
  'html/index.html',
}

files {
	'html/index.html',
	'html/app.js',
  'html/styles.css',
}