import fs from "fs";
import { stringify } from "querystring";

export default class CodeWriter {
  constructor(outputFilePath) {
    this.outputFile = fs.createWriteStream(outputFilePath);
    this.equalCheckCounter = 0;
    this.gtCheckCounter = 0;
    this.ltCheckCounter = 0;
    this.fileName = "";
    this.callCounter = 0;
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
  #segmentSymbol(segmant) {
    const map = {
      local: "LCL",
      argument: "ARG",
      this: "THIS",
      that: "THAT",
    };
    return map[segmant];
  }
  #setAddress(segmant, index) {
    if (segmant === "temp") {
      this.outputFile.write(`@${5 + index}\n`);
      this.outputFile.write(`D=A\n`);
    } else if (segmant === "pointer") {
      this.outputFile.write(`@${3 + index}\n`);
      this.outputFile.write(`D=A\n`);
    } else {
      this.outputFile.write(`@${index}\n`);
      this.outputFile.write(`D=A\n`);
      this.outputFile.write(`@${this.#segmentSymbol(segmant)}\n`);
      this.outputFile.write(`D=D+M\n`);
    }
    this.outputFile.write(`@addr\n`);
    this.outputFile.write(`M=D\n`);
  }
  setFileName(fileName){
    this.outputFile.write(`//starting to translate ${fileName} file:\n`);
    this.fileName = fileName;
  }
  writeInit(){
    this.outputFile.write(`@256\n`);
    this.outputFile.write(`D=A\n`);
    this.outputFile.write(`@SP\n`);
    this.outputFile.write(`M=D\n`);
    this.writeCall("Sys.init", 0);
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
        this.#manualPop("addr");
        break;
      }
    }
  }
  #manualPop(popTo) {
    this.outputFile.write(`@SP\n`);
    this.outputFile.write(`M=M-1\n`);
    this.outputFile.write(`A=M\n`);
    this.outputFile.write(`D=M\n`);
    this.outputFile.write(`@${popTo}\n`);
    this.outputFile.write(`A=M\n`);
    this.outputFile.write(`M=D\n`);
  }
  #writePushLabelOrSegment(labelOrSegment) {
    const isSegment = labelOrSegment === "LCL" || labelOrSegment === "ARG" || labelOrSegment === "THIS" || labelOrSegment === "THAT";
    this.outputFile.write(`@${labelOrSegment}\n`);
    if (isSegment) {
      this.outputFile.write(`D=M\n`);
    }
    else {
    this.outputFile.write(`D=A\n`);
    }
    this.outputFile.write(`@SP\n`);
    this.outputFile.write(`A=M\n`);
    this.outputFile.write(`M=D\n`);
    this.outputFile.write(`@SP\n`);
    this.outputFile.write(`M=M+1\n`);
  }
  writeLabel(label){
    this.outputFile.write(`(${label})\n`);
  }
  writeGoTo(label) {
    this.outputFile.write(`@${label}\n`);
    this.outputFile.write(`0;JMP\n`);
  }
  writeIf(label) {
    this.#setAToStackPointerMinusOne();
    this.outputFile.write(`D=M\n`);
    this.#setSPMinusOne();
    this.outputFile.write(`@${label}\n`);
    this.outputFile.write(`D;JNE\n`);
  }
  writeFunction(functionName, numVars){
    this.writeLabel(functionName);
    for (let i = 0; i < numVars; i++) {
    this.writePushPop("C_PUSH", "constant", 0);
    };
  }
  writeCall(functionName, numArgs){
    // Set ret addr in the current SP in the stack:
    this.#writePushLabelOrSegment(`${functionName}$ret.${this.callCounter}`);
    // Set LCL in the current SP in the stack
    this.#writePushLabelOrSegment(`LCL`);
    // Set ARG in the current SP in the stack
    this.#writePushLabelOrSegment("ARG");
    // Set THIS in the current SP in the stack
    this.#writePushLabelOrSegment("THIS");
    // Set THAT in the current SP in the stack
    this.#writePushLabelOrSegment("THAT");
    // Reposition ARG
    const argRepositionSubstraction = 5 + numArgs;
    this.outputFile.write(`@${argRepositionSubstraction}\n`);
    this.outputFile.write(`D=A\n`);
    this.outputFile.write(`@SP\n`);
    this.outputFile.write(`D=M-D\n`);
    this.outputFile.write(`@ARG\n`);
    this.outputFile.write(`M=D\n`);
    // Reposition LCL
    this.outputFile.write(`@SP\n`);
    this.outputFile.write(`D=M\n`);
    this.outputFile.write(`@LCL\n`);
    this.outputFile.write(`M=D\n`);
    // goto functionName
    this.outputFile.write(`@${functionName}\n`);
    this.outputFile.write(`0;JMP\n`);
    // Declare return lable
    this.writeLabel(`${functionName}$ret.${this.callCounter}`);
    // Incrementing call counter:
    this.callCounter ++ ; 
  }
  writeReturn(){
    const frameLabel = "R13";
    const returnLabel = "R14";
    // Save LCL into a temp variable:
    this.outputFile.write(`@LCL\n`);
    this.outputFile.write(`D=M\n`);
    this.outputFile.write(`@${frameLabel}\n`);
    this.outputFile.write(`M=D\n`);
    // Save return address into a temp variable:
    this.outputFile.write(`@${frameLabel}\n`);
    this.outputFile.write(`D=M\n`);
    this.outputFile.write(`@5\n`);
    this.outputFile.write(`D=D-A\n`);
    this.outputFile.write(`A=D\n`);
    this.outputFile.write(`D=M\n`);
    this.outputFile.write(`@${returnLabel}\n`);
    this.outputFile.write(`M=D\n`);
    // Pop top of the stack, and store it at *ARG:
    this.#manualPop("ARG");
    // Reposition SP:
    this.outputFile.write(`@ARG\n`);
    this.outputFile.write(`D=M+1\n`);
    this.outputFile.write(`@SP\n`);
    this.outputFile.write(`M=D\n`);
    // Restoring THAT of the caller:
    this.outputFile.write(`@${frameLabel}\n`);
    this.outputFile.write(`D=M-1\n`);
    this.outputFile.write(`A=D\n`);
    this.outputFile.write(`D=M\n`);
    this.outputFile.write(`@THAT\n`);
    this.outputFile.write(`M=D\n`);
    // Restoring THIS of the caller:
    this.outputFile.write(`@2\n`);
    this.outputFile.write(`D=A\n`);
    this.outputFile.write(`@${frameLabel}\n`);
    this.outputFile.write(`D=M-D\n`);
    this.outputFile.write(`A=D\n`);
    this.outputFile.write(`D=M\n`);
    this.outputFile.write(`@THIS\n`);
    this.outputFile.write(`M=D\n`);
    // Restoring ARG of the caller:
    this.outputFile.write(`@3\n`);
    this.outputFile.write(`D=A\n`);
    this.outputFile.write(`@${frameLabel}\n`);
    this.outputFile.write(`D=M-D\n`);
    this.outputFile.write(`A=D\n`);
    this.outputFile.write(`D=M\n`);
    this.outputFile.write(`@ARG\n`);
    this.outputFile.write(`M=D\n`);
    // Restoring LCL of the caller:
    this.outputFile.write(`@4\n`);
    this.outputFile.write(`D=A\n`);
    this.outputFile.write(`@${frameLabel}\n`);
    this.outputFile.write(`D=M-D\n`);
    this.outputFile.write(`A=D\n`);
    this.outputFile.write(`D=M\n`);
    this.outputFile.write(`@LCL\n`);
    this.outputFile.write(`M=D\n`);
    // goto return address:
    this.outputFile.write(`@${returnLabel}\n`);
    this.outputFile.write(`A=M\n`);
    this.outputFile.write(`0;JMP\n`);
  }
  close() {
    this.outputFile.end();
  }
}
