"""Tests del scaffold de calibracion."""
import pytest
from validation.calibrate import _spearman, _generar_grid_pesos


def test_spearman_correlacion_perfecta():
    a = [1, 2, 3, 4, 5]
    b = [10, 20, 30, 40, 50]
    assert _spearman(a, b) == pytest.approx(1.0, abs=1e-6)


def test_spearman_correlacion_inversa():
    a = [1, 2, 3, 4, 5]
    b = [5, 4, 3, 2, 1]
    assert _spearman(a, b) == pytest.approx(-1.0, abs=1e-6)


def test_spearman_sin_correlacion():
    a = [1, 2, 3, 4]
    b = [3, 1, 4, 2]
    assert -0.5 < _spearman(a, b) < 0.5


def test_spearman_dataset_pequeno_no_falla():
    assert _spearman([5], [3]) == 0.0


def test_grid_pesos_solo_genera_validos():
    combos = _generar_grid_pesos(paso=0.1)
    assert len(combos) > 5
    for p in combos:
        suma = sum(p.as_dict().values())
        assert 0.95 <= suma <= 1.05
