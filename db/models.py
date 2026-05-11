from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, Float, ForeignKey, TIMESTAMP, UniqueConstraint, func
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from db.database import Base


# Etapas del pipeline del candidato dentro de una vacante.
# Orden lineal del flujo del reclutador.
ETAPAS_APLICACION = (
    "nueva",
    "en_revision",
    "shortlist",
    "entrevista",
    "entrevista_tecnica",
    "oferta",
    "rechazada",
)


class Candidato(Base):
    __tablename__ = "candidatos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    # email es la clave de dedupe; un mismo email = misma persona aunque postule
    # a varias vacantes. Nullable porque algunos CVs no traen email extraible.
    email = Column(String(255), nullable=True, index=True)
    telefono = Column(String(50), nullable=True)

    cv_componentes = relationship("CVComponente", back_populates="candidato", cascade="all, delete-orphan")
    aplicaciones = relationship("Aplicacion", back_populates="candidato", cascade="all, delete-orphan")
    analisis = relationship("Analisis", back_populates="candidato", cascade="all, delete-orphan")


class Vacante(Base):
    __tablename__ = "vacantes"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    requisitos_texto = Column(Text)
    # cache: extraccion estructurada del LLM + hash del texto fuente para invalidacion
    requisitos_estructurados_json = Column(JSON, nullable=True)
    requisitos_texto_hash = Column(String(64), nullable=True)
    # pesos custom del scorer; si NULL se usan PESOS_DEFAULT
    pesos_json = Column(JSON, nullable=True)

    requisitos = relationship("Requisito", back_populates="vacante", cascade="all, delete-orphan")
    aplicaciones = relationship("Aplicacion", back_populates="vacante", cascade="all, delete-orphan")
    analisis = relationship("Analisis", back_populates="vacante", cascade="all, delete-orphan")


class Requisito(Base):
    __tablename__ = "requisitos"
    id = Column(Integer, primary_key=True, index=True)
    vacante_id = Column(Integer, ForeignKey("vacantes.id", ondelete="CASCADE"), nullable=False)
    descripcion = Column(Text, nullable=False)

    vacante = relationship("Vacante", back_populates="requisitos")


class CVComponente(Base):
    __tablename__ = "cv_componentes"
    id = Column(Integer, primary_key=True, index=True)
    candidato_id = Column(Integer, ForeignKey("candidatos.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(String(50))
    descripcion = Column(Text)

    candidato = relationship("Candidato", back_populates="cv_componentes")


class Aplicacion(Base):
    __tablename__ = "aplicaciones"
    __table_args__ = (
        UniqueConstraint("vacante_id", "candidato_id", name="uq_aplicacion_vac_cand"),
    )
    id = Column(Integer, primary_key=True, index=True)
    vacante_id = Column(Integer, ForeignKey("vacantes.id", ondelete="CASCADE"), nullable=False, index=True)
    candidato_id = Column(Integer, ForeignKey("candidatos.id", ondelete="CASCADE"), nullable=False, index=True)
    # Etapa actual del pipeline. Valor por defecto al crear la aplicacion.
    etapa = Column(String(20), nullable=False, default="nueva", index=True)
    # Anotaciones libres del reclutador.
    notas = Column(Text, nullable=True)
    fecha_aplicacion = Column(TIMESTAMP, server_default=func.now())
    actualizada_en = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    vacante = relationship("Vacante", back_populates="aplicaciones")
    candidato = relationship("Candidato", back_populates="aplicaciones")


class Analisis(Base):
    __tablename__ = "analisis"
    id = Column(Integer, primary_key=True, index=True)
    candidato_id = Column(Integer, ForeignKey("candidatos.id", ondelete="CASCADE"), nullable=False)
    vacante_id = Column(Integer, ForeignKey("vacantes.id", ondelete="CASCADE"), nullable=False)
    # Aplicacion a la que pertenece este analisis. Nullable para soportar
    # filas creadas antes de existir el modelo Aplicacion (backfill posterior).
    aplicacion_id = Column(
        Integer,
        ForeignKey("aplicaciones.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    puntaje_total = Column(Integer, default=0)
    desglose = Column(JSON)  # [{categoria, puntaje, comentario, peso, feature, contribucion}]
    sentimiento_compound = Column(Float, nullable=True)
    # snapshot del input al scorer; necesario para explicabilidad y auditoria.
    cv_estructurado_json = Column(JSON, nullable=True)
    requisitos_snapshot_json = Column(JSON, nullable=True)
    soft_skills_json = Column(JSON, nullable=True)
    features_crudos_json = Column(JSON, nullable=True)
    pesos_aplicados_json = Column(JSON, nullable=True)
    skills_match = Column(JSON, nullable=True)
    skills_faltantes = Column(JSON, nullable=True)
    # Preguntas de entrevista personalizadas a este CV. Generadas best-effort
    # despues del scoring; si la llamada al LLM falla queda NULL pero el
    # analisis sigue siendo valido.
    preguntas_cv_json = Column(JSON, nullable=True)
    # Evaluacion de la entrevista (audio transcripto → LLM). Tres dimensiones:
    # cobertura, consistencia, profundidad. Nullable hasta que se suba audio.
    evaluacion_entrevista_json = Column(JSON, nullable=True)
    analizado_en = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    candidato = relationship("Candidato", back_populates="analisis")
    vacante = relationship("Vacante", back_populates="analisis")
    transcripciones = relationship(
        "Transcripcion", back_populates="analisis", cascade="all, delete-orphan"
    )


class Transcripcion(Base):
    __tablename__ = "transcripciones"
    id = Column(Integer, primary_key=True, index=True)
    analisis_id = Column(Integer, ForeignKey("analisis.id", ondelete="CASCADE"), nullable=True, index=True)
    archivo = Column(String(500))
    inicio = Column(String(20))
    fin = Column(String(20))
    hablante = Column(Integer)
    texto = Column(Text)
    sentimiento_neg = Column(Float, nullable=True)
    sentimiento_neu = Column(Float, nullable=True)
    sentimiento_pos = Column(Float, nullable=True)
    sentimiento_compound = Column(Float, nullable=True)
    creado_en = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    analisis = relationship("Analisis", back_populates="transcripciones")


class GuiaEntrevista(Base):
    """Guia tecnica de entrevista generada por el LLM a partir de los requisitos
    de la vacante. Una guia por vacante; regenerar reemplaza la anterior."""
    __tablename__ = "guias_entrevista"
    id = Column(Integer, primary_key=True, index=True)
    vacante_id = Column(
        Integer,
        ForeignKey("vacantes.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    preguntas_json = Column(JSON, nullable=False)  # list[PreguntaEntrevista]
    criterios_json = Column(JSON, nullable=True)   # list[str]
    senales_alerta_json = Column(JSON, nullable=True)  # list[str]
    generada_en = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class CostoLLM(Base):
    """Una fila por llamada al LLM hecha durante un analisis. Permite reportar
    costo por candidato, vacante, tenant, modelo, periodo, etc."""
    __tablename__ = "costos_llm"
    id = Column(Integer, primary_key=True, index=True)
    analisis_id = Column(Integer, ForeignKey("analisis.id", ondelete="CASCADE"), nullable=True, index=True)
    provider = Column(String(50))
    model = Column(String(100))
    operacion = Column(String(50))   # extract_cv, extract_requisitos, evaluate_soft_skills
    tokens_input = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    tokens_cache_read = Column(Integer, default=0)
    tokens_cache_creation = Column(Integer, default=0)
    duracion_ms = Column(Float, default=0.0)
    costo_usd = Column(Float, default=0.0)
    creado_en = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
