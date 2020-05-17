let $ = require("jquery");

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
    },
    id: "button",
    style: buttonStyle
}, config.preGameScreen.playButtonText);

let leaderboardButton;

if (config.preGameScreen.showLeaderboardButton) {
    leaderboardButton = React.createElement("button", {
        onClick: () => {

        },
        id: "button",
        style: buttonStyle
    }, config.preGameScreen.leaderboardButtonText);
}

let titleText = React.createElement("h1", {
    style: {
        marginBottom: "20px"
    }
}, config.preGameScreen.titleText);

let titleImage = React.createElement("img", { 
    src: config.preGameScreen.titleImage,
    style: {
        display: "block",
        marginLeft: "auto",
        marginRight: "auto"
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
}, titleImage, titleText, playButton, leaderboardButton);

let preGameScreenEl = React.createElement("div", {}, card);

module.exports = preGameScreenEl;
