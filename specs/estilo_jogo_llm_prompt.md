prompt = (
f"Escreva uma análise aprofundada sobre o estilo de jogo do clube {clube} baseada nos dados fornecidos, em português brasileiro. \n\n"
f"A análise deve contemplar: \n\n"
f"Pontos fortes (métricas em z-score que destacam as opções de jogo mais utilizadas pelo clube):\n{pd.Series(metricas_melhores_sorted).to_string()}\n\n"
f"Pontos fracos (métricas em z-score que destacam as opções de jogo menos utilizadas pelo clube):\n{pd.Series(metricas_piores_sorted).to_string()}\n\n"
f"jogos (resultados das últimas 5 partidas disputadas pelo clube):\n{pd.Series(jogos_df).to_string()}\n\n"
f"Contexto Conceitual - Qualidades e Métricas:\n{context_df.to_string()}\n\n"
"Considere os resultados dos jogos, o desempenho nas qualidades e a relação entre as métricas destacadas e as qualidades as quais pertencem para identificar o estilo de jogo do clube. "
"Se a identificação for clara, descreva o possível estilo de jogo da equipe com base nas definições fornecidas para qualidades e métricas. "
"A análise deve ser bem estruturada, técnica mas compreensível e com aproximadamente 200 palavras. "
"Não apresente z-scores na análise final."
)