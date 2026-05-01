from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, Float, ForeignKey, TIMESTAMP, func
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from db.database import Base


class Candidato(Base):
    __tablename__ = "candidatos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)

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
    id = Column(Integer, primary_key=True, index=True)
    vacante_id = Column(Integer, ForeignKey("vacantes.id", ondelete="CASCADE"), nullable=False)
    candidato_id = Column(Integer, ForeignKey("candidatos.id", ondelete="CASCADE"), nullable=False)
    fecha_aplicacion = Column(TIMESTAMP, server_default=func.now())

    vacante = relationship("Vacante", back_populates="aplicaciones")
    candidato = relationship("Candidato", back_populates="aplicaciones")


class Analisis(Base):
    __tablename__ = "analisis"
    id = Column(Integer, primary_key=True, index=True)
    candidato_id = Column(Integer, ForeignKey("candidatos.id", ondelete="CASCADE"), nullable=False)
    vacante_id = Column(Integer, ForeignKey("vacantes.id", ondelete="CASCADE"), nullable=False)
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
