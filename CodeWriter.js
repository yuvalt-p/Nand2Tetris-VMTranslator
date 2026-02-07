import fs from "fs";

export default class CodeWriter {
  constructor(outputFilePath) {
    this.outputFile = fs.createWriteStream(outputFilePath);
  }
  #printCurrentCommand(commandName) {
    this.outputFile.write(`//${commandName} command`);
  }
  writeArithmetic(command) {
    this.#printCurrentCommand(command);
    this.outputFile.write("@sp");
    this.outputFile.write("A=M");
    switch (command) {
      case "add": {
        this.outputFile.write("D=M");
        this.outputFile.write("@sp");
        this.outputFile.write("AM=M-1");
        this.outputFile.write("M=M+D");
      }
      case "sub": {
        this.outputFile.write("D=M");
        this.outputFile.write("@sp");
        this.outputFile.write("AM=M-1");
        this.outputFile.write("M=M-D");
      }
      case "neg": {
        this.outputFile.write("M=-M");
      }
      case "eq": {
        this.outputFile.write("D=M");
        this.outputFile.write("@sp");
        this.outputFile.write("AM=M-1");
        this.outputFile.write("D=M-D");
        this.outputFile.write("@equal");
        this.outputFile.write("D;JEQ");
        this.outputFile.write("(equal)");
        this.outputFile.write("A=M");
      }
      case "gt": {
      }
      case "lt": {
      }
      case "and": {
        this.outputFile.write("D=M");
        this.outputFile.write("@sp");
        this.outputFile.write("AM=M-1");
        this.outputFile.write("M=M&D");
      }
      case "or": {
        this.outputFile.write("D=M");
        this.outputFile.write("@sp");
        this.outputFile.write("AM=M-1");
        this.outputFile.write("M=M|D");
      }
      case "not": {
        this.outputFile.write("M=!M");
      }
    }
  }
  writePushPop(command, segmant, index) {}
  close() {
    this.outputFile.close();
  }
}
