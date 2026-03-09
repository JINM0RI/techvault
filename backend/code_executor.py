import ast
import contextlib
import io
import multiprocessing
import traceback
from typing import Any


SAFE_BUILTINS: dict[str, Any] = {
    "abs": abs,
    "all": all,
    "any": any,
    "bool": bool,
    "dict": dict,
    "enumerate": enumerate,
    "filter": filter,
    "float": float,
    "int": int,
    "len": len,
    "list": list,
    "map": map,
    "max": max,
    "min": min,
    "pow": pow,
    "print": print,
    "range": range,
    "reversed": reversed,
    "round": round,
    "set": set,
    "sorted": sorted,
    "str": str,
    "sum": sum,
    "tuple": tuple,
    "zip": zip,
}


def _run_code_worker(code: str, queue: multiprocessing.Queue) -> None:
    stdout_buffer = io.StringIO()
    globals_dict = {"__builtins__": SAFE_BUILTINS}
    locals_dict: dict[str, Any] = {}

    try:
        parsed = ast.parse(code, mode="exec")

        with contextlib.redirect_stdout(stdout_buffer):
            if parsed.body and isinstance(parsed.body[-1], ast.Expr):
                last_expr = parsed.body.pop()
                exec(compile(parsed, "<techvault>", "exec"), globals_dict, locals_dict)
                result = eval(
                    compile(ast.Expression(last_expr.value), "<techvault>", "eval"),
                    globals_dict,
                    locals_dict,
                )
                if result is not None:
                    print(repr(result))
            else:
                exec(compile(parsed, "<techvault>", "exec"), globals_dict, locals_dict)

        queue.put(stdout_buffer.getvalue().strip())
    except Exception:
        queue.put("Execution error:\n" + traceback.format_exc())


def execute_python_code(code: str, timeout_seconds: int = 3) -> str:
    queue: multiprocessing.Queue = multiprocessing.Queue()
    process = multiprocessing.Process(target=_run_code_worker, args=(code, queue))
    process.start()
    process.join(timeout_seconds)

    if process.is_alive():
        process.terminate()
        process.join()
        return "Execution timed out."

    if queue.empty():
        return ""

    return str(queue.get())
