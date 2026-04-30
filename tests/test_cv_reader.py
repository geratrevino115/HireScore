import pytest
from handlers.cvs.parsers.cv_reader import clean_text, extract_text


def test_clean_text_removes_newlines():
    assert clean_text("hola\nmundo") == "hola mundo"


def test_clean_text_collapses_spaces():
    assert clean_text("hola    mundo") == "hola mundo"


def test_clean_text_removes_backticks():
    assert clean_text("hola`mundo") == "hola mundo"


def test_extract_text_file_not_found():
    with pytest.raises(FileNotFoundError):
        extract_text("archivo_que_no_existe.pdf")


def test_extract_text_unsupported_format(tmp_path):
    archivo = tmp_path / "test.txt"
    archivo.write_text("contenido")
    with pytest.raises(ValueError):
        extract_text(str(archivo))
