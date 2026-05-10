export class WSocketServices {
    constructor() {
    }
    // --- Inicializar SignalR ---
    static async InitSignalR(manager, action, signalName = "chatHub") {

        // @ts-ignore
        if (manager.hubStarted || !window.signalR) return;

        // @ts-ignore
        const { HubConnectionBuilder } = window.signalR;

        manager.connection = new HubConnectionBuilder()
            .withUrl("/" + signalName, {
                accessTokenFactory: () => localStorage.getItem("token") || null
            })
            .withAutomaticReconnect()
            .build();

        // Escuchar mensajes nuevos
        manager.connection.on("ReadSignal", (mensaje) => {
            if (action) {
                action(mensaje)
            }
        });

        // Confirmación de envío
        /*this.connection.on("MensajeEnviado", (mensaje) => {
            this.Dataset = [...this.Dataset, mensaje];
            this.DrawWCommentsComponent();
            this.scrollToBottom();
        });*/

        // Manejar errores
        manager.connection.on("Error", (error) => {
            console.error("Error SignalR:", error);
        });

        try {
            await manager.connection.start();
            console.log("SignalR conectado");
            manager.hubStarted = true;
        } catch (err) {
            console.error("Error al conectar SignalR:", err);
        }
    }

    // 🔥 Nuevo método para desconectar
    static async StopSignalR(manager) {
        if (manager?.connection) {
            try {
                await manager.connection.stop();
                console.log("SignalR desconectado");
            } catch (err) {
                console.error("Error al desconectar SignalR:", err);
            }
        }

        manager.hubStarted = false;
        manager.connection = null;
    }
}