/**
 * Importa a classe Aluno do modelo e os tipos Request e Response do Express.
 */
import { Aluno } from "../model/Aluno";
import { Request, Response } from "express";

/**
 * Interface AlunoDTO
 * Define os atributos que devem ser recebidos do cliente nas requisições.
 */
interface AlunoDTO {
    nome: string;
    sobrenome: string;
    dataNascimento?: Date;
    endereco?: string;
    email: string;
    celular: string;
}

/**
 * Controlador para operações relacionadas aos alunos.
 * Estende a classe Aluno para reaproveitar funcionalidades.
 */
class AlunoController extends Aluno {

    /**
     * Lista todos os alunos cadastrados no sistema.
     * @param req Objeto de requisição HTTP.
     * @param res Objeto de resposta HTTP.
     * @returns Lista de alunos em formato JSON.
     */
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            // Recupera a lista de alunos cadastrados no sistema chamando o método "listarAlunos" da classe Aluno.
            const listaDeAlunos = await Aluno.listarAlunos();

            // Retorna a lista de alunos como uma resposta JSON com status 200 (OK).
            // O código HTTP 200 indica que a operação foi bem-sucedida.
            return res.status(200).json(listaDeAlunos);
        } catch (error) {
            // Caso ocorra um erro durante o processo (por exemplo, erro de banco de dados ou falha no método "listarAlunos"),
            // o erro é registrado no console para que os desenvolvedores possam analisar o problema.
            console.log(`Erro ao acessar método herdado: ${error}`);

            // Retorna uma resposta com status 500 (erro interno do servidor), indicando que algo deu errado ao tentar recuperar os dados.
            // A mensagem informada ao cliente sugere que entre em contato com o administrador do sistema para mais informações.
            return res.status(500).json({ mensagem: "Erro ao recuperar as informações do aluno. Entre em contato com o administrador do sistema para mais detalhes." });
        }
    }


    /**
     * Cadastra um novo aluno no sistema.
     * @param req Objeto de requisição HTTP com os dados do aluno.
     * @param res Objeto de resposta HTTP.
     * @returns Mensagem de sucesso ou erro em formato JSON.
     */
    static async cadastrar(req: Request, res: Response): Promise<Response> {
        try {
            // Obtém os dados enviados pelo cliente através do corpo da requisição (req.body)
            const dadosRecebidos: AlunoDTO = req.body;

            // Verifica se os campos obrigatórios foram preenchidos (nome, sobrenome, email e celular)
            // Se algum desses campos não for informado, retorna um erro com status 406 (Not Acceptable)
            if (!dadosRecebidos.nome || !dadosRecebidos.sobrenome || !dadosRecebidos.email || !dadosRecebidos.celular) {
                console.log("Parâmetros obrigatórios não informados");
                return res.status(406).json({ mensagem: "Parâmetros obrigatórios não informados." });
            }

            // Cria um novo objeto da classe Aluno com os dados recebidos do cliente
            // Caso algum campo como dataNascimento ou endereço não seja informado, valores padrão são usados
            const novoAluno = new Aluno(
                dadosRecebidos.nome,        // Nome do aluno
                dadosRecebidos.sobrenome,   // Sobrenome do aluno
                dadosRecebidos.dataNascimento ?? new Date("1900-01-01"), // Se não houver data de nascimento, usa uma data padrão
                dadosRecebidos.endereco ?? '', // Se não houver endereço, usa uma string vazia
                dadosRecebidos.email ?? '', // Se não houver email, usa uma string vazia
                dadosRecebidos.celular  // Celular do aluno
            );

            // Chama o método "cadastrarAluno" da classe Aluno para salvar o novo aluno no banco de dados
            const result = await Aluno.cadastrarAluno(novoAluno);

            // Define um objeto com as mensagens de resposta para diferentes resultados
            // O objeto "mensagens" armazena o status e a mensagem a ser retornada para cada caso possível (0, 1, 9)
            const mensagens: Record<number, { status: number; mensagem: string }> = {
                0: { status: 400, mensagem: 'Erro ao cadastrar aluno. Entre em contato com o administrador do sistema para mais detalhes.' },
                1: { status: 201, mensagem: 'Aluno cadastrado com sucesso!' },
                9: { status: 406, mensagem: 'Parâmetros obrigatórios não informados.' }
            };

            // Baseado no resultado do cadastro, seleciona a resposta correspondente
            // Se o resultado não for um valor conhecido (0, 1, 9), a resposta padrão será a do caso 0
            const resposta = mensagens[result] ?? mensagens[0];

            // Retorna a resposta com o código de status e a mensagem apropriada
            return res.status(resposta.status).json({ mensagem: resposta.mensagem });
        } catch (error) {
            // Caso ocorra um erro durante o processo, o erro é registrado no console para depuração
            console.log(`Erro ao cadastrar o aluno: ${error}`);

            // Retorna uma resposta de erro para o cliente com status 500 (erro interno)
            return res.status(500).json({ mensagem: 'Erro ao cadastrar o aluno. Entre em contato com o administrador do sistema para mais detalhes.' });
        }
    }


    /**
     * Remove um aluno do sistema.
     * @param req Objeto de requisição HTTP com o ID do aluno a ser removido.
     * @param res Objeto de resposta HTTP.
     * @returns Mensagem de sucesso ou erro em formato JSON.
     */
    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            // Obtém o ID do aluno da query string (parâmetro na URL)
            // O ID é passado pela URL e convertido para um número inteiro usando parseInt
            const idAluno = parseInt(req.query.idAluno as string);

            // Chama o método estático "removerAluno" da classe Aluno para tentar remover o aluno do banco de dados
            // O resultado pode ser 0 (erro), 1 (sucesso) ou 9 (aluno não encontrado)
            const result = await Aluno.removerAluno(idAluno);

            // Retorna uma resposta baseada no resultado da operação
            switch (result) {
                case 0:
                    // Caso o resultado seja 0, indica que houve um erro ao tentar remover o aluno
                    // Retorna o status 400 (erro) e uma mensagem de erro em formato JSON
                    return res.status(400).json('Erro ao deletar aluno. Entre em contato com o administrador do sistema para mais detalhes.');
                case 1:
                    // Caso o resultado seja 1, significa que o aluno foi removido com sucesso
                    // Retorna o status 200 (sucesso) e uma mensagem de sucesso em formato JSON
                    return res.status(200).json('Aluno removido com sucesso.');
                case 9:
                    // Caso o resultado seja 9, significa que o aluno não foi encontrado no banco de dados
                    // Retorna o status 400 e uma mensagem indicando que o aluno não foi encontrado
                    return res.status(400).json('Aluno não encontrado.');
                default:
                    // Se o resultado não for nenhum dos casos anteriores, retorna uma mensagem genérica de erro
                    return res.status(400).json('Erro ao deletar aluno. Entre em contato com o administrador do sistema para mais detalhes.');
            }
        } catch (error) {
            // Se ocorrer um erro durante a execução do código, ele será capturado aqui
            // O erro é registrado no console para fins de depuração
            console.log(`Erro ao remover aluno: ${error}`);

            // Retorna uma resposta de erro com o status 500, indicando erro interno no servidor
            // A mensagem solicitada será enviada para o cliente
            return res.status(500).send("Erro ao remover aluno. Entre em contato com o administrador do sistema para mais detalhes.");
        }
    }


    /**
     * Atualiza os dados de um aluno existente.
     * @param req Objeto de requisição do Express, contendo os dados atualizados do aluno.
     * @param res Objeto de resposta do Express.
     * @returns Retorna uma resposta HTTP indicando sucesso ou falha na atualização.
     */
    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            // Obtém os dados enviados pelo cliente no corpo da requisição
            // O tipo de dado esperado é o AlunoDTO, que contém informações do aluno a ser atualizado
            const dadosRecebidos: AlunoDTO = req.body;

            // Cria um novo objeto Aluno utilizando os dados recebidos na requisição
            // Caso algum dado não seja informado, são usados valores padrão
            const aluno = new Aluno(
                dadosRecebidos.nome,                    // Nome do aluno
                dadosRecebidos.sobrenome,               // Sobrenome do aluno
                dadosRecebidos.dataNascimento ?? new Date('1900-01-01'), // Data de nascimento, com valor padrão se não informado
                dadosRecebidos.endereco ?? '',          // Endereço, com valor padrão se não informado
                dadosRecebidos.email,                   // E-mail do aluno
                dadosRecebidos.celular                  // Número de celular
            );

            // Define o ID do aluno a ser atualizado, que é obtido a partir da query string na URL
            // O ID é passado como um parâmetro na URL, então é necessário fazer o parse de string para número
            aluno.setIdAluno(parseInt(req.query.idAluno as string));

            // Chama o método estático "atualizarAluno" da classe Aluno para tentar atualizar os dados no banco
            // O resultado retornado pode ser 1 (sucesso) ou outro valor em caso de falha
            const result = await Aluno.atualizarAluno(aluno);

            // Retorna a resposta HTTP com o status apropriado e uma mensagem indicando o sucesso ou falha da operação
            // Se o resultado for 1, significa que a atualização foi bem-sucedida, então retornamos o status 200
            // Caso contrário, retornamos o status 400, indicando erro na atualização
            return res.status(result === 1 ? 200 : 400).json({ mensagem: result === 1 ? 'Aluno atualizado com sucesso!' : 'Erro ao atualizar aluno.' });
        } catch (error) {
            // Caso ocorra algum erro durante a execução da função, o erro será capturado aqui
            // O erro será logado no console para auxiliar na depuração
            console.error(`Erro ao atualizar aluno: ${error}`);

            // Retorna uma resposta HTTP com status 500, indicando erro interno do servidor
            // E uma mensagem genérica de erro ao cliente, pedindo para entrar em contato com o administrador do sistema
            return res.status(500).json({ mensagem: "Erro ao atualizar aluno. Entre em contato com o administrador do sistema para mais detalhes." });
        }
    }
}

// Exporta a classe para ser utilizada em outras partes do sistema
export default AlunoController;
