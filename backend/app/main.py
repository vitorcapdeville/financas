"""
FastAPI Application - Entry Point
Aplicação refatorada com Clean Architecture e SOLID principles.

Estrutura:
- domain/: Entidades, Value Objects, Interfaces de Repositórios
- application/: Use Cases, DTOs, Exceções
- infrastructure/: Implementações concretas (Repositórios, Models SQLModel)
- interfaces/api/: Routers FastAPI, Schemas Pydantic, Dependency Injection
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.interfaces.api.routers import configuracoes, importacao, regras, tags, transacoes, usuarios

app = FastAPI(
    title="Finanças Pessoais API",
    description="API para gerenciamento de finanças pessoais",
    version="2.0.0",
    redirect_slashes=False  # Desabilita redirect automático de trailing slashes
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transacoes.router)
app.include_router(tags.router)
app.include_router(regras.router)
app.include_router(configuracoes.router)
app.include_router(importacao.router)
app.include_router(usuarios.router)


@app.get("/")
def root():
    return {
        "message": "Finanças Pessoais API",
        "docs": "/docs",
        "version": "2.0.0",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
