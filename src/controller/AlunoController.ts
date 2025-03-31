import { Aluno } from "../model/Aluno";
import { Request, Response } from "express";

/**
 * Interface AlunoDTO
 * Define os atributos que devem ser recebidos do cliente nas requisições
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
 */
class AlunoController extends Aluno {

    /**
     * Lista todos os alunos.
     * @param req Objeto de requisição HTTP.
     * @param res Objeto de resposta HTTP.
     * @returns Lista de alunos em formato JSON.
     */
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            // recupera a lista de alunos do sistema
            const listaDeAlunos = await Aluno.listarAlunos();

            // retorna a lista de aluno no formato JSON
            return res.status(200).json(listaDeAlunos);
        } catch (error) {
            // lança detalhes do erro no console
            console.log(`Erro ao acessar método herdado: ${error}`);

            // retorna uma mensagem de erro ao cliente
            return res.status(400).json({ mensagem: "Erro ao recuperar as informações do aluno. Entre em contato com o administrador do sistema para mais detalhes." });
        }
    }

    /**
      * Cadastra um novo aluno.
      * @param req Objeto de requisição HTTP com os dados do aluno.
      * @param res Objeto de resposta HTTP.
      * @returns Mensagem de sucesso ou erro em formato JSON.
      */
    static async cadastrar(req: Request, res: Response): Promise<Response> {
        try {
            // Desestruturando objeto recebido pelo front-end
            const dadosRecebidos: AlunoDTO = req.body;

            if (!dadosRecebidos.nome || !dadosRecebidos.sobrenome || !dadosRecebidos.email || !dadosRecebidos.celular) {
                console.log("Parâmetros obrigatórios não informados");
                return res.status(406).json({ mensagem: "Parâmetros obrigatórios não informados." });
            }

            // Instanciando objeto Aluno
            const novoAluno = new Aluno(
                dadosRecebidos.nome,
                dadosRecebidos.sobrenome,
                dadosRecebidos.dataNascimento ?? new Date("1900-01-01"),
                dadosRecebidos.endereco ?? '',
                dadosRecebidos.email ?? '',
                dadosRecebidos.celular
            );

            // Chama o método para persistir o aluno no banco de dados
            const result = await Aluno.cadastrarAluno(novoAluno);

            // Define um tipo para os possíveis retornos
            const mensagens: Record<number, { status: number; mensagem: string }> = {
                0: { status: 400, mensagem: 'Erro ao cadastrar aluno. Entre em contato com o administrador do sistema para mais detalhes.' },
                1: { status: 201, mensagem: 'Aluno cadastrado com sucesso!' },
                9: { status: 406, mensagem: 'Parâmetros obrigatórios não informados.' }
            };

            // Retorna a resposta com base no resultado, ou erro genérico caso o código não seja reconhecido
            const resposta = mensagens[result] ?? mensagens[0];
            return res.status(resposta.status).json({ mensagem: resposta.mensagem });
        } catch (error) {
            // lança detalhes do erro no console
            console.log(`Erro ao cadastrar o aluno: ${error}`);
            // retorna mensagem de erro ao cliente
            return res.status(400).json({ mensagem: 'Erro ao cadastrar o aluno. Entre em contato com o administrador do sistema para mais detalhes.' });
        }
    }

    /**
     * Remove um aluno.
     * @param req Objeto de requisição HTTP com o ID do aluno a ser removido.
     * @param res Objeto de resposta HTTP.
     * @returns Mensagem de sucesso ou erro em formato JSON.
     */
    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idAluno = parseInt(req.query.idAluno as string);
            const result = await Aluno.removerAluno(idAluno);

            switch (result) {
                case 0:
                    return res.status(400).json('Erro ao deletar aluno. Entre em contato com o administrador do sistema para mais detalhes.');
                case 1:
                    return res.status(200).json('Aluno removido com sucesso.');
                case 9:
                    return res.status(400).json('Aluno não encontrado.');
                default:
                    return res.status(400).json('Erro ao deletar aluno. Entre em contato com o administrador do sistema para mais detalhes.');
            }
        } catch (error) {
            console.log("Erro ao remover o Aluno");
            console.log(error);
            return res.status(500).send("error");
        }
    }

    /**
     * Método para atualizar o cadastro de um aluno.
     * 
     * @param req Objeto de requisição do Express, contendo os dados atualizados do aluno
     * @param res Objeto de resposta do Express
     * @returns Retorna uma resposta HTTP indicando sucesso ou falha na atualização
     */
    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            // Desestruturando objeto recebido pelo front-end
            const dadosRecebidos: AlunoDTO = req.body;

            // Instanciando objeto Aluno
            const aluno = new Aluno(
                dadosRecebidos.nome,
                dadosRecebidos.sobrenome,
                dadosRecebidos.dataNascimento ?? new Date('1900-01-01'),
                dadosRecebidos.endereco ?? '',
                dadosRecebidos.email,
                dadosRecebidos.celular
            );

            // Define o ID do aluno, que deve ser passado na query string
            aluno.setIdAluno(parseInt(req.query.idAluno as string));

            const result = await Aluno.atualizarAluno(aluno);

            switch (result) {
                case 0:
                    return res.status(400).json({ mensagem: 'Erro ao atualizar aluno. Entre em contato com o administrador do sistema para mais detalhes.' });
                case 1:
                    return res.status(201).json({ mensagem: 'Aluno atualizado com sucesso!' });
                case 9:
                    return res.status(406).json({ mensagem: 'Aluno não encontrado.' });
                default:
                    return res.status(400).json({ mensagem: 'Erro ao atualizar aluno. Entre em contato com o administrador do sistema para mais detalhes.' });
            }
        } catch (error) {
            // Caso ocorra algum erro, este é registrado nos logs do servidor
            console.error(`Erro no modelo: ${error}`);
            // Retorna uma resposta com uma mensagem de erro
            return res.json({ mensagem: "Erro ao atualizar aluno." });
        }
    }
}

export default AlunoController;