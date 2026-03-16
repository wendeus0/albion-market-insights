# ERROR_LOG.md — Albion Market Insights

<!-- Atualizado por: session-logger | Não editar manualmente durante sessão ativa -->

## Formato de entrada

```
### [YYYY-MM-DD HH:MM] <contexto>
- **Erro**: descrição
- **Causa**: causa identificada
- **Ação tomada**: o que foi feito
- **Status**: RESOLVIDO | PENDENTE | ESCALADO
```

---

### [2026-03-16 02:36] fix-feature: test de timeout com mismatch de timer

- **Erro**: Teste `retorna mock data em timeout (>10s)` falhava com timeout de 5000ms (limite do Vitest) em vez de assertion failure
- **Causa**: Teste avançava `vi.advanceTimersByTime(10_001)` mas o serviço usa `setTimeout(..., 15_000)` — o abort nunca disparava e o teste ficava pendurado
- **Ação tomada**: Corrigido para `vi.advanceTimersByTime(15_001)` e título atualizado para "timeout (>15s)" — incluído no commit `ad190a2`
- **Status**: RESOLVIDO

---

<!-- Sem outros erros nesta sessão -->
