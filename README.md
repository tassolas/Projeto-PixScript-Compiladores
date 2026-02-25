# 💸 Pix Script - Analisador Léxico

> Projeto desenvolvido para a disciplina de **Compiladores** do curso de **Engenharia de Computação** no **IF Goiano - Campus Trindade**.

## 🚀 Sobre o Projeto

O objetivo deste projeto é realizar a primeira etapa de um compilador: a **análise léxica**. O script lê um código fonte, identifica os caracteres e os agrupa em *tokens* válidos, gerando tabelas de símbolos e arquivos de objetos.

### 📄 Contexto da Linguagem (Pix Script)
A linguagem foi idealizada com uma sintaxe baseada em transações financeiras:
- **Início do programa:** `LEDGER <nome>` 
- **Fim do programa:** `CLOSE` 
- **Saída de dados:** `$>` (Ex: `$> 'Olá Mundo'`)
- **Atribuição:** `<-` ou `=`

### 🔣 Tipos de Dados e Símbolos
A linguagem é **fortemente tipada** e utiliza prefixos especiais para identificar os tipos de variáveis:

| Símbolo | Tipo de Dado | Exemplo |
| :---: | :--- | :--- |
| **$** | Decimal (Moeda) | `$valor` |
| **#** | Inteiro | `#contador` |
| **@** | Texto (String) | `@nome` |
| **?** | Booleano | `?ativo` |
| **!** | Chave PIX | `!email` |
| **~** | Nulo | `~vazio` |

---

## ⚙️ Funcionalidades do Analisador

O script `Pix.js` realiza as seguintes operações conforme especificado na avaliação:

1.  **Leitura de Arquivo:** Lê arquivos com extensão `.pix`. 
2.  **Tokenização:** Identifica palavras-chave (`LEDGER`, `IF`), operadores (`++`, `==`) e literais via Expressões Regulares (Regex).
3.  **Geração de `.pixobj`:** Cria um arquivo de saída contendo a sequência de tokens formatada (Ex: `<TIPO_INTEIRO, #count>`). 
4.  **Tabela de Símbolos (`.csv`):** Exporta um arquivo CSV com `id`, `lexema`, `token` e `valor` para conferência. 
5.  **Log de Erros:** Caso encontre um caractere inválido, gera o arquivo `erro_lexico.log`. 

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** JavaScript (Node.js) 
* **Módulos:** `fs` (File System) para manipulação de arquivos.

---

## ▶️ Como Executar

### Pré-requisitos
* Ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

### Passo a Passo

1.  Clone este repositório:
    ```bash
    git clone [https://github.com/seu-usuario/pix-script-lexico.git](https://github.com/seu-usuario/pix-script-lexico.git)
    ```
2.  Certifique-se de que o arquivo de código fonte `Pix.pix` está na raiz do projeto.
3.  Execute o analisador via terminal:
    ```bash
    node Pix.js
    ```
4.  Verifique os arquivos gerados na pasta:
    * `projeto.pixobj`
    * `tabela_simbolos.csv`

---

## 📝 Exemplo de Código (Pix.pix)

```text
LEDGER transferencia
 LET @nome = 'Denecley Alvim'
 LET $valor = 4999.99
 IF ($valor >> 100.00) {
    $> 'Realizar transferência'
 }
CLOSE
