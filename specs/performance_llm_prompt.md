prompt = (
    f"Escreva uma análise aprofundada sobre a performance do clube {clube} baseada nos dados fornecidos, em português brasileiro. \n\n"
    f"A análise deve contemplar: "
    f"Análise geral sobre os atributos do clube {clube}:\n{pd.Series(attributes_sorted).to_string()}\n\n"
    f"Pontos fortes (6 métricas em z-score nas quais o clube se destacou positivamente):\n{pd.Series(metricas_melhores_sorted).to_string()}\n\n"
    f"Pontos fracos (6 métricas em z-score nas quais o clube se destacou negativamente):\n{pd.Series(metricas_piores_sorted).to_string()}\n\n"
    f"Contexto Conceitual - Qualidades e Métricas:\n{context_df.to_string()}\n\n"
    "Considere o desempenho nas qualidades e a relação entre as métricas destacadas e as qualidades as quais pertencem. "
    "A análise deve ser bem estruturada, técnica mas compreensível e com aproximadamente 200 palavras. "
    "Não apresente z-scores na análise final."
        )
