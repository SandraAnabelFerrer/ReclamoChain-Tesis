// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

/**
 * @title ReclamacionesSeguros
 * @dev Contrato inteligente para automatizar reclamaciones de siniestros
 * @author Sistema de Tesis - Automatización Blockchain
 */
contract ReclamacionesSeguros {
    // Estados posibles de una reclamación
    enum EstadoReclamo {
        Creado,
        Validado,
        Aprobado,
        Rechazado,
        Pagado
    }

    // Estructura de datos para una reclamación
    struct Reclamo {
        uint256 siniestroId;
        address solicitante;
        string descripcion;
        uint256 monto;
        EstadoReclamo estado;
        uint256 fechaCreacion;
        uint256 fechaActualizacion;
        address validadoPor;
        address procesadoPor;
        string notasAdmin;
    }

    mapping(uint256 => Reclamo) public reclamos;
    uint256[] public todosLosReclamos;
    address public propietario;
    mapping(address => bool) public administradores;

    // Eventos
    event ReclamoCreado(
        uint256 indexed siniestroId,
        address indexed solicitante,
        string descripcion,
        uint256 monto
    );
    event ReclamoValidado(
        uint256 indexed siniestroId,
        address indexed validadoPor,
        uint256 timestamp
    );
    event ReclamoAprobado(
        uint256 indexed siniestroId,
        address indexed procesadoPor,
        uint256 monto,
        uint256 timestamp
    );
    event ReclamoRechazado(
        uint256 indexed siniestroId,
        address indexed procesadoPor,
        string razon,
        uint256 timestamp
    );
    event ReclamoPagado(
        uint256 indexed siniestroId,
        address indexed beneficiario,
        uint256 monto,
        uint256 timestamp
    );

    // Modificadores
    modifier soloPropietario() {
        require(
            msg.sender == propietario,
            "Solo el propietario puede ejecutar esta funcion"
        );
        _;
    }

    modifier soloAdministrador() {
        require(
            administradores[msg.sender] || msg.sender == propietario,
            "Solo administradores autorizados pueden ejecutar esta funcion"
        );
        _;
    }

    modifier reclamoExiste(uint256 _siniestroId) {
        require(
            reclamos[_siniestroId].siniestroId != 0,
            "El reclamo no existe"
        );
        _;
    }

    // Constructor
    constructor() {
        propietario = msg.sender;
        administradores[msg.sender] = true;
    }

    // Funciones de administración
    function agregarAdministrador(address _admin) external soloPropietario {
        administradores[_admin] = true;
    }

    function removerAdministrador(address _admin) external soloPropietario {
        administradores[_admin] = false;
    }

    // Registrar un nuevo reclamo
    function registrarReclamo(
        uint256 _siniestroId,
        string memory _descripcion,
        uint256 _monto
    ) external {
        require(_siniestroId > 0, "ID de siniestro debe ser mayor a 0");
        require(
            bytes(_descripcion).length > 0,
            "La descripcion no puede estar vacia"
        );
        require(_monto > 0, "El monto debe ser mayor a 0");
        require(
            reclamos[_siniestroId].siniestroId == 0,
            "Ya existe un reclamo con este ID"
        );

        reclamos[_siniestroId] = Reclamo({
            siniestroId: _siniestroId,
            solicitante: msg.sender,
            descripcion: _descripcion,
            monto: _monto,
            estado: EstadoReclamo.Creado,
            fechaCreacion: block.timestamp,
            fechaActualizacion: block.timestamp,
            validadoPor: address(0),
            procesadoPor: address(0),
            notasAdmin: ""
        });

        todosLosReclamos.push(_siniestroId);
        emit ReclamoCreado(_siniestroId, msg.sender, _descripcion, _monto);
    }

    // Validar reclamo
    function validarReclamo(
        uint256 _siniestroId
    ) external soloAdministrador reclamoExiste(_siniestroId) {
        Reclamo storage reclamo = reclamos[_siniestroId];
        require(
            reclamo.estado == EstadoReclamo.Creado,
            "El reclamo ya fue procesado"
        );

        reclamo.estado = EstadoReclamo.Validado;
        reclamo.validadoPor = msg.sender;
        reclamo.fechaActualizacion = block.timestamp;

        emit ReclamoValidado(_siniestroId, msg.sender, block.timestamp);
    }

    // Aprobar reclamo
    function aprobarReclamo(
        uint256 _siniestroId,
        string memory _notas
    ) external soloAdministrador reclamoExiste(_siniestroId) {
        Reclamo storage reclamo = reclamos[_siniestroId];
        require(
            reclamo.estado == EstadoReclamo.Validado,
            "El reclamo debe estar validado para ser aprobado"
        );

        reclamo.estado = EstadoReclamo.Aprobado;
        reclamo.procesadoPor = msg.sender;
        reclamo.notasAdmin = _notas;
        reclamo.fechaActualizacion = block.timestamp;

        emit ReclamoAprobado(
            _siniestroId,
            msg.sender,
            reclamo.monto,
            block.timestamp
        );
    }

    // Rechazar reclamo
    function rechazarReclamo(
        uint256 _siniestroId,
        string memory _razon
    ) external soloAdministrador reclamoExiste(_siniestroId) {
        Reclamo storage reclamo = reclamos[_siniestroId];
        require(
            reclamo.estado == EstadoReclamo.Creado ||
                reclamo.estado == EstadoReclamo.Validado,
            "El reclamo no puede ser rechazado en su estado actual"
        );

        reclamo.estado = EstadoReclamo.Rechazado;
        reclamo.procesadoPor = msg.sender;
        reclamo.notasAdmin = _razon;
        reclamo.fechaActualizacion = block.timestamp;

        emit ReclamoRechazado(
            _siniestroId,
            msg.sender,
            _razon,
            block.timestamp
        );
    }

    // Procesar pago
    function procesarPago(
        uint256 _siniestroId
    ) external payable soloAdministrador reclamoExiste(_siniestroId) {
        Reclamo storage reclamo = reclamos[_siniestroId];
        require(
            reclamo.estado == EstadoReclamo.Aprobado,
            "El reclamo debe estar aprobado"
        );
        require(msg.value >= reclamo.monto, "Monto insuficiente para el pago");

        reclamo.estado = EstadoReclamo.Pagado;
        reclamo.fechaActualizacion = block.timestamp;

        payable(reclamo.solicitante).transfer(reclamo.monto);

        if (msg.value > reclamo.monto) {
            payable(msg.sender).transfer(msg.value - reclamo.monto);
        }

        emit ReclamoPagado(
            _siniestroId,
            reclamo.solicitante,
            reclamo.monto,
            block.timestamp
        );
    }

    // Consultas
    function obtenerReclamo(
        uint256 _siniestroId
    )
        external
        view
        reclamoExiste(_siniestroId)
        returns (
            uint256 siniestroId,
            address solicitante,
            string memory descripcion,
            uint256 monto,
            EstadoReclamo estado,
            uint256 fechaCreacion,
            uint256 fechaActualizacion,
            address validadoPor,
            address procesadoPor,
            string memory notasAdmin
        )
    {
        Reclamo storage reclamo = reclamos[_siniestroId];
        return (
            reclamo.siniestroId,
            reclamo.solicitante,
            reclamo.descripcion,
            reclamo.monto,
            reclamo.estado,
            reclamo.fechaCreacion,
            reclamo.fechaActualizacion,
            reclamo.validadoPor,
            reclamo.procesadoPor,
            reclamo.notasAdmin
        );
    }

    function obtenerTodosLosReclamos()
        external
        view
        returns (uint256[] memory)
    {
        return todosLosReclamos;
    }

    function obtenerTotalReclamos() external view returns (uint256) {
        return todosLosReclamos.length;
    }

    // Funciones de fondos
    receive() external payable {}
    function retirarFondos() external soloPropietario {
        payable(propietario).transfer(address(this).balance);
    }

    function obtenerBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
