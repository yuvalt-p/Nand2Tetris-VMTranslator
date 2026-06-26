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
    this.codeWriter.setFileName(path.basename(filePath, ".vm"));
    for (let commandLine of parser.fileAsStringArray) {
      if (parser.hasMoreCommands()) {
        parser.advance();
        let commandType = parser.commandType();
        let arg1 = parser.arg1();
        let arg2 = parser.arg2();
        switch (commandType) {
          case ("C_ARITHMETIC") : 
          this.codeWriter.writeArithmetic(arg1);
            break;
          case ("C_POP"):
          case ("C_PUSH"):
            this.codeWriter.writePushPop(
              commandType,
              arg1,
              arg2,
            );
            break; 
          case ("C_GOTO"):
            this.codeWriter.writeGoTo(arg1);
            break;
          case ("C_IF_GOTO"):
            this.codeWriter.writeIf(arg1);
            break;
          case ("C_LABEL"):
            this.codeWriter.writeLabel(arg1);
            break;
          case ("C_CALL"):
            this.codeWriter.writeCall(arg1, arg2)
            break;
          case ("C_FUNCTION"):
            this.codeWriter.writeFunction(arg1, arg2);
            break;
          case ("C_RETURN"):
            this.codeWriter.writeReturn();
            break;
        }
      }
    }
  }

  parseEachCommandIntoAssembly() {
    const stat = fs.statSync(this.inputPath);
    this.codeWriter.writeInit();
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
