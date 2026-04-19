prompt = (
    f"Escreva uma análise do estilo de jogo do clube {clube} nos últimos 5 jogos {local_descricao}, em português brasileiro.\n\n"
    f"Métricas de estilo (valores nominais médios dos últimos 5 jogos):\n{pd.Series(metrics_series).to_string()}\n\n"
    f"Contexto conceitual - Métricas de estilo:\n{context_style_df.to_string()}\n\n"
    "A análise deve: (1) descrever o estilo de jogo observado a partir das métricas, SEM recorrer a rótulos pré-definidos de estilos históricos (tiki-taka, gegenpressing, catenaccio, jogo total, kick and rush, etc.); use termos descritivos em português que reflitam os padrões reais das métricas; "
    "(2) descrever características defensivas (pressão, altura, intensidade); "
    "(3) descrever características ofensivas (construção, verticalização, finalização). "
    "Formato: técnico mas compreensível, até 250 palavras (rigorosamente), Markdown leve com parágrafos curtos e **negrito** para destaques. "
    "Evite listas longas, tabelas e cabeçalhos. "
    "NÃO inclua título, cabeçalho, nem mencione o nome do clube na primeira linha — comece a análise diretamente pelo conteúdo. "
    "Não apresente valores de métricas na análise final."
)
