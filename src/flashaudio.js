FlashAudio = function(createNode, onSuccess, onReject, audioCtx, microphone) {
    //special variables
    self = this;
    this.microphone = microphone;
    this.bufferLength = 2048;
    this.conversionNumber = 27647; //mysterious conversion number
    this.execCallbacks = true;
    this.status = "no status";
    this.audioBuffer = audioCtx.createBuffer(1, this.bufferLength, audioCtx.sampleRate);
    this.webAudioNode;


    //callback function to be executed when Microphone is accepted
    this.createWebAudioNode = function() {
        // create buffer source node with audioContext
        self.webAudioNode = microphone.webAudioNode = audioCtx.createBufferSource();

        //init Buffer (gets filled on the MicrophoneF.ondata event)
        self.webAudioNode.buffer = self.audioBuffer;

        //little trick, that needs to be done: set self.webAudioNode on loop, so it is played permanently (with different buffer content of course)
        self.webAudioNode.loop = true;

        //start "playing" the bufferSource
        self.webAudioNode.start(0);
    }

    this.load(createNode, onSuccess, onReject);
}

FlashAudio.prototype = new AudioResource;


_.extend(FlashAudio.prototype, {
    constructor: FlashAudio,

    load: function(createNode, onSuccess, onReject) {
        var self = this;

        // init flash lib / wrapper
        MicrophoneF.initialize();

        MicrophoneF.onready(function() {

            //enable microphone
            setTimeout(MicrophoneF.enable, 500);

            //define onData handler
            MicrophoneF.ondata(function(data) {
                // convert data
                var output = self.audioBuffer.getChannelData(0);
                for (var i = self.bufferLength - 1; i >= 0; i--) {
                    var floaty = (data.charCodeAt(i) - (self.conversionNumber)) / (self.conversionNumber);
                    if (isNaN(floaty)) floaty = 0;
                    output[i] = floaty;
                };

                //execute callbacks, which were passed
                if (self.execCallbacks) {
                    createNode();
                    onSuccess();

                    self.execCallbacks = false;
                }
            });

        });

    },

    // returns Audio Buffer
    getBuffer: function() {
        return this.audioBuffer;
    },

    // returns Status of Audioresource
    // unloaded - loading - ready - error - noSound 
    getStatus: function() {
        return this.status;
    },

    // mutes the Audio Input
    mute: function() {
        var self = this;
        //redefine ondata handler
        MicrophoneF.ondata(function(data) {
            // set all values in buffer to zero
            for (var i = self.bufferLength - 1; i >= 0; i--) {
                self.audioBuffer[i] = 0;
            };
        });
    },

    //unmutes the Audio Input
    unmute: function() {
        var self = this;
        //redefine ondata handler
        MicrophoneF.ondata(function(data) {
            // convert data
            for (var i = self.bufferLength - 1; i >= 0; i--) {
                var floaty = (data.charCodeAt(i) - (self.conversionNumber)) / (self.conversionNumber);
                if (isNaN(floaty)) floaty = 0;
                self.audioBuffer[i] = floaty;
            };
        });
    },

    // disable microphone entirely
    disable: function() {
        MicrophoneF.disable();
    }
})