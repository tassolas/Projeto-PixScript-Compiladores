const fs = require('fs');

const TIPOS_TOKEN = [
    { nome: 'PALAVRA_CHAVE', regex: /^(LEDGER|CLOSE|LET|IF|TRUE|FALSE)\b/ },
    { nome: 'SAIDA_TEXTO', regex: /^\$>/ },
    { nome: 'OP_RELACIONAL', regex: /^(==|!=|>>|<<|>=|<=)/ },
    { nome: 'ATRIBUICAO', regex: /^(=|<-)/ },
    { nome: 'OP_ARITMETICO', regex: /^(\+\+|--|\*\*|\/\/|%%)/ },
    { nome: 'OP_LOGICO', regex: /^(&&|\|\||!!)/ },
    { nome: 'TIPO_DECIMAL', regex: /^\$/ },
    { nome: 'TIPO_INTEIRO', regex: /^#/ },
    { nome: 'TIPO_TEXTO', regex: /^@/ },
    { nome: 'TIPO_BOOLEANO', regex: /^\?/ },
    { nome: 'TIPO_CHAVE_PIX', regex: /^!/ },
    { nome: 'TIPO_NULO', regex: /^~/ },
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

    while (posicao < codigoFonte.length) {
        let correspondencia = null;
        const trechoRestante = codigoFonte.slice(posicao);

        for (const { nome, regex, ignorar } of TIPOS_TOKEN) {
            correspondencia = trechoRestante.match(regex);
            if (correspondencia) {
                const lexema = correspondencia[0];
                if (!ignorar) {
                    let valorAtribuido = "-";
                    if (nome === 'NUMERO' || nome === 'STRING') {
                        valorAtribuido = lexema.replace(/['"]/g, "");
                    }

                    const tokenInfo = {
                        id: proximoId++,
                        lexema: lexema,
                        token: `<${nome}>`,
                        valor: valorAtribuido
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
            const mensagemErro = `Erro léxico na linha ${linha}: caractere inválido '${caractereErro}'`;
            throw new Error(mensagemErro);
        }
    }
    return { tokens, tabelaRegistros };
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