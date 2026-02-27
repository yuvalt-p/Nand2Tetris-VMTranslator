import Parser from "./Parser.js";
import CodeWriter from "./CodeWriter.js";

export default class VMTranslator {
  constructor(inputPath, outputPath) {
    this.parsedFileObject = new Parser(inputPath);
    this.codeWriter = new CodeWriter(outputPath);
  }

  parseEachCommandIntoAssembly() {
    for (let commandLine of this.parsedFileObject.fileAsStringArray) {
      if (this.parsedFileObject.hasMoreCommands()) {
        this.parsedFileObject.advance();
        let commandType = this.parsedFileObject.commandType();
        let commandOrSegment = this.parsedFileObject.arg1();
        let memoryIndex = this.parsedFileObject.arg2();
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
    this.codeWriter.close();
    console.log(
      `no more commands. file has been created at ${this.codeWriter.outputFile.path}`,
    );
  }
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];

const translator = new VMTranslator(inputPath, outputPath);
translator.parseEachCommandIntoAssembly();
