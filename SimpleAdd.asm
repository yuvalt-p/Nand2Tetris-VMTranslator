//C_PUSH command
@7
D=A
@SP
A=M
M=D
@SP
M=M+1
//C_PUSH command
@8
D=A
@SP
A=M
M=D
@SP
M=M+1
//add command
@SP
M=M-1
A=M
D=M
A=A-1
M=M+D
