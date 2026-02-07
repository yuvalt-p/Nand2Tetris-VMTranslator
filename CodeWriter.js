import fs from "fs";

export default class CodeWriter {
  constructor(outputFilePath) {
    this.outputFile = fs.createWriteStream(outputFilePath);
  }
  writeArithmetic(command) {}
  writePushPop(command, segmant, index) {}
  close() {
    this.outputFile.close();
  }
}
