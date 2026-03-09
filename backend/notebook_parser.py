from pathlib import Path

import nbformat


def parse_notebook(file_path: Path) -> list[dict[str, str]]:
    notebook = nbformat.read(file_path, as_version=4)
    cells: list[dict[str, str]] = []

    for cell in notebook.cells:
        if cell.cell_type == "markdown":
            cells.append(
                {
                    "type": "markdown",
                    "content": "".join(cell.source),
                }
            )
        elif cell.cell_type == "code":
            cells.append(
                {
                    "type": "code",
                    "language": "python",
                    "content": "".join(cell.source),
                }
            )

    return cells
