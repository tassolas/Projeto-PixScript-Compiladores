const fs = require('fs');

const TIPOS_TOKEN = [
    { nome: 'PALAVRA_CHAVE', regex: /^(LEDGER|CLOSE|LET|IF|TRUE|FALSE)\b/ },
    { nome: 'SAIDA_TEXTO', regex: /^\$>/ },
    { nome: 'OP_RELACIONAL', regex: /^(==|!=|>>|<<|>=|<=)/ },
    { nome: 'ATRIBUICAO', regex: /^(=|<-)/ },
    { nome: 'OP_ARITMETICO', regex: /^(\+\+|--|\*\*|\/\/|%%)/ },
    { nome: 'OP_LOGICO', regex: /^(&&|\|\||!!)/ },
    { nome: 'VAR_DECIMAL', regex: /^\$[a-zA-Z_][a-zA-Z0-9_]*/ },
    { nome: 'VAR_INTEIRO', regex: /^#[a-zA-Z_][a-zA-Z0-9_]*/ },
    { nome: 'VAR_TEXTO', regex: /^@[a-zA-Z_][a-zA-Z0-9_]*/ },
    { nome: 'VAR_BOOLEANO', regex: /^\?[a-zA-Z_][a-zA-Z0-9_]*/ },
    { nome: 'VAR_CHAVE_PIX', regex: /^![a-zA-Z_][a-zA-Z0-9_]*/ },
    { nome: 'VAR_NULO', regex: /^~[a-zA-Z_][a-zA-Z0-9_]*/ },
    { nome: 'DELIMITADOR', regex: /^(\{|\}|\(|\)|::)/ },
    { nome: 'NUMERO', regex: /^\d+(\.\d+)?/ },
    { nome: 'STRING', regex: /^(['"])(?:(?!\1).|\\\1)*\1/ },
    { nome: 'IDENTIFICADOR', regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
    { nome: 'ESPACO_EM_BRANCO', regex: /^\s+/, ignorar: true },
];

function analisadorLexico(codigoFonte) {
    let tokens = [];
    let tabelaRegistros = [];
    let posicao = 0;
    let linha = 1;
    let proximoId = 1;

    const codigoLimpo = codigoFonte.trim();

    if (!codigoLimpo.startsWith("LEDGER") || !codigoLimpo.endsWith("CLOSE")) {
        throw new Error("Erro na estrutura: O código deve começar com LEDGER e terminar com CLOSE.");
    }

    while (posicao < codigoFonte.length) {
        let correspondencia = null;
        const trechoRestante = codigoFonte.slice(posicao);

        for (const { nome, regex, ignorar } of TIPOS_TOKEN) {
            correspondencia = trechoRestante.match(regex);
            if (correspondencia) {
                const lexema = correspondencia[0];
                if (!ignorar) {
                    let valorAtribuido = "-";
                    if (nome.startsWith('VAR_')) {
                        valorAtribuido = lexema.substring(1);
                    } else if (nome === 'NUMERO' || nome === 'STRING') {
                        valorAtribuido = lexema.replace(/['"]/g, "");
                    }

                    const tokenInfo = {
                        id: proximoId++,
                        lexema: lexema,
                        token: `<${nome}>`,
                        valor: valorAtribuido,
                        linha: linha
                    };

                    tokens.push({ nome, valor: lexema, linha });
                    tabelaRegistros.push(tokenInfo);
                }
                posicao += lexema.length;
                linha += (lexema.match(/\n/g) || []).length;
                break;
            }
        }

        if (!correspondencia) {
            const caractereErro = codigoFonte[posicao];
            throw new Error(`Erro léxico na linha ${linha}: caractere inválido '${caractereErro}'`);
        }
    }

    validarSimbolos(tabelaRegistros);

    return { tokens, tabelaRegistros };
}

function validarSimbolos(tabela) {
    let pilha = [];
    const pares = { '}': '{', ')': '(' };

    for (const reg of tabela) {
        const lexema = reg.lexema;
        if (lexema === '{' || lexema === '(') {
            pilha.push({ lexema, linha: reg.linha });
        } else if (lexema === '}' || lexema === ')') {
            if (pilha.length === 0) {
                throw new Error(`O símbolo '${lexema}' na linha ${reg.linha} foi fechado sem ter sido aberto.`);
            }
            const ultimoAberto = pilha.pop();
            if (ultimoAberto.lexema !== pares[lexema]) {
                throw new Error(`Erro de Sintaxe na linha ${reg.linha}: Tentou fechar com '${lexema}', mas o símbolo anterior aberto foi '${ultimoAberto.lexema}' na linha ${ultimoAberto.linha}.`);
            }
        }
    }
    if (pilha.length > 0) {
        const pendente = pilha.pop();
        throw new Error(`Erro de Sintaxe: O símbolo '${pendente.lexema}' aberto na linha ${pendente.linha} não foi fechado até o fim do arquivo.`);
    }
}

const arquivoEntrada = 'Pix.pix';

try {
    const codigo = fs.readFileSync(arquivoEntrada, 'utf8');
    const { tokens, tabelaRegistros } = analisadorLexico(codigo);

    const conteudoPixObj = tokens.map(t => `<${t.nome}, ${t.valor}>`).join('\n');
    fs.writeFileSync('projeto.pixobj', conteudoPixObj);

    const cabecalho = "id;lexema;token;valor\n";
    const linhasCSV = tabelaRegistros.map(r => `${r.id};${r.lexema};${r.token};${r.valor}`).join('\n');
    fs.writeFileSync('tabela_simbolos.csv', cabecalho + linhasCSV);

    console.log("Análise concluída!\n\n Texto lido:\n\n", codigo);

} catch (erro) {
    fs.writeFileSync('erro_lexico.log', erro.message);
    console.error("Erro detectado. Detalhes em erro_lexico.log.");
}