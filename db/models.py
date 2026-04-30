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
    desglose = Column(JSON)  # [{categoria, puntaje, comentario}]
    sentimiento_compound = Column(Float, nullable=True)
    analizado_en = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    candidato = relationship("Candidato", back_populates="analisis")
    vacante = relationship("Vacante", back_populates="analisis")
