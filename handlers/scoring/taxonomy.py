"""Taxonomia minima de skills tech con sinonimos para normalizacion.

Curada para LATAM/Espanol. Extender en JSON externo cuando crezca.
La normalizacion es lowercase + strip + match exacto contra sinonimos.
"""
from __future__ import annotations
from handlers.llm.schemas import SkillCategoria

# nombre canonico -> (categoria, [sinonimos en lowercase])
TAXONOMIA: dict[str, tuple[SkillCategoria, list[str]]] = {
    # Lenguajes
    "Python":      (SkillCategoria.LENGUAJE, ["python", "py"]),
    "JavaScript":  (SkillCategoria.LENGUAJE, ["javascript", "js"]),
    "TypeScript":  (SkillCategoria.LENGUAJE, ["typescript", "ts"]),
    "Java":        (SkillCategoria.LENGUAJE, ["java"]),
    "C#":          (SkillCategoria.LENGUAJE, ["c#", "csharp", "c sharp"]),
    "C++":         (SkillCategoria.LENGUAJE, ["c++", "cpp"]),
    "Go":          (SkillCategoria.LENGUAJE, ["go", "golang"]),
    "Rust":        (SkillCategoria.LENGUAJE, ["rust"]),
    "Ruby":        (SkillCategoria.LENGUAJE, ["ruby"]),
    "PHP":         (SkillCategoria.LENGUAJE, ["php"]),
    "Kotlin":      (SkillCategoria.LENGUAJE, ["kotlin"]),
    "Swift":       (SkillCategoria.LENGUAJE, ["swift"]),
    "SQL":         (SkillCategoria.LENGUAJE, ["sql"]),
    # Frameworks
    "React":       (SkillCategoria.FRAMEWORK, ["react", "reactjs", "react.js"]),
    "Next.js":     (SkillCategoria.FRAMEWORK, ["next", "nextjs", "next.js"]),
    "Vue":         (SkillCategoria.FRAMEWORK, ["vue", "vuejs", "vue.js"]),
    "Angular":     (SkillCategoria.FRAMEWORK, ["angular", "angularjs"]),
    "Django":      (SkillCategoria.FRAMEWORK, ["django"]),
    "Flask":       (SkillCategoria.FRAMEWORK, ["flask"]),
    "FastAPI":     (SkillCategoria.FRAMEWORK, ["fastapi", "fast api"]),
    "Spring Boot": (SkillCategoria.FRAMEWORK, ["spring", "spring boot", "springboot"]),
    ".NET":        (SkillCategoria.FRAMEWORK, [".net", "dotnet", "asp.net"]),
    "Express":     (SkillCategoria.FRAMEWORK, ["express", "expressjs"]),
    "Node.js":     (SkillCategoria.FRAMEWORK, ["node", "nodejs", "node.js"]),
    "Laravel":     (SkillCategoria.FRAMEWORK, ["laravel"]),
    "Rails":       (SkillCategoria.FRAMEWORK, ["rails", "ruby on rails", "ror"]),
    # Bases de datos
    "PostgreSQL":  (SkillCategoria.BASE_DATOS, ["postgresql", "postgres", "psql"]),
    "MySQL":       (SkillCategoria.BASE_DATOS, ["mysql"]),
    "MongoDB":     (SkillCategoria.BASE_DATOS, ["mongodb", "mongo"]),
    "Redis":       (SkillCategoria.BASE_DATOS, ["redis"]),
    "SQL Server":  (SkillCategoria.BASE_DATOS, ["sql server", "sqlserver", "mssql"]),
    "Oracle":      (SkillCategoria.BASE_DATOS, ["oracle", "oracle db"]),
    "SQLite":      (SkillCategoria.BASE_DATOS, ["sqlite"]),
    "Elasticsearch": (SkillCategoria.BASE_DATOS, ["elasticsearch", "elastic search"]),
    # Cloud
    "AWS":         (SkillCategoria.CLOUD, ["aws", "amazon web services"]),
    "Azure":       (SkillCategoria.CLOUD, ["azure", "microsoft azure"]),
    "GCP":         (SkillCategoria.CLOUD, ["gcp", "google cloud", "google cloud platform"]),
    # DevOps
    "Docker":      (SkillCategoria.DEVOPS, ["docker"]),
    "Kubernetes":  (SkillCategoria.DEVOPS, ["kubernetes", "k8s"]),
    "Terraform":   (SkillCategoria.DEVOPS, ["terraform"]),
    "Jenkins":     (SkillCategoria.DEVOPS, ["jenkins"]),
    "GitHub Actions": (SkillCategoria.DEVOPS, ["github actions", "gh actions"]),
    "GitLab CI":   (SkillCategoria.DEVOPS, ["gitlab ci", "gitlab-ci"]),
    "CI/CD":       (SkillCategoria.DEVOPS, ["ci/cd", "cicd", "ci cd"]),
    # Herramientas
    "Git":         (SkillCategoria.HERRAMIENTA, ["git"]),
    "Linux":       (SkillCategoria.HERRAMIENTA, ["linux", "unix"]),
    "Jira":        (SkillCategoria.HERRAMIENTA, ["jira"]),
    # Metodologias
    "Scrum":       (SkillCategoria.METODOLOGIA, ["scrum"]),
    "Agile":       (SkillCategoria.METODOLOGIA, ["agile", "agil", "metodologias agiles"]),
    "Kanban":      (SkillCategoria.METODOLOGIA, ["kanban"]),
    "TDD":         (SkillCategoria.METODOLOGIA, ["tdd", "test driven development"]),
}

# index inverso: sinonimo lowercase -> nombre canonico
_INDICE: dict[str, str] = {}
for canonico, (_, sinonimos) in TAXONOMIA.items():
    _INDICE[canonico.lower()] = canonico
    for s in sinonimos:
        _INDICE[s] = canonico


def normalizar(nombre: str) -> str | None:
    """Devuelve el nombre canonico de un skill, o None si no esta en la taxonomia."""
    if not nombre:
        return None
    return _INDICE.get(nombre.strip().lower())


def categoria_de(nombre_canonico: str) -> SkillCategoria | None:
    """Devuelve la categoria de un skill canonico."""
    entry = TAXONOMIA.get(nombre_canonico)
    return entry[0] if entry else None
