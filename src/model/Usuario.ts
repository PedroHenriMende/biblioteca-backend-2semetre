import { DataBaseModel } from "./DataBaseModel";

// Recupera conexão com o banco de dados
const database = new DataBaseModel().pool;

export class Usuario {
    private idUsuario: number = 0;
    private uuidUsuario: string = '';
    private nome: string;
    private username: string;
    private email: string;
    private senha: string = '';

    constructor(
        _nome: string,
        _username: string,
        _email: string
    ) {
        this.nome = _nome;
        this.username = _username;
        this.email = _email;
    }

    public getIdUsuario(): number {
        return this.idUsuario;
    }

    public setIdUsuario(idUsuario: number): void {
        this.idUsuario = idUsuario;
    }

    public getUuidUsuario(): string {
        return this.uuidUsuario;
    }

    public setUuidUsuario(uuidUsuario: string): void {
        this.uuidUsuario = uuidUsuario;
    }

    public getNome(): string {
        return this.nome;
    }

    public setNome(nome: string): void {
        this.nome = nome;
    }

    public getUsername(): string {
        return this.username;
    }

    public setUsername(username: string): void {
        this.username = username;
    }

    public getEmail(): string {
        return this.email;
    }

    public setEmail(email: string): void {
        this.email = email;
    }

    public getSenha(): string {
        return this.senha;
    }

    public setSenha(senha: string): void {
        this.senha = senha;
    }

    static async listarUsuarios(): Promise<Array<Usuario> | null> {
        let listaDeUsuarios: Array<Usuario> = [];

        try {
            const querySelectUsuarios = `SELECT * FROM usuario`;

            const respostaBD = await database.query(querySelectUsuarios);

            respostaBD.rows.forEach((usuario) => {
                let novoUsuario = new Usuario(
                    usuario.nome,
                    usuario.username,
                    usuario.email
                );

                novoUsuario.setIdUsuario(usuario.id_usuario);
                novoUsuario.setUuidUsuario(usuario.uuid);

                listaDeUsuarios.push(novoUsuario);
            });

            return listaDeUsuarios;
        } catch (error) {
            console.log(`Erro ao recuperar usuários. ${error}`);
            return null;
        }
    }
}