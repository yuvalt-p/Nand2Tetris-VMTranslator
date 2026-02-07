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

    if (arithmeticCommands.includes(command)) return "C_ARITHMETIC";
    if (command === "push") return "C_PUSH";
    if (command === "pop") return "C_POP";
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
