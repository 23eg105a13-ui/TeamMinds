from fastapi import APIRouter
from models import ExecRequest, ExecResponse
import subprocess
import tempfile
import os
import sys
import shutil

execution_router = APIRouter()

@execution_router.post("", response_model=ExecResponse)
async def execute_code(request: ExecRequest):
    lang = request.language.lower()
    
    # Configuration for supported languages
    config = {
        "python": {
            "suffix": ".py",
            "cmd": [sys.executable],
            "forbidden": ["os.system", "subprocess", "shutil", "rm -rf", "sys.modules"]
        },
        "javascript": {
            "suffix": ".js",
            "cmd": ["node"],
            "forbidden": ["child_process", "fs.unlink", "fs.rmdir", "process.exit"]
        },
        "cpp": {
            "suffix": ".cpp",
            "cmd": ["g++"], # Requires g++ installed
            "run_cmd": ["./a.out"], # Unix default, adjust for Windows
            "compiled": True
        },
        "java": {
            "suffix": ".java",
            "cmd": ["javac"],
            "run_cmd": ["java", "Main"], 
            "compiled": True,
            "filename": "Main.java"
        },
        "csharp": { "suffix": ".cs", "cmd": ["csc"], "run_cmd": ["Main.exe"], "compiled": True },
        "go": { "suffix": ".go", "cmd": ["go"], "run_cmd": ["go", "run"] },
        "rust": { "suffix": ".rs", "cmd": ["rustc"], "run_cmd": ["./main"] },
        "php": { "suffix": ".php", "cmd": ["php"] },
        "ruby": { "suffix": ".rb", "cmd": ["ruby"] }
    }

    if lang not in config:
        return ExecResponse(output="", error=f"Execution for '{lang}' is not supported in this environment yet.", status="error")

    conf = config[lang]
    
    # Check if compiler/interpreter exists
    if shutil.which(conf["cmd"][0]) is None:
         return ExecResponse(output="", error=f"Environment Error: '{conf['cmd'][0]}' not found in PATH.", status="error")

    # Security check (Basic)
    if "forbidden" in conf:
        if any(term in request.code for term in conf["forbidden"]):
             return ExecResponse(
                 output="", 
                 error="Security Violation: Forbidden modules/commands blocked.", 
                 status="error"
             )

    temp_file_path = None
    compiled_file_path = None
    
    try:
        # Create temp file
        # Java needs specific filename
        if lang == "java":
             temp_dir = tempfile.mkdtemp()
             temp_file_path = os.path.join(temp_dir, "Main.java")
             with open(temp_file_path, 'w') as f:
                 f.write(request.code)
        else:
            with tempfile.NamedTemporaryFile(mode='w', suffix=conf["suffix"], delete=False) as temp_file:
                temp_file.write(request.code)
                temp_file_path = temp_file.name

        # Execution Logic
        if lang == "python" or lang == "javascript":
            result = subprocess.run(
                conf["cmd"] + [temp_file_path],
                capture_output=True,
                text=True,
                timeout=5
            )
        elif lang == "cpp":
             # Compile
             compiled_exe = temp_file_path.replace(".cpp", ".exe") if os.name == 'nt' else temp_file_path.replace(".cpp", "")
             compile_res = subprocess.run(
                 ["g++", temp_file_path, "-o", compiled_exe],
                 capture_output=True, text=True
             )
             if compile_res.returncode != 0:
                 return ExecResponse(output="", error=f"Compilation Error:\n{compile_res.stderr}", status="error")
             
             # Run
             result = subprocess.run(
                 [compiled_exe],
                 capture_output=True, text=True, timeout=2
             )
             compiled_file_path = compiled_exe
        
        elif lang == "java":
             # Compile
             compile_res = subprocess.run(
                 ["javac", temp_file_path],
                 capture_output=True, text=True
             )
             if compile_res.returncode != 0:
                  return ExecResponse(output="", error=f"Compilation Error:\n{compile_res.stderr}", status="error")
             
             # Run (classpath must be temp_dir)
             result = subprocess.run(
                 ["java", "-cp", temp_dir, "Main"],
                 capture_output=True, text=True, timeout=2
             )
        elif lang == "go":
             result = subprocess.run(
                 ["go", "run", temp_file_path],
                 capture_output=True, text=True, timeout=5
             )
        elif lang == "rust":
             compiled_exe = temp_file_path.replace(".rs", ".exe") if os.name == 'nt' else temp_file_path.replace(".rs", "")
             compile_res = subprocess.run(
                 ["rustc", temp_file_path, "-o", compiled_exe],
                 capture_output=True, text=True
             )
             if compile_res.returncode != 0:
                  return ExecResponse(output="", error=f"Compilation Error:\n{compile_res.stderr}", status="error")
             result = subprocess.run([compiled_exe], capture_output=True, text=True, timeout=2)
             compiled_file_path = compiled_exe
        elif lang == "csharp":
             compiled_exe = temp_file_path.replace(".cs", ".exe")
             compile_res = subprocess.run(
                 ["csc", temp_file_path, f"/out:{compiled_exe}"],
                 capture_output=True, text=True
             )
             if compile_res.returncode != 0:
                  return ExecResponse(output="", error=f"Compilation Error:\n{compile_res.stderr}", status="error")
             result = subprocess.run([compiled_exe], capture_output=True, text=True, timeout=2)
             compiled_file_path = compiled_exe
        elif lang == "php":
             result = subprocess.run(["php", temp_file_path], capture_output=True, text=True, timeout=5)
        elif lang == "ruby":
             result = subprocess.run(["ruby", temp_file_path], capture_output=True, text=True, timeout=5)
        else:
            # Generic execution for new simple interpreters
             result = subprocess.run(
                 conf["cmd"] + [temp_file_path],
                 capture_output=True,
                 text=True,
                 timeout=5
             )

        output = result.stdout
        error = result.stderr
        status = "success" if result.returncode == 0 else "error"
        
        # Merge stderr into output if error occurred but not fatal
        if error and not output:
             output = error
             error = ""

        # Cleanup
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if compiled_file_path and os.path.exists(compiled_file_path):
            os.remove(compiled_file_path)
        if lang == "java" and 'temp_dir' in locals():
            shutil.rmtree(temp_dir)
        
        return ExecResponse(output=output, error=error, status=status)

    except subprocess.TimeoutExpired:
        return ExecResponse(output="", error="Execution timed out (Limit exceeded)", status="error")
    except Exception as e:
        return ExecResponse(output="", error=str(e), status="error")
