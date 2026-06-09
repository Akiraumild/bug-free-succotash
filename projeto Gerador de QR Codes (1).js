import fs from 'fs';
import path from 'path';
import readline from 'readline';
import QRCode from 'qrcode';

// Configuração do diretório de saída para os arquivos PNG
const DIRETORIO_SAIDA = './qrcodes';

/**
 * Cria a interface de leitura do terminal para interagir com o usuário
 */
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Promisificação do readline para permitir o uso de async/await nas perguntas
 * @param {string} interrogacao - A pergunta que será exibida no terminal
 * @returns {Promise<string>} A resposta digitada pelo usuário
 */
const fazerPergunta = (interrogacao) => {
    return new Promise((resolve) => rl.question(interrogacao, resolve));
};

/**
 * Valida se a URL fornecida possui um formato aceitável
 * @param {string} url - URL a ser validada
 * @returns {boolean}
 */
function validarUrl(url) {
    if (!url.trim()) {
        console.log('Erro: A URL não pode estar vazia.');
        return false;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.log('Erro: A URL deve iniciar com http:// ou https://');
        return false;
    }
    return true;
}

/**
 * Trata o nome do arquivo para remover caracteres especiais inválidos
 * @param {string} nome - Nome bruto do arquivo
 * @returns {string} Nome limpo e seguro
 */
function tratarNomeArquivo(nome) {
    const nomeLimpo = nome.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    return nomeLimpo || 'qrcode_produto';
}

/**
 * Função principal que gerencia o fluxo da aplicação no terminal
 */
async function executarGerador() {
    console.log('==================================================');
    console.log('     GERADOR DE QR CODE PARA E-COMMERCE (TERMINAL) ');
    console.log('==================================================\n');

    try {
        // 1. Obtenção e validação da URL do produto
        let urlProduto = '';
        while (!validarUrl(urlProduto)) {
            urlProduto = await fazerPergunta('Digite a URL do produto / página de vendas: ');
        }

        // 2. Obtenção do nome do arquivo
        const nomeBruto = await fazerPergunta('Digite o nome do arquivo para salvar (padrão: qrcode_produto): ');
        const nomeArquivoFinal = tratarNomeArquivo(nomeBruto);

        // 3. Opção de exibição no terminal
        const opcaoTerminal = await fazerPergunta('Deseja renderizar o QR Code no terminal? (s/n): ');
        const mostrarNoTerminal = opcaoTerminal.toLowerCase() === 's' || opcaoTerminal.toLowerCase() === 'sim';

        // Garante a existência da pasta de destino
        if (!fs.existsSync(DIRETORIO_SAIDA)) {
            fs.mkdirSync(DIRETORIO_SAIDA, { recursive: true });
        }

        const caminhoCompletoArquivo = path.join(DIRETORIO_SAIDA, `${nomeArquivoFinal}.png`);

        console.log('\nProcessando dados...');

        // 4. Geração e salvamento do arquivo PNG
        await QRCode.toFile(caminhoCompletoArquivo, urlProduto, {
            color: {
                dark: '#000000',  // Cor dos módulos do QR Code
                light: '#FFFFFF'  // Cor do fundo
            },
            width: 400,           // Dimensão da imagem em pixels
            margin: 4             // Margem de segurança ao redor do código
        });

        console.log('\n--------------------------------------------------');
        console.log('STATUS: QR Code gerado com sucesso!');
        console.log(`Arquivo salvo em: ${caminhoCompletoArquivo}`);
        console.log('--------------------------------------------------\n');

        // 5. Renderização opcional do QR Code diretamente no terminal
        if (mostrarNoTerminal) {
            console.log('Aponte a câmera do celular para o terminal:\n');
            
            const qrTerminal = await QRCode.toString(urlProduto, { 
                type: 'terminal', 
                small: true 
            });
            
            console.log(qrTerminal);
        }

    } catch (erro) {
        console.error('\nOcorreu um erro durante a execução do processo:');
        console.error(erro.message);
    } finally {
        // Fecha a interface do terminal e encerra o script de forma limpa
        rl.close();
        console.log('\nAplicação finalizada.');
    }
}

// Inicia a execução do programa
executarGerador();