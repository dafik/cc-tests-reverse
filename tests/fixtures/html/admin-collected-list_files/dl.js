var dListener = new EventEmitter2();

$.extend(dListener, {
    socket: undefined,
    manager: undefined,
    sip: undefined,
    managerInitialized: false,
    socketInitialized: false,
    start: function (sip) {
        if (typeof(this.socket) == "undefined") {
            this.sip = sip || frm.dialer._sip;
            this.socket = io('pbx:2233');
            this.manager = this.socket.io;
        } else {
            this.socket.open();
        }

        !this.managerInitialized ? this.initManager() : '';
        !this.socketInitialized ? this.initSocket() : '';

    },
    stop: function () {
        if (typeof this.socket != "undefined" && this.socket.connected) {
            var that = this;
            this.socket.emit(this.Events.unsubscribe, this.sip, onSocketUnsubscribe);
            function onSocketUnsubscribe() {
                that.socket.disconnect();
            }
        }
    },
    initSocket: function () {
        var that = this;
        this.socket.on('connect', onSocketConnect);
        function onSocketConnect() {
            that.socket.emit(that.Events.subscribe, that.sip);
            console.log('Socket - Fired upon connecting.')
        }

        this.socket.on('disconnect', onSocketDisconnect);
        function onSocketDisconnect() {
            console.log('Socket - Fired upon a disconnection')
        }

        this.socket.on('error', onSocketError);
        function onSocketError(error) {
            console.log('Socket - Fired upon a connection error')
        }

        this.socket.on('reconnect', onSocketReconnect);
        function onSocketReconnect(reconnectionNumber) {
            console.log('Socket - Fired upon a successful reconnection')
        }

        this.socket.on('reconnect_attempt', onSocketReconnectAttempt);
        function onSocketReconnectAttempt() {
            console.log('Socket - Fired upon an attempt to reconnect')
        }

        this.socket.on('reconnecting', onSocketReconnecting);
        function onSocketReconnecting(reconnectionNumber) {
            console.log('Socket - Fired upon an attempt to reconnect')
        }

        this.socket.on('reconnect_error', onSocketReconnectError);
        function onSocketReconnectError(error) {
            console.log('Socket - Fired upon a reconnection attempt error')
        }

        this.socket.on('reconnect_failed', onSocketReconnectFailed);
        function onSocketReconnectFailed() {
            console.log('Socket - Fired when couldn’t reconnect within reconnectionAttempts')
        }

        this.socket.on(that.Events.newClient, onNewClientId);

        function onNewClientId(data, callback) {
            console.log('Socket - newClient:' + data);
            //przekierowanie
            that.emit(that.Events.newClient, data, function () {
                callback();
            })

        }

        this.socketInitialized = true;
    },
    initManager: function () {
        var manager = this.socket.io;

        manager.on('close', onManagerClose);
        function onManagerClose() {
            console.log('Manager - close ?.')
        }

        manager.on('connect', onManagerConnect);
        function onManagerConnect() {
            console.log('Manager - Fired upon a successful connection.')
        }


        manager.on('connect_error', onManagerConnectError);
        /**
         * @param {{}} error
         */
        function onManagerConnectError(error) {
            console.log('Manager - Fired upon a connection error.')
        }


        manager.on('connect_timeout', onManagerConnectTimeout);
        function onManagerConnectTimeout() {
            console.log('Manager - Fired upon a connection timeout.')
        }

        manager.on('open', onManagerOpen);
        function onManagerOpen() {
            console.log('Manager - open ?.')
        }

        manager.on('packet', onManagerPacket);
        function onManagerPacket() {
            console.log('Manager - packet ?.')
        }


        manager.on('reconnect', onManagerReconnect);
        /**
         * @param {Number} reconnectionNubmer
         */
        function onManagerReconnect(reconnectionNubmer) {
            console.log('Manager - Fired upon a successful reconnection.')
        }


        manager.on('reconnect_attempt', onManagerReconnectAttempt);
        function onManagerReconnectAttempt() {
            console.log('Manager - Fired upon an attempt to reconnect.')
        }

        /**
         * @param {Number} reconnectionNubmer
         */
        manager.on('reconnecting', onManagerReconnecting);
        function onManagerReconnecting(reconnectionNubmer) {
            console.log('Manager - Fired upon an attempt to reconnect.')
        }

        /**
         * @param {{}} error
         */
        manager.on('reconnect_error', onManagerReconnectError);
        function onManagerReconnectError(error) {
            console.log('Manager - Fired upon a reconnection attempt error.')
        }


        manager.on('reconnect_failed', onManagerReconnectFailed);
        function onManagerReconnectFailed() {
            console.log('Manager - Fired when couldn’t reconnect within reconnectionAttempts')
        }

        this.managerInitialized = true;
    },
    Events: {
        subscribe: 'subscribe',
        unsubscribe: 'unsubscribe',
        newClient: 'new_client',
        socketAck: 'socket_ack'
    }
});
