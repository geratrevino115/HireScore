from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, ForeignKey, TIMESTAMP, func
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from db.database import Base

class Vacancy(Base):
    __tablename__ = "vacancies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, index=True)
    vacancy_id = Column(String, index=True)
    compatibility = Column(Integer)
    requirements = Column(JSON)
    analyzed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Vacante(Base):
    __tablename__ = "vacantes"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    
    # Relaciones: una vacante tiene muchos requisitos y aplicaciones
    requisitos = relationship("Requisito", back_populates="vacante", cascade="all, delete-orphan")
    aplicaciones = relationship("Aplicacion", back_populates="vacante", cascade="all, delete-orphan")

class Requisito(Base):
    __tablename__ = "requisitos"
    id = Column(Integer, primary_key=True, index=True)
    vacante_id = Column(Integer, ForeignKey("vacantes.id", ondelete="CASCADE"), nullable=False)
    descripcion = Column(Text, nullable=False)
    
    # Relación inversa
    vacante = relationship("Vacante", back_populates="requisitos")

class Candidato(Base):
    __tablename__ = "candidatos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    
    # Relaciones: un candidato tiene muchos componentes en su CV y puede aplicar a varias vacantes
    cv_componentes = relationship("CVComponente", back_populates="candidato", cascade="all, delete-orphan")
    aplicaciones = relationship("Aplicacion", back_populates="candidato", cascade="all, delete-orphan")

class CVComponente(Base):
    __tablename__ = "cv_componentes"
    id = Column(Integer, primary_key=True, index=True)
    candidato_id = Column(Integer, ForeignKey("candidatos.id", ondelete="CASCADE"), nullable=False)
    tipo = Column(String(50))
    descripcion = Column(Text)
    
    # Relación inversa
    candidato = relationship("Candidato", back_populates="cv_componentes")

class Aplicacion(Base):
    __tablename__ = "aplicaciones"
    id = Column(Integer, primary_key=True, index=True)
    vacante_id = Column(Integer, ForeignKey("vacantes.id", ondelete="CASCADE"), nullable=False)
    candidato_id = Column(Integer, ForeignKey("candidatos.id", ondelete="CASCADE"), nullable=False)
    fecha_aplicacion = Column(TIMESTAMP, server_default=func.now())
    
    # Relaciones inversas
    vacante = relationship("Vacante", back_populates="aplicaciones")
    candidato = relationship("Candidato", back_populates="aplicaciones")
