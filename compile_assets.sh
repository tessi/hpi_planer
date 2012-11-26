echo "starting the coffee js compiler in watch-mode (compiles on every change of the js file)"
echo "ctrl-c to stop compiling"
echo ""
coffee -cwo js coffee/*.coffee &
coffee -cwo tests/spec tests/spec/*.coffee
echo ""
echo "happy coffee-drinking!"
