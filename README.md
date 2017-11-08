Agiliza ERP - Introdução
===================

ERP que visa ajudar a gerência de pequenas/médias empresas, onde a atividade da mesma envolve vendas e logística.
Além da agilidade em lançar e acompanhar pedidos, relatórios objetivos e inteligentes ajudam a traçar estratégias do tipo: qual o custo de deslocamento dos veículos em cada entrega, quantos preciso vender para atingir o ponto de equilíbrio, melhor aumentar o preço dos podutos ou o volume de vendas?

----------


Convenções
-------------

Para manter uma boa integridade do projeto, é importante seguir as seguintes convenções:

**Inglês**

As nomenclaturas dos models, colunas/documentos/tabelas/coleções dos BDs, variáveis, nome de arquivos, classes, commits/branches do Git **deverão ser escritos no inglês**.

**Branches**

Os branches devem ser usados para a implementação de recursos/correção de bugs. Para tais, as nomenclaturas serão: **feature/*nome-do-recurso***, **bug/*bug-a-ser-corrigido** - deve ser obrigatóriamente ligado a um "issue", para isso o commit deve.

| Item     | Explicação   |
| :------- | ----: |
| feature/nome-do-recurso | Novo recurso |
| bug/bug-corrigido | Link do issue (#issue-id)   |
| hotfix/erro-corrigido | Correção direto no código  |
| junk/experimento | Nunca irá receber um merge  |

**Commits**

O título do commit deve retratar o resultado da alteração, não as especificidades. Tente colocar os detalhes da alteração na descrição do commit. Lembre-se que o Git permite ver o código das alterações, portanto as vezes os detalhes são mais fáceis de ser entendidas vendo o código do que descritas em texto.

> **ERRADO**: "The user can now make CRUD requests to a specific endpoint only if he has those permissions."

>  **CERTO**: "CRUD permissions for users."

**Versionamento**

As tags do git devem ser usadas para o versionamento. Usaremos o formato "**vX,Y,Z**" ao nomea-las. Veja a próxima seção para mais detalhes.

Versionamento
-------------

Como descrito nas convenções, o versionamento será adicionado no repositório no formato "**vX,Y,Z**". O projeto será iniciado na versão v0.1.0, enquanto o projeto estiver em desenvolvimento a versão será v0.X.Y; a versão inicial de produção será v1.0.0.

- **X** ou MAJOR - grande alteração/implementação, incompatível com as versões anteriores
- **Y** ou MINOR - pequena alteração/implementação, compatível com as versões anteriores
- **Z** ou PATCH - correçaõ de bugs, compatível com as versões anteriores

----------

Qualquer detalhe adicional, perguntar nos **Issues** do GitHub.
