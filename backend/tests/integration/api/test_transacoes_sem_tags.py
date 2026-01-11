"""
Testes de integração para filtro sem_tags
Valida a funcionalidade de filtrar transações sem tags associadas
"""
import pytest


@pytest.mark.integration
class TestTransacoesSemTags:
    """Testes de API para filtro sem_tags"""
    
    def test_listar_transacoes_sem_tags(self, client):
        """Deve filtrar apenas transações sem tags"""
        # Criar tag
        tag = client.post("/tags", json={"nome": "Tagged", "cor": "#FF0000"}).json()
        
        # Criar transação sem tag
        t_sem_tag = client.post("/transacoes", json={
            "data": "2024-01-15",
            "descricao": "Transacao sem tag",
            "valor": 100.0,
            "tipo": "saida"
        }).json()
        
        # Criar transação com tag
        t_com_tag = client.post("/transacoes", json={
            "data": "2024-01-16",
            "descricao": "Transacao com tag",
            "valor": 200.0,
            "tipo": "saida"
        }).json()
        
        # Adicionar tag à segunda transação
        client.post(f"/transacoes/{t_com_tag['id']}/tags/{tag['id']}")
        
        # Filtrar apenas sem tags
        response = client.get("/transacoes", params={"sem_tags": "true"})
        
        assert response.status_code == 200
        transacoes = response.json()
        
        # Verificar que retorna apenas a transação sem tag
        descricoes = [t["descricao"] for t in transacoes]
        assert "Transacao sem tag" in descricoes
        assert "Transacao com tag" not in descricoes
        
        # Verificar que todas não têm tags
        for t in transacoes:
            if t["descricao"] == "Transacao sem tag":
                assert len(t["tag_ids"]) == 0
    
    def test_listar_transacoes_com_tags_ou_sem_tags(self, client):
        """Deve filtrar transações com tag específica OU sem tags (lógica OR)"""
        # Criar tags
        tag1 = client.post("/tags", json={"nome": "Tag1", "cor": "#FF0000"}).json()
        tag2 = client.post("/tags", json={"nome": "Tag2", "cor": "#00FF00"}).json()
        
        # Criar transações
        t_sem_tag = client.post("/transacoes", json={
            "data": "2024-01-15",
            "descricao": "Sem tag",
            "valor": 100.0,
            "tipo": "saida"
        }).json()
        
        t_com_tag1 = client.post("/transacoes", json={
            "data": "2024-01-16",
            "descricao": "Com tag 1",
            "valor": 200.0,
            "tipo": "saida"
        }).json()
        
        t_com_tag2 = client.post("/transacoes", json={
            "data": "2024-01-17",
            "descricao": "Com tag 2",
            "valor": 300.0,
            "tipo": "saida"
        }).json()
        
        # Adicionar tags
        client.post(f"/transacoes/{t_com_tag1['id']}/tags/{tag1['id']}")
        client.post(f"/transacoes/{t_com_tag2['id']}/tags/{tag2['id']}")
        
        # Filtrar por tag1 OU sem tags
        response = client.get("/transacoes", params={
            "tags": str(tag1['id']),
            "sem_tags": "true"
        })
        
        assert response.status_code == 200
        transacoes = response.json()
        
        # Verificar que retorna transações sem tag E com tag1
        descricoes = [t["descricao"] for t in transacoes]
        assert "Sem tag" in descricoes
        assert "Com tag 1" in descricoes
        assert "Com tag 2" not in descricoes
    
    def test_listar_transacoes_com_multiplas_tags_ou_sem_tags(self, client):
        """Deve filtrar transações com múltiplas tags OU sem tags"""
        # Criar tags
        tag1 = client.post("/tags", json={"nome": "A", "cor": "#FF0000"}).json()
        tag2 = client.post("/tags", json={"nome": "B", "cor": "#00FF00"}).json()
        tag3 = client.post("/tags", json={"nome": "C", "cor": "#0000FF"}).json()
        
        # Criar transações
        t_sem = client.post("/transacoes", json={
            "data": "2024-01-15",
            "descricao": "Sem",
            "valor": 100.0,
            "tipo": "saida"
        }).json()
        
        t_a = client.post("/transacoes", json={
            "data": "2024-01-16",
            "descricao": "A",
            "valor": 200.0,
            "tipo": "saida"
        }).json()
        
        t_b = client.post("/transacoes", json={
            "data": "2024-01-17",
            "descricao": "B",
            "valor": 300.0,
            "tipo": "saida"
        }).json()
        
        t_c = client.post("/transacoes", json={
            "data": "2024-01-18",
            "descricao": "C",
            "valor": 400.0,
            "tipo": "saida"
        }).json()
        
        # Adicionar tags
        client.post(f"/transacoes/{t_a['id']}/tags/{tag1['id']}")
        client.post(f"/transacoes/{t_b['id']}/tags/{tag2['id']}")
        client.post(f"/transacoes/{t_c['id']}/tags/{tag3['id']}")
        
        # Filtrar por tag A ou B OU sem tags
        response = client.get("/transacoes", params={
            "tags": f"{tag1['id']},{tag2['id']}",
            "sem_tags": "true"
        })
        
        assert response.status_code == 200
        transacoes = response.json()
        
        # Verificar que retorna Sem, A e B, mas não C
        descricoes = [t["descricao"] for t in transacoes]
        assert "Sem" in descricoes
        assert "A" in descricoes
        assert "B" in descricoes
        assert "C" not in descricoes
    
    def test_sem_tags_false_retorna_todas(self, client):
        """Quando sem_tags=false (padrão), deve retornar todas as transações"""
        # Criar transações com e sem tags
        tag = client.post("/tags", json={"nome": "Test", "cor": "#FF0000"}).json()
        
        t_sem = client.post("/transacoes", json={
            "data": "2024-01-15",
            "descricao": "Sem tag test",
            "valor": 100.0,
            "tipo": "saida"
        }).json()
        
        t_com = client.post("/transacoes", json={
            "data": "2024-01-16",
            "descricao": "Com tag test",
            "valor": 200.0,
            "tipo": "saida"
        }).json()
        
        client.post(f"/transacoes/{t_com['id']}/tags/{tag['id']}")
        
        # Sem passar sem_tags (ou sem_tags=false)
        response = client.get("/transacoes", params={"sem_tags": "false"})
        
        assert response.status_code == 200
        transacoes = response.json()
        
        # Deve incluir ambas
        descricoes = [t["descricao"] for t in transacoes]
        assert "Sem tag test" in descricoes
        assert "Com tag test" in descricoes
    
    def test_resumo_mensal_sem_tags(self, client):
        """Deve calcular resumo mensal filtrando apenas transações sem tags"""
        # Criar tag
        tag = client.post("/tags", json={"nome": "ResumoTag", "cor": "#00FF00"}).json()
        
        # Criar transações
        t_sem = client.post("/transacoes", json={
            "data": "2024-02-15",
            "descricao": "Sem tag resumo",
            "valor": 150.0,
            "tipo": "saida"
        }).json()
        
        t_com = client.post("/transacoes", json={
            "data": "2024-02-16",
            "descricao": "Com tag resumo",
            "valor": 250.0,
            "tipo": "saida"
        }).json()
        
        # Adicionar tag à segunda transação
        client.post(f"/transacoes/{t_com['id']}/tags/{tag['id']}")
        
        # Obter resumo mensal apenas de transações sem tags
        response = client.get("/transacoes/resumo/mensal", params={
            "data_inicio": "2024-02-01",
            "data_fim": "2024-02-29",
            "sem_tags": "true"
        })
        
        assert response.status_code == 200
        resumo = response.json()
        
        # Verificar que o resumo inclui apenas a transação sem tag
        assert resumo["total_saidas"] == 150.0
    
    def test_resumo_mensal_tags_ou_sem_tags(self, client):
        """Deve calcular resumo mensal com tags OU sem tags"""
        # Criar tags
        tag1 = client.post("/tags", json={"nome": "ResumoA", "cor": "#FF0000"}).json()
        tag2 = client.post("/tags", json={"nome": "ResumoB", "cor": "#00FF00"}).json()
        
        # Criar transações
        t_sem = client.post("/transacoes", json={
            "data": "2024-03-15",
            "descricao": "Sem resumo",
            "valor": 100.0,
            "tipo": "entrada"
        }).json()
        
        t_a = client.post("/transacoes", json={
            "data": "2024-03-16",
            "descricao": "A resumo",
            "valor": 200.0,
            "tipo": "entrada"
        }).json()
        
        t_b = client.post("/transacoes", json={
            "data": "2024-03-17",
            "descricao": "B resumo",
            "valor": 300.0,
            "tipo": "entrada"
        }).json()
        
        # Adicionar tags
        client.post(f"/transacoes/{t_a['id']}/tags/{tag1['id']}")
        client.post(f"/transacoes/{t_b['id']}/tags/{tag2['id']}")
        
        # Obter resumo com tag A OU sem tags
        response = client.get("/transacoes/resumo/mensal", params={
            "data_inicio": "2024-03-01",
            "data_fim": "2024-03-31",
            "tags": str(tag1['id']),
            "sem_tags": "true"
        })
        
        assert response.status_code == 200
        resumo = response.json()
        
        # Deve incluir: Sem (100) + A (200) = 300, mas não B
        assert resumo["total_entradas"] == 300.0
