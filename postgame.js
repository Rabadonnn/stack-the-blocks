let config = require("visual-config-exposer").default.postGameScreen;

let buttonStyle = {
    width: "60%",
    height: "15%",
    borderRadius: "20px",
    fontSize: "180%",
    backgroundColor: config.buttonColor,
    color: config.textColor,
    border: "none",
    outline: "none",
    marginTop: "10px"
};

let textStyle = {
    fontSize: "30px",
    marginTop: "10px"
}

let components = []

if (config.showText) {
    components.push(
        React.createElement("div", {
            style: textStyle
        }, config.customText),
    );
}

if (config.showLeadeboardButtonPostGameScreen) {
    components.push(React.createElement("button", {
        style: buttonStyle,
        id: "button",
        onClick: () => {

        }
    }, config.leaderboardButtonText));
}

if (config.showCTA) {
    components.push(React.createElement("p", {
        style: textStyle 
    }, config.ctaText));

    components.push(React.createElement("button", {
        style: buttonStyle,
        id: "button",
        onClick: () => {
            window.open(config.ctaUrl);
        }
    }, config.ctaButtonText))
}

class PostGameScreen extends React.Component {
    render() {
        return React.createElement("div", {
                style: {
                    width: "350px",
                    height: (config.showCTA && config.showLeadeboardButtonPostGameScreen && config.showText) ? "420px" : "350px",
                    backgroundColor: config.cardColor,
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
            },
            React.createElement("div", {
                style: {
                    fontSize: "30px",
                    marginTop: "10px"
                }
            }, config.scoreText + window.score),
            React.createElement("button", {
                onClick: () => {
                    window.restartGame();
                },
                id: "button",
                style: buttonStyle,
            }, config.playButtonText),
            ...components
        );
    }
}

module.exports = PostGameScreen;
