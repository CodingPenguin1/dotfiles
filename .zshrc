# __     _______ ____   ___  _   _ ___ ____    _
# \ \   / / ____|  _ \ / _ \| \ | |_ _/ ___|  / \
#  \ \ / /|  _| | |_) | | | |  \| || | |     / _ \
#   \ V / | |___|  _ <| |_| | |\  || | |___ / ___ \
#    \_/  |_____|_| \_\\___/|_| \_|___\____/_/   \_\
#

# Based on https://github.com/ChrisTitusTech/zsh
# Requires zsh zsh-syntax-highlighting zsh-autosuggestions


# ------------------
# ZSH-SPECIFIC STUFF
# ------------------

# Enable colors and change prompt:
autoload -U colors && colors
PS1="%B%{$fg[red]%}[%{$fg[yellow]%}%n%{$fg[green]%}@%{$fg[blue]%}%M %{$fg[magenta]%}%~%{$fg[red]%}]%{$reset_color%}$%b "

# History in cache directory:
HISTSIZE=10000
SAVEHIST=10000
HISTFILE=~/.cache/zshhistory
setopt appendhistory

# Basic auto/tab complete:
autoload -U compinit
zstyle ':completion:*' menu select
zmodload zsh/complist
compinit
_comp_options+=(globdots)               # Include hidden files.

# Custom ZSH Binds
bindkey '^ ' autosuggest-accept
bindkey '^[[3~' delete-char
bindkey '^[[H' beginning-of-line
bindkey '^[[F' end-of-line
bindkey ';5D' backward-word
bindkey ';5C' forward-word

# Load aliases and shortcuts if existent.
[ -f "$HOME/zsh/aliasrc" ] && source "$HOME/zsh/aliasrc"

# Load ; should be last.
source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh 2>/dev/null
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh 2>/dev/null



# ---------------------
# ENVIRONMENT VARIABLES
# ---------------------

EDITOR=vim
export PATH=/opt/cuda/bin:$PATH
export PATH=~/Utils/bin:$PATH
export PATH="/home/rjslater/anaconda3/bin:$PATH"
export MANPAGER="sh -c 'col -bx | bat -l man -p'"



# -----------------------------
# NETWORK/REMOTE ACCESS ALIASES
# -----------------------------

# Ssh aliases
alias friday='sshsystem friday'
alias mfriday='mountsystem friday'
alias controlFriday='ssh -i ~/.ssh/FRIDAY_rsa -YC rjslater@192.168.1.148 x2x -east -to :0.0'
alias jarvis='sshsystem Jarvis'
alias mjarvis='mountsystem Jarvis'
alias bender='sshsystem bender'
alias mbender='mountsystem Bender'
alias fry='sshsystem fry'
alias csediscord='ssh -i ~/.ssh/cse-discord-aws.pem ubuntu@54.161.180.188'
alias pitzer='sshsystem pitzer'
alias owens='sshsystem owens'

# VPNs
alias wsuvpn="sudo openconnect -u w090rjs wsu-vpn.wright.edu"

# Network Tests
alias ipscan='sudo nmap -sS -p 22 192.168.1.0/24'
alias pingtest="ping 8.8.8.8 -c 5"
alias netmon="speedometer -r wlp4s0 -t wlp4s0 -r enp5s0 -t enp5s0"

# Owen's Port Checker (called "portscan" in ~/Utils/bin)
alias portcheck="portscan"



# -------------
# OTHER ALIASES
# -------------

# Package Management
alias syu="trizen -Syyu"
alias install="trizen -S"
alias uninstall="trizen -R"
alias update="trizen -Syyu ; conda update --all"
alias unlock="sudo rm /var/lib/pacman/db.lck"
alias cleanup="sudo pacman -Rns $(pacman -Qtdq)"

# Update mirrorlist
alias mirror="conda deactivate && sudo reflector -f 30 -l 30 --number 10 --verbose --save /etc/pacman.d/mirrorlist ; conda activate base"
alias mirrord="conda deactivate && sudo reflector --latest 50 --number 20 --sort delay --save /etc/pacman.d/mirrorlist ; conda activate base"
alias mirrors="conda deactivate && sudo reflector --latest 50 --number 20 --sort score --save /etc/pacman.d/mirrorlist ; conda activate base"
alias mirrora="conda deactivate && sudo reflector --latest 50 --number 20 --sort age --save /etc/pacman.d/mirrorlist ; conda activate base"

# Navigation
alias ..="cd .."
alias ...="cd ../.."
alias .3="cd ../../.."
alias .4="cd ../../../.."
alias .5="cd ../../../../.."

# Change "ls" to "exa"
alias ls="exa --color=always --group-directories-first"      # Standard
alias la="exa -ahl --color=always --group-directories-first"  # All files and dirs
alias ll="exa -l --color=always --group-directories-first"   # Long format
alias lt="exa -aT --color=always --group-directories-first"  # Tree
alias l.="exa -a | egrep '^\.'"                              # Hidden files only

# Colorize grep
alias grep="grep --color=auto"
alias egrep="egrep --color=auto"
alias fgrep="fgrep --color=auto"

# Backup alias
alias fullbackup="backup /mnt/Hulk/Backups ; mjarvis && backup /home/rjslater/Jarvis/Backups/Veronica/"

# Python
alias py="python"

# Make df always human-readable
alias df="df -h"

# Git
alias addup="git add -u"
alias addall="git add ."
alias branch="git branch"
alias checkout="git checkout"
alias clone="git clone"
alias commit="git commit"
alias fetch="git fetch"
alias pull="git pull origin"
alias push="git push origin"
alias tag="git tag"
alias newtag="git tag -a"

alias dotfiles="/usr/bin/git --git-dir=$HOME/dotfiles --work-tree=$HOME"

# Get error messages from journalctl
alias jctl="journalctl -p 3 -xb"

# Youtube-dl
alias ytdl="youtube-dl"
alias ytdl-mp3="youtube-dl --extract-audio --audio-format mp3"

# Visual Studio Code aliases
alias personal="code /home/rjslater/Documents/Personal"

# Boot aliases
alias windows="sudo grub-reboot 1 && reboot"
alias bios="sudo systemctl reboot --firmware-setup"

# Better versions of common commands, rewritten in rust
alias cat="bat"
alias du="dust"
alias tree="broot"
alias find="fd"
alias languages="tokei"
alias langs="tokei"
alias ps="procs"
alias cd="z"

# Quick access to ~/.zshrc
alias zshrc='${=EDITOR} ~/.zshrc'

# Goodnight alias: backs up system and shuts down
alias goodnight="trizen -Syyu --noconfirm ; conda update --all -y ; sudo pacman -Rns (pacman -Qtdq) ; fullbackup ; poweroff"



# ----------------
# STARTUP COMMANDS
# ----------------

(sudo updatedb &) &>/dev/null
eval "$(starship init zsh)"
eval "$(zoxide init zsh)"

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/home/rjslater/anaconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/home/rjslater/anaconda3/etc/profile.d/conda.sh" ]; then
        . "/home/rjslater/anaconda3/etc/profile.d/conda.sh"
    else
        export PATH="/home/rjslater/anaconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<



# -----------------------------
# START X SERVER IF FIRST LOGIN
# -----------------------------

[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx
