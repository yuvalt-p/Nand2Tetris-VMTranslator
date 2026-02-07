import fs from "fs";

export default class Parser {
  constructor(inputFile) {
    this.rawFile = inputFile;
    this.fileAsStringArray = this.#convertInputFileToStringArray();
  }
  #convertInputFileToStringArray() {
    const fileAsStringArray = fs
      .readFileSync(this.rawFile, "utf-8")
      .split("\n");
    return fileAsStringArray;
  }
}
