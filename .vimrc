packadd! dracula
syntax enable
colorscheme dracula
set tabstop=4
set autoindent
set softtabstop=4
set cursorline
set ignorecase
set ruler
set foldcolumn=1
set expandtab
set relativenumber
set number
set foldmethod=manual

augroup remember_folds
  autocmd!
  autocmd BufWinLeave * mkview
  autocmd BufWinEnter * silent! loadview
augroup END

