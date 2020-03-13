import React, { Component } from 'react';

import './index.css';

interface GameBlockProps {
    img: string;
    description: string;
}

export default class GameBlock extends Component<GameBlockProps> {

    render() {
        const { img, description } = this.props;
        return (
            <div className="div-game-block-display">
                <img className="img-game-block" src = {img} alt="game" />
                <div>
                    <p className="p-game-block-description">
                        {
                            description
                        }
                    </p>               
                </div>
            </div>
        )
    }

}