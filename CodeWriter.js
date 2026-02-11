import fs from "fs";

export default class CodeWriter {
  constructor(outputFilePath) {
    this.outputFile = fs.createWriteStream(outputFilePath);
    this.equalCheckCounter = 0;
    this.gtCheckCounter = 0;
    this.ltCheckCounter = 0;
  }
  #printCurrentCommand(commandName) {
    this.outputFile.write(`//${commandName} command\n`);
  }
  #setA_RegisterToSP_Value() {
    this.outputFile.write("@sp\n");
    this.outputFile.write("A=M\n");
  }
  #setStackPointerAndM_RegisterMinusOne() {
    this.outputFile.write("@sp\n");
    this.outputFile.write("AM=M-1\n");
  }
  #setAToStackPointerMinusOne() {
    this.outputFile.write("@sp\n");
    this.outputFile.write("A=M-1\n");
  }
  #decreaseStackPointerValueByOne() {
    this.outputFile.write("@sp\n");
    this.outputFile.write("M=M-1\n");
  }
  writeArithmetic(command) {
    this.#printCurrentCommand(command);
    switch (command) {
      case "add": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
        this.outputFile.write("M=M+D\n");
        this.#decreaseStackPointerValueByOne();
        break;
      }
      case "sub": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
        this.outputFile.write("M=M-D\n");
        this.#decreaseStackPointerValueByOne();
        break;
      }
      case "neg": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("M=-M\n");
        this.#decreaseStackPointerValueByOne();
        break;
      }
      case "eq": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("D=M\n");
        this.#setStackPointerAndM_RegisterMinusOne();
        this.outputFile.write("D=M-D\n");
        this.outputFile.write(`@equal_true_${this.equalCheckCounter}\n`);
        this.outputFile.write("D;JEQ\n");
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("M=0\n");
        this.outputFile.write(`@equal_end_${this.equalCheckCounter}\n`);
        this.outputFile.write("0;JMP\n");
        this.outputFile.write(`(equal_true_${this.equalCheckCounter})\n`);
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("M=-1\n");
        this.outputFile.write(`(equal_end_${this.equalCheckCounter})\n`);
        this.equalCheckCounter++;
        break;
      }
      case "gt": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("D=M\n");
        this.#setStackPointerAndM_RegisterMinusOne();
        this.outputFile.write("D=M-D\n");
        this.outputFile.write(`@gt_true_${this.gtCheckCounter}\n`);
        this.outputFile.write("D;JGT\n");
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("M=0\n");
        this.outputFile.write(`@gt_end_${this.gtCheckCounter}\n`);
        this.outputFile.write("0;JMP\n");
        this.outputFile.write(`(gt_true_${this.gtCheckCounter})\n`);
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("M=-1\n");
        this.outputFile.write(`(gt_end_${this.gtCheckCounter})\n`);
        this.gtCheckCounter++;
        break;
      }
      case "lt": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("D=M\n");
        this.#setStackPointerAndM_RegisterMinusOne();
        this.outputFile.write("D=M-D\n");
        this.outputFile.write(`@lt_true_${this.ltCheckCounter}\n`);
        this.outputFile.write("D;JLT\n");
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("M=0\n");
        this.outputFile.write(`@lt_end_${this.ltCheckCounter}\n`);
        this.outputFile.write("0;JMP\n");
        this.outputFile.write(`(lt_true_${this.ltCheckCounter})\n`);
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("M=-1\n");
        this.outputFile.write(`(lt_end_${this.ltCheckCounter})\n`);
        this.ltCheckCounter++;
        break;
      }
      case "and": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
        this.outputFile.write("M=M&D\n");
        break;
      }
      case "or": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
        this.outputFile.write("M=M|D\n");
        this.#decreaseStackPointerValueByOne();
        break;
      }
      case "not": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("M=!M\n");
        break;
      }
    }
  }
  writePushPop(command, segmant, index) {}
  close() {
    this.outputFile.close();
  }
}
