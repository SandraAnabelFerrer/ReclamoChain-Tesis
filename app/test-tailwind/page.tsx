export default function TestTailwindPage() {
    return (
        <div className="min-h-screen bg-blue-500 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Prueba de Tailwind CSS
                </h1>
                <p className="text-gray-600 mb-4">
                    Si ves este texto con estilos, Tailwind CSS está funcionando
                    correctamente.
                </p>
                <div className="space-y-2">
                    <div className="bg-red-500 text-white p-2 rounded">
                        Fondo rojo
                    </div>
                    <div className="bg-green-500 text-white p-2 rounded">
                        Fondo verde
                    </div>
                    <div className="bg-blue-500 text-white p-2 rounded">
                        Fondo azul
                    </div>
                </div>
            </div>
        </div>
    );
}
