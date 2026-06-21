import fs from "fs";

export default class Parser {
  constructor(inputFile) {
    this.rawFile = inputFile;
    this.fileAsStringArray = this.#convertInputFileToStringArray();
    this.currentIndex = 0;
  }
  #convertInputFileToStringArray() {
    const fileAsStringArray = fs
      .readFileSync(this.rawFile, "utf-8")
      .split("\n")
      .filter((row) => !row.includes("/") && row.trim() !== "")
      .map((row) => row.trim());
    return fileAsStringArray;
  }
  hasMoreCommands() {
    return this.currentIndex < this.fileAsStringArray.length;
  }
  advance() {
    if (this.hasMoreCommands()) {
      this.currentCommand = this.fileAsStringArray[this.currentIndex];
      this.currentIndex++;
    } else {
      console.log("No more commands");
    }
  }
  commandType() {
    if (!this.currentCommand) {
      console.log("No available commands");
      return;
    }

    const command = this.currentCommand.split(" ")[0];

    const arithmeticCommands = [
      "add",
      "sub",
      "neg",
      "eq",
      "gt",
      "lt",
      "and",
      "or",
      "not",
    ];
    switch (true) {
      case arithmeticCommands.includes(command):
        return "C_ARITHMETIC";
      case command === "push":
       return "C_PUSH";
      case command === "pop":
       return "C_POP";
      case command === "goto":
       return "C_GOTO";
      case command === "if-goto":
        return "C_IF_GOTO"
      case command === "label":
        return "C_LABEL";
      case command === "call":
        return "C_CALL";
      case command === "function":
        return "C_FUNCTION";
      case command === "return":
        return "C_RETURN";
    } 
  }
  arg1() {
    if (!this.currentCommand) {
      console.log("No current command");
      return;
    }
    if (this.commandType() === "C_ARITHMETIC") {
      return this.currentCommand;
    }
    return this.currentCommand.split(" ")[1];
  }
  arg2() {
    if (!this.currentCommand) {
      console.log("No current command");
      return;
    }
    if (this.commandType() === "C_ARITHMETIC") {
      console.log("command type is arithmetic!");
      return;
    }
    return parseInt(this.currentCommand.split(" ")[2]);
  }
}
