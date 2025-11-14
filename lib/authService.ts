import type { Collection, Db } from "mongodb";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../mongodb";
import type {
    CrearUsuarioDTO,
    LoginDTO,
    UsuarioDB,
    RolUsuario,
} from "../models/usuario";

/**
 * Servicio para gestionar autenticación y usuarios
 */
export class AuthService {
    private db: Db | null = null;
    private collection: Collection<UsuarioDB> | null = null;

    /**
     * Inicializar la conexión a la base de datos
     */
    public async init(): Promise<void> {
        if (!this.db) {
            this.db = await connectToDatabase();
            this.collection = this.db.collection<UsuarioDB>("usuarios");

            // Crear índices
            await this.crearIndices();
        }
    }

    /**
     * Crear índices en la colección
     */
    private async crearIndices(): Promise<void> {
        if (!this.collection) return;

        try {
            // Índice único en email
            await this.collection.createIndex({ email: 1 }, { unique: true });
            // Índice en direccionWallet si existe
            await this.collection.createIndex(
                { direccionWallet: 1 },
                { sparse: true }
            );
        } catch (error) {
            console.error("Error creando índices de usuarios:", error);
        }
    }

    /**
     * Crear un nuevo usuario
     */
    async crearUsuario(datos: CrearUsuarioDTO): Promise<UsuarioDB> {
        await this.init();

        // Verificar si el email ya existe
        const usuarioExistente = await this.collection!.findOne({
            email: datos.email,
        });

        if (usuarioExistente) {
            throw new Error("El email ya está registrado");
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(datos.password, 10);

        const nuevoUsuario: UsuarioDB = {
            email: datos.email,
            password: passwordHash,
            nombre: datos.nombre,
            // Normalizar dirección wallet a minúsculas si se proporciona
            direccionWallet: datos.direccionWallet?.toLowerCase(),
            rol: datos.rol,
            activo: true,
            fechaCreacion: new Date(),
        };

        const resultado = await this.collection!.insertOne(nuevoUsuario);
        nuevoUsuario._id = resultado.insertedId;

        return nuevoUsuario;
    }

    /**
     * Autenticar usuario (login)
     */
    async login(credenciales: LoginDTO): Promise<UsuarioDB | null> {
        await this.init();

        // Buscar usuario por email
        const usuario = await this.collection!.findOne({
            email: credenciales.email,
            activo: true,
        });

        if (!usuario) {
            return null;
        }

        // Verificar contraseña
        const passwordValida = await bcrypt.compare(
            credenciales.password,
            usuario.password
        );

        if (!passwordValida) {
            return null;
        }

        // Actualizar fecha de último acceso
        await this.collection!.updateOne(
            { _id: usuario._id },
            { $set: { fechaUltimoAcceso: new Date() } }
        );

        // No devolver la contraseña
        const { password, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword as UsuarioDB;
    }

    /**
     * Obtener usuario por ID
     */
    async obtenerUsuarioPorId(id: string): Promise<UsuarioDB | null> {
        await this.init();
        const { ObjectId } = await import("mongodb");
        return await this.collection!.findOne({
            _id: new ObjectId(id),
            activo: true,
        });
    }

    /**
     * Obtener usuario por email
     */
    async obtenerUsuarioPorEmail(email: string): Promise<UsuarioDB | null> {
        await this.init();
        return await this.collection!.findOne({
            email: email,
            activo: true,
        });
    }

    /**
     * Obtener usuario por dirección de wallet
     */
    async obtenerUsuarioPorWallet(
        direccionWallet: string
    ): Promise<UsuarioDB | null> {
        await this.init();
        return await this.collection!.findOne({
            direccionWallet: direccionWallet.toLowerCase(),
            activo: true,
        });
    }

    /**
     * Verificar si un usuario tiene un rol específico
     */
    async tieneRol(usuarioId: string, rol: RolUsuario): Promise<boolean> {
        const usuario = await this.obtenerUsuarioPorId(usuarioId);
        return usuario?.rol === rol;
    }

    /**
     * Actualizar dirección de wallet del usuario
     */
    async actualizarWallet(
        usuarioId: string,
        direccionWallet: string
    ): Promise<boolean> {
        await this.init();
        const { ObjectId } = await import("mongodb");
        const resultado = await this.collection!.updateOne(
            { _id: new ObjectId(usuarioId) },
            { $set: { direccionWallet: direccionWallet.toLowerCase() } }
        );
        return resultado.modifiedCount > 0;
    }

    /**
     * Obtener todos los usuarios (sin contraseñas)
     */
    async obtenerTodosLosUsuarios(): Promise<Omit<UsuarioDB, "password">[]> {
        await this.init();
        const usuarios = await this.collection!
            .find({})
            .sort({ fechaCreacion: -1 })
            .toArray();

        // Remover contraseñas
        return usuarios.map(({ password, ...usuario }) => usuario);
    }

    /**
     * Desactivar/Activar usuario
     */
    async cambiarEstadoUsuario(
        usuarioId: string,
        activo: boolean
    ): Promise<boolean> {
        await this.init();
        const { ObjectId } = await import("mongodb");
        const resultado = await this.collection!.updateOne(
            { _id: new ObjectId(usuarioId) },
            { $set: { activo } }
        );
        return resultado.modifiedCount > 0;
    }
}

// Instancia singleton del servicio
export const authService = new AuthService();

