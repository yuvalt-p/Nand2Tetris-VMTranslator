import Parser from "./Parser.js";
import CodeWriter from "./CodeWriter.js";
import fs from "fs";
import path from "path";

export default class VMTranslator {
  constructor(inputPath, outputPath) {
    this.inputPath = inputPath;
    this.codeWriter = new CodeWriter(outputPath);
  }

  #processFile(filePath) {
    const parser = new Parser(filePath);
    for (let commandLine of parser.fileAsStringArray) {
      if (parser.hasMoreCommands()) {
        parser.advance();
        let commandType = parser.commandType();
        let commandOrSegment = parser.arg1();
        let memoryIndex = parser.arg2();
        if (commandType === "C_ARITHMETIC") {
          this.codeWriter.writeArithmetic(commandOrSegment);
        } else if (commandType === "C_POP" || commandType === "C_PUSH") {
          this.codeWriter.writePushPop(
            commandType,
            commandOrSegment,
            memoryIndex,
          );
        }
      }
    }
  }

  parseEachCommandIntoAssembly() {
    const stat = fs.statSync(this.inputPath);
    if (stat.isDirectory()) {
      const vmFiles = fs
        .readdirSync(this.inputPath)
        .filter((f) => f.endsWith(".vm"))
        .map((f) => path.join(this.inputPath, f));
      for (const filePath of vmFiles) {
        this.#processFile(filePath);
      }
    } else {
      this.#processFile(this.inputPath);
    }
    this.codeWriter.close();
    console.log(
      `no more commands. file has been created at ${this.codeWriter.outputFile.path}`,
    );
  }
}

const inputPath = process.argv[2];
const stat = fs.statSync(inputPath);
let outputPath;
if (stat.isDirectory()) {
  const dirName = path.basename(inputPath);
  outputPath = path.join(inputPath, `${dirName}.asm`);
} else {
  outputPath = inputPath.replace(".vm", ".asm");
}

const translator = new VMTranslator(inputPath, outputPath);
translator.parseEachCommandIntoAssembly();
