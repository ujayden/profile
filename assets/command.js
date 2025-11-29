function handleCommand(input) {
  switch(input.trim()){
    case "help":
      term.writeln("Available commands: help, about, sites, open <site>, github, mail, clear");
      break;
    case "clear":
      term.clear();
      break;
    default:
      term.writeln("Unknown command. Type 'help'.");
  }
}
