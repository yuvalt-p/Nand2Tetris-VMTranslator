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
  #setSPMinusOne() {
    this.outputFile.write("@SP\n");
    this.outputFile.write("M=M-1\n");
  }
  #setAToCurrentMValue() {
    this.outputFile.write("A=M\n");
  }
  #setAToStackPointerMinusOne() {
    this.outputFile.write("@SP\n");
    this.outputFile.write("A=M-1\n");
  }
  #setAddress(segmant, index) {
    this.outputFile.write(`@${index}\n`);
    this.outputFile.write(`D=A\n`);
    this.outputFile.write(`@${segmant}\n`);
    this.outputFile.write(`D=D+M\n`);
    this.outputFile.write(`@addr\n`);
    this.outputFile.write(`M=D\n`);
  }
  writeArithmetic(command) {
    this.#printCurrentCommand(command);
    switch (command) {
      case "add": {
        this.#setSPMinusOne();
        this.#setAToCurrentMValue();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
        this.outputFile.write("M=M+D\n");
        break;
      }
      case "sub": {
        this.#setSPMinusOne();
        this.#setAToCurrentMValue();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
        this.outputFile.write("M=M-D\n");
        break;
      }
      case "neg": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("M=-M\n");
        break;
      }
      case "eq": {
        this.#setSPMinusOne();
        this.#setAToCurrentMValue();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
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
        this.#setSPMinusOne();
        this.#setAToCurrentMValue();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
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
        this.#setSPMinusOne();
        this.#setAToCurrentMValue();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
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
        this.#setSPMinusOne();
        this.#setAToCurrentMValue();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
        this.outputFile.write("M=M&D\n");
        break;
      }
      case "or": {
        this.#setSPMinusOne();
        this.#setAToCurrentMValue();
        this.outputFile.write("D=M\n");
        this.outputFile.write("A=A-1\n");
        this.outputFile.write("M=M|D\n");
        break;
      }
      case "not": {
        this.#setAToStackPointerMinusOne();
        this.outputFile.write("M=!M\n");
        break;
      }
    }
  }
  writePushPop(command, segmant, index) {
    this.#printCurrentCommand(command);
    const isConstantSegment = segmant === "constant";
    if (!isConstantSegment) {
      this.#setAddress(segmant, index);
    }
    switch (command) {
      case "C_PUSH": {
        if (isConstantSegment) {
          this.outputFile.write(`@${index}\n`);
          this.outputFile.write(`D=A\n`);
        } else {
          this.outputFile.write(`A=M\n`);
          this.outputFile.write(`D=M\n`);
        }
        this.outputFile.write(`@SP\n`);
        this.outputFile.write(`A=M\n`);
        this.outputFile.write(`M=D\n`);
        this.outputFile.write(`@SP\n`);
        this.outputFile.write(`M=M+1\n`);
        break;
      }
      case "C_POP": {
        this.outputFile.write(`@SP\n`);
        this.outputFile.write(`M=M-1\n`);
        this.outputFile.write(`A=M\n`);
        this.outputFile.write(`D=M\n`);
        this.outputFile.write(`@addr\n`);
        this.outputFile.write(`A=M\n`);
        this.outputFile.write(`M=D\n`);
        break;
      }
    }
  }
  close() {
    this.outputFile.close();
  }
}
