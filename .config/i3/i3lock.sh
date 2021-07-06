#!/bin/sh

BG='#282a36ee'  # bg 
BGD='#21222cee' # bgdark
FG='#f8f8f2ee'  # fg
OR='#ffb86cbb'  # orange 
GR='#50fa7bbb'  # green
CY='#8be9fdbb'  # cyan
YE='#f1fa8cbb'  # yellow
PI='#ff79c6bb'  # pink
RE='#ff5555bb'  # red 
PU='#bd93f9bb'  # purple
DPU='#6272a4bb' # dark purple

i3lock \
-e                      \
--insidever-color=$BGD   \
--insidewrong-color=$BG  \
--inside-color=$BG       \
--ringver-color=$DPU     \
--ringwrong-color=$RE    \
--ring-color=$PU         \
--line-color=$CY         \
--keyhl-color=$CY        \
--bshl-color=$YE         \
--separator-color=$PI    \
--verif-color=$DPU       \
--wrong-color=$RE        \
--layout-color=$PU       \
--time-color=$PU         \
--date-color=$PU         \
--greeter-color=$PU      \
\
--time-str="%H:%M:%S"    \
--date-str="%A, %m, %Y"  \
--wrong-text="Incorrect"     \
--verif-text="Wait..."  \
--greeter-text="Veronica" \
--noinput-text="No Input"  \
\
--wrong-font=hermit     \
--verif-font=hermit     \
--layout-font=hermit    \
--time-font=hermit      \
--greeter-font=hermit   \
--date-font=hermit      \
\
--radius 100            \
--screen 1              \
--blur 5                \
--clock                 \
--indicator             \
--keylayout 2           \

