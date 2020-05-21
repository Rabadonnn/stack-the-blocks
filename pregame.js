let config = require("visual-config-exposer").default;

let buttonStyle = {
    width: "60%",
    height: "15%",
    borderRadius: "20px",
    fontSize: "180%",
    backgroundColor: config.preGameScreen.buttonColor,
    color: config.preGameScreen.buttonTextColor,
    border: "none",
    outline: "none",
    marginBottom: "10px"
};

let playButton = React.createElement("button", {
    onClick: () => {
        window.setScreen("gameScreen");
        window.restartGame();
    },
    id: "button",
    style: buttonStyle
}, config.preGameScreen.playButtonText);

let leaderboardButton;
let soundButton;

if (config.preGameScreen.showLeaderboardButton) {
    leaderboardButton = React.createElement("button", {
        onClick: () => {

        },
        id: "button",
        style: buttonStyle
    }, config.preGameScreen.leaderboardButtonText);
}

class SoundButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            src: config.preGameScreen.soundEnabledIcon
        };
    }

    render() {
        return React.createElement("img", {
            src: this.state.src,
            onClick: () => {
                window.soundEnabled = !window.soundEnabled;
                this.setState({src: window.soundEnabled ? config.preGameScreen.soundEnabledIcon : config.preGameScreen.soundDisabledIcon});
            },
            id: "button",
            style: {
                maxWidth: "40px",
                maxHeight: "40px",
                position: "absolute",
                bottom: 0,
                right: 0,
                marginRight: "15px",
                marginBottom: "15px",
                objectFit: "contain"
            }
        });
    }
}

if (config.preGameScreen.showSoundButton) {
    soundButton =  React.createElement(SoundButton);
}

let titleText = React.createElement("h1", {
    style: {
        fontSize: config.preGameScreen.titleTextSize + "px",
        marginBottom: "20px"
    }
}, config.preGameScreen.titleText);

let titleImage = React.createElement("img", {
    src: config.preGameScreen.titleImage,
    style: {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        objectFit: "contain",
        width: config.preGameScreen.titleImageSize,
        height: config.preGameScreen.titleImageSize
    }
});

let card = React.createElement("div", {
    style: {
        backgroundColor: config.preGameScreen.cardColor,
        width: "350px",
        height: "450px",
        borderRadius: "30px",

        textAlign: "center",

        position: "absolute",
        top: "0",
        bottom: "0",
        right: "0",
        left: "0",
        margin: "auto",

        boxShadow: "0px 0px 5px 0px rgba(0,0,0,0.75)"
    }
}, titleImage, titleText, playButton, leaderboardButton, soundButton);

let preGameScreenEl = React.createElement("div", {}, card);

module.exports = preGameScreenEl;
