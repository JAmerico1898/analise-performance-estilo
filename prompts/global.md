Aplicativo Web:

<tarefa>
Em <contexto>, a descrição de um aplicativo web. Sua tarefa é propor um design.md de uma jornada agradável ao usuário, pois acho que tem muitos dados e o usuário pode se perder ou desistir. Há um rascunho do diagrama do app em anexo ("/prompts/sketch.jpeg").
</tarefa>
<qualidades_performance>
['Defesa', 'Transição Defensiva', 'Transição ofensiva', 'Ataque', 'Criação de chances']
</qualidades>
<métricas_performance>
Defesa: ['PPDA', 'Intensidade defensiva', 'Duelos defensivos vencidos (%)', 'Altura defensiva (m)', 'Velocidade do passe do adversário', 'Entradas do adversário no último terço (%)', 'Entradas do adversário na área (%)', 'xT Adversário']
Transição Defensiva: ['Perda de posse na linha baixa', 'Altura da perda de posse (m)', 'Recuperações de posse em 5s %', 'Tempo médio ação defensiva (s)', 'Tempo médio para recuperação de posse (s)', 'Entradas do adversário no último terço em 10s da recuperação da posse', 'Entradas do adversário na área em 10s da recuperação da posse', 'xG do adversário em 10s da recuperação da posse']
Transição ofensiva: ['Recuperações de posse', 'Altura da recuperação de posse (m)', 'Posse mantida em 5s', 'Posse mantida em 5s (%)', 'Entradas no último terço em 10s', 'Entradas na área em 10s', 'xG em 10s da recuperação da posse', 'xT em 10s da recuperação da posse']
Ataque: ['Field tilt (%)', 'Bola longa %', 'Velocidade do passe', 'Entradas no último terço (%)', 'Entradas na área (%)', 'xT (ameaça esperada)']
Criação de chances: ['Toques na área', 'Finalizações (pEntrada na área, %)', 'Finalizações (exceto pênaltis)', 'Grandes oportunidades', 'xG (exceto pênaltis)', 'Gols (exceto pênaltis)', 'xG (pFinalização)']
<qualidades_estilo>
['Defesa', 'Transição Defensiva', 'Transição ofensiva', 'Ataque', 'Criação de chances']
</qualidades_estilo>
<métricas_estilo>
Defesa: ['Altura defensiva', 'Recuperações de posse no último terço (%)', 'PPDA', 'Faltas no campo de ataque (%)', 'Intensidade defensiva']
Transição Defensiva: ['Tempo médio ação defensiva (s)', 'Sucesso da pressão pós perda (5s) (%)', 'Índice de Vulnerabilidade na Transição', 'Entradas do adversário no último terço em 10s', 'Entradas do adversário na área em 10s']
Transição ofensiva: ['Tempo para progressão (s)', 'Primeiro passe à frente (%)', 'Entradas no último terço em 10s', 'Entradas na área em 10s', 'Posse mantida em 5s (%)']
Ataque: ['Bola longa (%)', 'Buildup do goleiro (%)', 'Passes progressivos do terço médio (%)', 'Entradas no último terço por Cruzamentos (%)', 'Entradas no último terço por Dribles (%)', 'Entradas na área por Cruzamentos (%)', 'Entradas na área por Conduções (%)']
Criação de chances: ['Finalizações em ataque sustentado (%)', 'Finalizações em ataque direto (%)', 'Finalizações por passe no último terço (%)', 'Finalizações de fora da área (%)']
</métricas_estilo>
<clubes>
['Vasco da Gama', 'Atletico MG', 'Bahia', 
'Botafogo RJ', 'Ceara', 'Corinthians', 'Cruzeiro', 
'Flamengo', 'Fluminense', 'Fortaleza', 'Gremio', 
'Internacional', 'Juventude', 'Mirassol', 'Palmeiras', 
'Red Bull Bragantino', 'Santos', 'Sao Paulo', 'Sport', 'Vitoria']
</clubes>
<contexto>
ANALISE DOS CLUBES DA SÉRIE A DO BRASILEIRÃO 
O aplicativo está estruturado em dois grandes blocos: análise de performance e análise de estilo de jogo. A análise de performance possui 5 qualidades <qualidades_performance> que correspondem a 37 métricas <métricas_performance>. A análise de estilo possui as mesmas 5 qualidades <qualidades_estilo> que, por sua vez, correspondem a 26 métricas <métricas_estilo>
A Análise de performance apresenta cinco blocos: 
Bloco 1: Clube versus clube: Compara um dado jogo de um dado clube <clubes> com os demais jogos desse clube na competição. 
Bloco 2: Clube na Rodada: Compara a performance de um dado clube <clubes> com a dos 19 demais clubes em uma dada rodada da competição.
Bloco 3: Clube na competição: Compara a performance de um dado clube <clubes> com a dos 19 demais clubes da competição, por meio de uma média móvel de 5 jogos em um gráfico de linhas.
Bloco 4: 2026 versus 2025: Compara a performance de um dado clube <clubes> na temporada de  2026 com sua performance em 2025, por meio de uma média móvel de 5 jogos em um gráfico de linhas.
Bloco 5: Análise de performance: Apresenta dois desdobramentos: Casa e fora de casa. Extrai as oito variáveis de melhor desempenho e as oito variáveis de pior desempenho de um dado clube <clubes> e submete a um LLM (Gemini) para análise de pontos fortes e fracos, em casa ou fora de casa a escolha do usuário.
Os Blocos 1 e 2 utilizam como visualização  distribution plot do Z-Score das qualidades do clube, que pode ser desdobrado em distribution plots do Z-Score das métricas que compõem essas qualidades. Em ambos, o clube selecionado é destacado e os valores nominais das métricas aparecem no hover, juntamente com a posição relativa na distribuição.
Os Blocos 3 e 4 utilizam como visualização  gráfico de linha do Z-Score das qualidades do clube, que pode ser desdobrado em gráficos de linha do Z-Score das métricas que compõem essss qualidades.
O bloco 5 não apresenta visualização, apenas o relatório com a resposta do LLM

Análise de Estilo de Jogo:
Apresenta dois desdobramentos casa e fora de casa. Utiliza qualidades e métricas de estilo de jogo dos últimos 5 jogos em casa ou fora de casa os quais são submetidos ao LLM para análise do estilo de jogo. A Única saída é o relatório com a resposta do LLM.
</contexto>