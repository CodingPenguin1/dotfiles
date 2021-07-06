# __     _______ ____   ___  _   _ ___ ____    _    
# \ \   / / ____|  _ \ / _ \| \ | |_ _/ ___|  / \   
#  \ \ / /|  _| | |_) | | | |  \| || | |     / _ \  
#   \ V / | |___|  _ <| |_| | |\  || | |___ / ___ \ 
#    \_/  |_____|_| \_\\___/|_| \_|___\____/_/   \_\
#                                                  



# ---------------------
# ENVIRONMENT VARIABLES
# ---------------------

set fish_greeting
set fish_right_prompt
set -x VISUAL vim
set PATH $PATH /opt/cuda/bin
set PATH $PATH ~/Utils/bin
set YSU__MESSAGE_POSITION "before"
set -x MANPAGER "sh -c 'col -bx | bat -l man -p'"



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
alias homevpn="/home/rjslater/.config/fish/toggle_home_vpn.py"
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
alias cleanup="sudo pacman -Rns (pacman -Qtdq)"

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

# Get top processess eating CPU
alias psmem="ps auxf | sort -nr -k 3"
alias psmem10="ps auxf | sort -nr -k 3 | head -10"

# Get top processess eating CPU
alias pscpu="ps auxf | sort -nr -k 4"
alias pscpu10="ps auxf | sort -nr -k 4 | head -10"

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

alias config="/usr/bin/git --git-dir=$HOME/dotfiles --work-tree=$HOME"

# Get error messages from journalctl
alias jctl="journalctl -p 3 -xb"

# Youtube-dl
alias ytdl="youtube-dl"
alias ytdl-mp3="youtube-dl --extract-audio --audio-format mp3"

# Shorter lastpass command
alias pass="lpass show"

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
alias c="z"

# Goodnight alias: backs up system and shuts down
alias goodnight="trizen -Syyu --noconfirm ; conda update --all -y ; sudo pacman -Rns (pacman -Qtdq) ; fullbackup ; poweroff"



# ----------------
# STARTUP COMMANDS
# ----------------

eval /home/rjslater/anaconda3/bin/conda "shell.fish" "hook" $argv | source
sudo updatedb & 
starship init fish | source
zoxide init fish | source



# -----------------------------
# START X SERVER IF FIRST LOGIN
# -----------------------------

if status --is-login
    if test -z "$DISPLAY" -a $XDG_VTNR = 1
        exec startx
    end
end

