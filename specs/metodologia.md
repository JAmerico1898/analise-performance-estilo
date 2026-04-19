# Metodologia

## 1. Fonte dos dados

As análises apresentadas neste aplicativo têm como base **dados de evento** fornecidos pela **Opta**, provedora internacionalmente reconhecida pela coleta detalhada e padronizada de dados de futebol. Os dados de evento registram, com marcação temporal e espacial, cada ação relevante ocorrida em campo — passes, finalizações, desarmes, recuperações de posse, entradas em setores específicos do terreno, entre outras — o que permite reconstruir de forma granular a dinâmica das partidas.

A partir dessa base primária, todo o arcabouço analítico do aplicativo é construído por meio de processos sucessivos de agregação, transformação e padronização, descritos nas seções seguintes.

## 2. Definição das rodadas

As rodadas consideradas no aplicativo seguem estritamente a **programação oficial da Confederação Brasileira de Futebol (CBF)**, e não o cronograma efetivo de realização das partidas. Essa escolha metodológica decorre de uma particularidade do calendário do Campeonato Brasileiro: jogos são frequentemente antecipados ou adiados em função de compromissos dos clubes em outras competições, o que torna inviável definir uma rodada pelo agrupamento temporal dos jogos efetivamente disputados.

A adoção do cronograma oficial da CBF é, portanto, o único critério capaz de garantir que **cada rodada contemple exatamente dez partidas**, preservando a comparabilidade entre rodadas e a integridade das análises longitudinais.

## 3. Construção das métricas

A partir dos dados de evento, são calculadas duas famílias de métricas, correspondentes às duas dimensões analíticas do aplicativo:

- **Performance** — 36 métricas que descrevem o *desempenho* das equipes, combinadas em **5 qualidades de performance**;
- **Estilo de jogo** — 26 métricas que descrevem o *modo como* as equipes jogam, combinadas em **5 qualidades de estilo**.

A relação completa das métricas e das qualidades, bem como suas respectivas definições operacionais, encontra-se no **Glossário** do aplicativo.

## 4. Padronização via Z-Score

As métricas de performance e de estilo possuem naturezas, unidades e escalas heterogêneas: algumas são expressas em porcentagem, outras em segundos, outras ainda em contagens absolutas ou em valores esperados (*expected values*). A comparação direta entre equipes exige, portanto, uma etapa de **padronização**.

Para tal, cada métrica é convertida em um **Z-Score**, definido como:

$$
Z_i = \frac{x_i - \mu}{\sigma}
$$

onde $x_i$ é o valor observado para a equipe $i$, $\mu$ é a média da métrica considerando todas as equipes da amostra e $\sigma$ é o respectivo desvio-padrão.

O Z-Score expressa, em unidades de desvio-padrão, o afastamento de uma observação em relação à média do conjunto. Valores positivos indicam desempenho acima da média; valores negativos, desempenho abaixo da média. Assim, um Z-Score de +1 significa que a equipe está um desvio-padrão acima da média naquela métrica, ao passo que um Z-Score de –1,5 a situa um desvio-padrão e meio abaixo da média.

Essa padronização cumpre três funções essenciais: (i) torna métricas com unidades distintas diretamente comparáveis; (ii) permite a agregação de métricas em qualidades sintéticas sem que qualquer delas domine, por razões meramente de escala, o valor final; e (iii) viabiliza uma leitura intuitiva e imediata do posicionamento relativo de cada equipe.

## 5. Inversão de métricas

A interpretação dos Z-Scores deve ser homogênea: convencionou-se que, para toda métrica apresentada no aplicativo, **valores mais altos correspondam a melhor desempenho** e valores mais baixos, a pior desempenho. Entretanto, diversas métricas possuem, em sua forma bruta, orientação inversa — isto é, são tanto melhores quanto menores. Para essas métricas, aplica-se a inversão de sinal:

$$
Z_i^{*} = -Z_i
$$

### 5.1. Métricas de performance invertidas

Na dimensão de performance, são invertidas as seguintes métricas:

1. PPDA
2. Velocidade do passe adversário
3. Entradas do adversário no último terço (%)
4. Entradas do adversário na área (%)
5. xT adversário
6. Perdas de posse na linha baixa
7. Tempo médio da ação defensiva (s)
8. Tempo para recuperação (s)
9. Entradas do adversário no último terço em 10s da recuperação da posse
10. Entradas do adversário na área em 10s da recuperação da posse
11. xG do adversário em 10s da recuperação da posse
12. Gols sofridos

### 5.2. Métricas de estilo invertidas

Na dimensão de estilo de jogo, são invertidas as seguintes métricas:

1. PPDA
2. Tempo médio da ação defensiva (s)
3. Índice de Vulnerabilidade na Transição
4. Entradas do adversário no último terço em 10s
5. Entradas do adversário na área em 10s
6. Tempo para progressão (s)
7. Finalizações de fora da área (%)

Após a inversão, todas as métricas — originais e invertidas — podem ser lidas sob a mesma convenção semântica: *quanto maior, melhor*.

## 6. Agregação em qualidades

As qualidades de performance e de estilo são obtidas pela **média aritmética simples dos Z-Scores das métricas** que as compõem:

$$
Q_k = \frac{1}{n_k} \sum_{j=1}^{n_k} Z_j^{*}
$$

onde $Q_k$ é a k-ésima qualidade, $n_k$ é o número de métricas que a compõem e $Z_j^{*}$ é o Z-Score (eventualmente invertido) da métrica $j$.

A opção pela média simples — em detrimento de esquemas de ponderação — reflete a premissa de que as métricas selecionadas para compor cada qualidade foram previamente avaliadas como pertinentes e mutuamente complementares, de modo que não há justificativa teórica robusta para atribuir pesos distintos a priori. Esquemas ponderados podem ser explorados em versões futuras do aplicativo, mediante validação empírica.

## 7. Redação automatizada das análises

As análises textuais apresentadas no aplicativo são **redigidas automaticamente pelo modelo Google Gemini**. O processo opera do seguinte modo: os Z-Scores das métricas e qualidades calculados nas etapas anteriores são organizados em uma estrutura de dados tabular e submetidos ao modelo juntamente com um *prompt* específico, que instrui o Gemini sobre o contexto do aplicativo, a convenção interpretativa dos Z-Scores (*quanto maior, melhor*), a hierarquia entre métricas e qualidades e o estilo desejado para o texto.

A partir desses insumos, o modelo gera um comentário analítico personalizado para a equipe, rodada ou comparação em questão. Essa abordagem combina o **rigor quantitativo** do pipeline de dados com a **flexibilidade narrativa** da geração de linguagem natural, permitindo produção em escala de análises contextualizadas sem comprometer a consistência metodológica.